# frozen_string_literal: true

module Normalizers
  module Vacario
    class Calendar
      # Expand each date-range span back into per-night entries.
      def self.call(raw)
        nights = Array(raw["availability"]).flat_map do |span|
          (Date.parse(span["from"])...Date.parse(span["to"])).map do |date|
            NormalizedNight.new(date: date, available: span["status"] == "open",
                                price: span["rate"], min_stay: span["min_stay"])
          end
        end
        NormalizedCalendar.new(start_date: nights.first&.date, nights: nights)
      end
    end
  end
end
