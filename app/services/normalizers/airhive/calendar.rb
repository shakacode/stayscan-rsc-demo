# frozen_string_literal: true

module Normalizers
  module Airhive
    class Calendar
      def self.call(raw)
        nights = Array(raw["days"]).map do |day|
          NormalizedNight.new(date: Date.parse(day["date"]), available: day["available"],
                              price: day["price"], min_stay: day["min_nights"])
        end
        NormalizedCalendar.new(start_date: nights.first&.date, nights: nights)
      end
    end
  end
end
