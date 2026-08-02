# frozen_string_literal: true

# A price request for a listing over a date range. Each channel's leg is a
# QuoteSettlement that lands on its own schedule; the quote itself only knows the
# stay and rolls up whatever has settled so far.
class Quote < ApplicationRecord
  STATES = %w[pending processing finished failed].freeze

  belongs_to :listing
  has_many :settlements, class_name: "QuoteSettlement", dependent: :destroy, inverse_of: :quote

  enum :state, STATES.index_with(&:itself)

  def nights
    (check_out - check_in).to_i
  end

  # The cheapest leg that came back with a price, or nil while none has.
  def top_deal
    settlements.select(&:priced?).min_by(&:total)
  end

  # Per-channel legs keyed by provider, for callers that want random access.
  def deals
    settlements.index_by(&:provider_type)
  end

  # The cheapest channel plus what you save versus the priciest priced channel
  # (absolute + percentage). Domain arithmetic lives here, not in the JSON builder.
  def top_deal_with_savings
    best = top_deal
    return nil unless best

    dearest = settlements.select(&:priced?).map(&:total).max
    savings = dearest ? (dearest - best.total).round(2) : 0

    {
      provider: best.provider_type,
      total: best.total.to_f,
      savingsAbsolute: savings.to_f,
      savingsPercentage: dearest.to_f.positive? ? ((savings / dearest) * 100).round : 0
    }
  end
end
