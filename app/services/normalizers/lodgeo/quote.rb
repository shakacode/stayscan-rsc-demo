# frozen_string_literal: true

module Normalizers
  module Lodgeo
    class Quote
      def self.call(raw)
        q = raw.fetch("Quote")
        NormalizedQuote.new(rent_total: q["RentTotal"].to_f, cleaning_fee: q["CleaningFee"].to_f,
                            guests: q["Guests"].to_i)
      end
    end
  end
end
