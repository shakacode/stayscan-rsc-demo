# frozen_string_literal: true

# Settles ONE channel of a quote: compute our price from the stored
# listing_channel, cross-check the provider's live quote over HTTP (OTAs only),
# detect a calendar conflict (provider quotes but our stored calendar says
# blocked), write that channel's QuoteSettlement, and broadcast. Channels settle
# independently, so one failing channel never blocks the others. Runs
# concurrently, so the roll-up onto the quote happens under a lock.
class SettleChannelQuoteJob < ApplicationJob
  queue_as :default

  OTA_CHANNELS = %w[airhive vacario lodgeo].freeze

  def perform(quote_id, provider_type)
    quote = Quote.find(quote_id)
    channel = quote.listing.listing_channels.find_by(provider_type:)
    return unless channel

    apply_success(quote, provider_type, price(quote, channel, provider_type))
  rescue ChannelDataApi::Error => e
    apply_error(quote, provider_type, e)
  end

  private

  def price(quote, channel, provider_type)
    breakdown = Quote::Calculations::Total.call(channel:, **stay_params(quote))
    available = available?(channel, quote)
    live_total = OTA_CHANNELS.include?(provider_type) ? fetch_live_total(quote, provider_type) : nil
    {
      state: available ? "priced" : "unavailable",
      total: breakdown.total,
      live_total: live_total&.round(2),
      calendar_conflict: live_total.present? && !available,
      breakdown: { "rent" => breakdown.rent.to_f, "fees" => breakdown.fees.to_f, "tax" => breakdown.tax.to_f }
    }
  end

  def stay_params(quote)
    { check_in: quote.check_in, check_out: quote.check_out,
      adults: quote.adults, children: quote.children, infants: quote.infants, pets: quote.pets }
  end

  def available?(channel, quote)
    connection = ActiveRecord::Base.connection
    connection.select_value(
      "SELECT available_total_price(#{channel.id.to_i}, #{connection.quote(quote.check_in)}, " \
      "#{connection.quote(quote.check_out)}, #{quote.adults.to_i}, #{quote.children.to_i}, " \
      "#{quote.infants.to_i}, #{connection.quote(quote.pets)})"
    ).present?
  end

  # Orchestration only (not schema translation): pick the client call + normalizer
  # for the provider, then delegate parsing to that provider's Quote normalizer.
  def fetch_live_total(quote, provider_type)
    api = ChannelDataApi.new
    listing = quote.listing
    normalized =
      case provider_type
      when "airhive"
        record = listing.airhive_listing
        Normalizers::Airhive::Quote.call(api.airhive_quote(record.native_id, quote.check_in, quote.check_out, quote.adults))
      when "vacario"
        record = listing.vacario_listing
        Normalizers::Vacario::Quote.call(api.vacario_quote(record.native_id, record.unit_code, quote.check_in, quote.check_out, quote.adults))
      when "lodgeo"
        record = listing.lodgeo_listing
        Normalizers::Lodgeo::Quote.call(api.lodgeo_quote(record.native_id, record.native_unit_id, quote.check_in, quote.check_out, quote.adults))
      end
    normalized.rent_total.to_f + normalized.cleaning_fee.to_f
  end

  def apply_success(quote, provider_type, result)
    settlement = settle!(quote, provider_type, result.merge(error_code: nil))
    broadcast(quote, provider_type, status: settlement.state, total: settlement.total&.to_f,
                                    live_total: settlement.live_total&.to_f,
                                    calendar_conflict: settlement.calendar_conflict)
  end

  def apply_error(quote, provider_type, error)
    settle!(quote, provider_type,
            state: "failed", total: nil, live_total: nil, calendar_conflict: false,
            breakdown: {}, error_code: error.class.name.demodulize)
    broadcast(quote, provider_type, status: "error")
  end

  # Upsert this channel's leg, then re-derive the parent state — both under the
  # quote lock, because sibling channels are settling at the same time.
  def settle!(quote, provider_type, attrs)
    quote.with_lock do
      settlement = quote.settlements.find_or_initialize_by(provider_type:)
      settlement.update!(**attrs, settled_at: Time.current)
      quote.update!(state: "finished") if all_channels_settled?(quote)
      settlement
    end
  end

  def all_channels_settled?(quote)
    expected = quote.listing.listing_channels.pluck(:provider_type)
    settled = quote.settlements.reload.settled.pluck(:provider_type)
    (expected - settled).empty?
  end

  # The browser merges these by provider, so this payload shape is a contract.
  def broadcast(quote, provider_type, status:, total: nil, live_total: nil, calendar_conflict: false)
    QuotesChannel.broadcast_to(quote, {
      "provider" => provider_type,
      "status" => status,
      "total" => total,
      "liveTotal" => live_total,
      "contradiction" => calendar_conflict
    })
  end
end
