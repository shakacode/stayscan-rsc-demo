# frozen_string_literal: true

module Normalizers
  module Hostflow
    class Calendar
      # Zip the parallel nightly/available/min_stay arrays into per-night entries.
      def self.call(raw)
        start = Date.parse(raw.fetch("start_date"))
        nightly = Array(raw["nightly"])
        available = Array(raw["available"])
        min_stay = Array(raw["min_stay"])
        nights = nightly.each_index.map do |i|
          NormalizedNight.new(date: start + i, available: available[i], price: nightly[i], min_stay: min_stay[i])
        end
        NormalizedCalendar.new(start_date: start, nights: nights)
      end
    end
  end
end
