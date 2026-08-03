# frozen_string_literal: true

module Normalizers
  module Lodgeo
    class Calendar
      # Unpack the "YNYY..." availability string + parallel CSV price/min-stay lists.
      def self.call(raw)
        avail = raw.fetch("Availability")
        start = Date.parse(avail["StartDate"])
        prices = avail["Prices"].to_s.split(",")
        min_stays = avail["MinStay"].to_s.split(",")
        nights = avail["Calendar"].to_s.chars.each_with_index.map do |flag, i|
          NormalizedNight.new(date: start + i, available: flag == "Y",
                              price: prices[i].to_i, min_stay: min_stays[i].to_i)
        end
        NormalizedCalendar.new(start_date: start, nights: nights)
      end
    end
  end
end
