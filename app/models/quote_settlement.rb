# frozen_string_literal: true

# One channel's leg of a quote. Channels settle independently, so the lifecycle
# lives here rather than on the parent quote: `pending` until that channel's job
# lands, then `priced`, `unavailable` (our stored calendar blocks the stay) or
# `failed` (the provider errored). A quote is finished once no leg is pending.
class QuoteSettlement < ApplicationRecord
  STATES = %w[pending priced unavailable failed].freeze

  belongs_to :quote

  enum :state, STATES.index_with(&:itself)

  scope :settled, -> { where.not(state: "pending") }

  def settled?
    !pending?
  end
end
