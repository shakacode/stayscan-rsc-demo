# frozen_string_literal: true

# A display currency. `rate_to_usd` is the USD value of one unit of this
# currency (USD itself is 1.0).
class Currency < ApplicationRecord
  def to_usd(amount)
    (amount.to_d * rate_to_usd).round(2)
  end
end
