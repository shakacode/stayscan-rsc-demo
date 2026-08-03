# frozen_string_literal: true

# The quote payload consumed by the listing-detail view booking widget: overall state,
# per-channel deals with their settling status, and the best deal with savings.
# Pure reads — the arithmetic lives on Quote / the async pipeline.
class QuoteJson
  # A channel whose leg has not been written yet reads as pending; a failed leg
  # surfaces as "error" so the row can explain itself.
  WIRE_STATUS = { "priced" => "priced", "unavailable" => "unavailable", "failed" => "error" }.freeze

  def initialize(quote)
    @quote = quote
  end

  def as_json(*)
    {
      id: @quote.id,
      state: @quote.state,
      checkIn: @quote.check_in.iso8601,
      checkOut: @quote.check_out.iso8601,
      nights: @quote.nights,
      guests: { adults: @quote.adults, children: @quote.children, infants: @quote.infants, pets: @quote.pets },
      deals: deals,
      topDeal: @quote.top_deal_with_savings
    }
  end

  private

  # One row per channel the listing is on, whether or not its leg has landed —
  # the widget renders the full table immediately and fills it in as legs settle.
  def deals
    settlements = @quote.settlements.index_by(&:provider_type)

    @quote.listing.listing_channels.map do |channel|
      settlement = settlements[channel.provider_type]
      {
        provider: channel.provider_type,
        status: settlement ? WIRE_STATUS.fetch(settlement.state, "pending") : "pending",
        total: settlement&.total&.to_f,
        liveTotal: settlement&.live_total&.to_f,
        contradiction: settlement&.calendar_conflict || false,
        error: settlement&.error_code,
        finished: settlement&.settled? || false
      }
    end
  end
end
