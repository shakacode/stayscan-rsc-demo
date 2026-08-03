# frozen_string_literal: true

module Normalizers
  module Airhive
    class Quote
      def self.call(raw)
        q = raw.fetch("quote")
        NormalizedQuote.new(rent_total: q["nightly_subtotal"], cleaning_fee: q["cleaning"], guests: q["guests"])
      end
    end
  end
end
