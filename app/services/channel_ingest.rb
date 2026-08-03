# frozen_string_literal: true

require "bigdecimal"

# Writes one channel's slice of a listing: the `listing_channels` row and the
# calendar ranges behind it. A provider's normalized calendar arrives as nights;
# consecutive nights that agree collapse into a `channel_rates` range, and closed
# runs into a `channel_blackouts` range, so a two-year season is a few hundred
# rows rather than a row (or a bit) per night.
#
# What actually differs between channels is a couple of commercial terms, so they
# are a table of profiles rather than a subclass each — the translation work that
# *is* per-provider lives in the normalizers, where the raw schemas differ.
class ChannelIngest
  # Terms we agreed with each channel: what they take, and the tax we collect.
  Profile = Data.define(:fee_percent, :tax_rate)

  DEFAULT_TAX_RATE = BigDecimal("0.08")

  PROFILES = {
    "airhive" => Profile.new(fee_percent: BigDecimal("0.14"), tax_rate: DEFAULT_TAX_RATE),
    "vacario" => Profile.new(fee_percent: BigDecimal("0.10"), tax_rate: DEFAULT_TAX_RATE),
    "lodgeo" => Profile.new(fee_percent: BigDecimal("0.15"), tax_rate: DEFAULT_TAX_RATE),
    # Direct channels charge us nothing — that is the point of booking direct.
    "hostflow" => Profile.new(fee_percent: BigDecimal("0"), tax_rate: DEFAULT_TAX_RATE),
    "rentora" => Profile.new(fee_percent: BigDecimal("0"), tax_rate: DEFAULT_TAX_RATE),
    "stayscan" => Profile.new(fee_percent: BigDecimal("0"), tax_rate: DEFAULT_TAX_RATE)
  }.freeze

  def self.call(listing, channel:, details:, calendar:)
    new(listing, channel:, details:, calendar:).call
  end

  def initialize(listing, channel:, details:, calendar:)
    @listing = listing
    @channel = channel.to_s
    @profile = PROFILES.fetch(@channel)
    @details = details
    @calendar = calendar
  end

  def call
    row = @listing.listing_channels.find_or_initialize_by(provider_type: @channel)
    apply_window(row)
    apply_terms(row)
    row.last_synced_at = Time.current
    row.save!
    replace_calendar(row)
    row
  end

  private

  def apply_window(row)
    nights = @calendar.nights
    start_date = @calendar.start_date
    row.calendar_window = start_date...(start_date + nights.size)
    # Everything we were told about is inside the window, so nights beyond it are
    # not assumed bookable.
    row.stay_availability_default = false

    prices = nights.filter_map(&:price)
    stays = nights.filter_map(&:min_stay)
    row.nightly_price_floor = prices.min
    row.min_stay_floor = stays.min
    row.min_stay_ceiling = stays.max
  end

  def apply_terms(row)
    row.nightly_price_default = @details.base_price
    row.static_fee = @details.cleaning_fee
    row.channel_fee_percent = @profile.fee_percent
    row.tax_rate = @profile.tax_rate
  end

  # Rewrite the calendar from scratch: the feed is the whole truth for the window
  # it covers, and the exclusion constraints would reject a leftover overlap.
  def replace_calendar(row)
    nights = @calendar.nights
    start_date = @calendar.start_date
    row.channel_blackouts.delete_all
    row.channel_rates.delete_all
    now = Time.current

    blackouts = runs(nights, start_date) { |night| night.available }
                .reject { |run| run[:value] }
                .map { |run| { listing_channel_id: row.id, kind: "stay", during: run[:during], created_at: now, updated_at: now } }

    rates = runs(nights, start_date) { |night| [ night.price, night.min_stay ] }.map do |run|
      price, min_stay = run[:value]
      { listing_channel_id: row.id, during: run[:during], nightly_price: price,
        min_stay: min_stay, created_at: now, updated_at: now }
    end

    # One statement each: a season is hundreds of ranges and every insert is
    # checked against the exclusion constraint.
    ChannelBlackout.insert_all!(blackouts) if blackouts.any?
    ChannelRate.insert_all!(rates) if rates.any?

    # delete_all emptied the loaded associations and the bulk insert went around
    # them, so drop the caches or callers read yesterday's calendar.
    row.channel_blackouts.reset
    row.channel_rates.reset
  end

  # Collapse consecutive nights whose yielded value is equal into one range.
  def runs(nights, start_date)
    nights.each_with_index.chunk_while { |(a, _), (b, _)| yield(a) == yield(b) }.map do |chunk|
      { value: yield(chunk.first.first),
        during: (start_date + chunk.first.last)...(start_date + chunk.last.last + 1) }
    end
  end
end
