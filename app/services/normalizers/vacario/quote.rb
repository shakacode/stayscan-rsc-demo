# frozen_string_literal: true

module Normalizers
  module Vacario
    class Quote
      def self.call(raw)
        NormalizedQuote.new(rent_total: raw["rent_total_usd"], cleaning_fee: raw["cleaning_fee_usd"],
                            guests: raw["guest_count"])
      end
    end
  end
end
