# frozen_string_literal: true

# Per-provider translation from each distinct raw schema into one shared
# normalized shape. One class per provider per data type — no shared
# `case provider` dispatch, because the raw schemas are genuinely different.
module Normalizers
  NormalizedDetails = Data.define(
    :title, :description, :bedrooms, :bathrooms, :beds, :max_guests, :lat, :lng, :city, :country,
    :host_name, :base_price, :cleaning_fee, :rating, :reviews_count, :photos, :amenities
  )
  NormalizedNight = Data.define(:date, :available, :price, :min_stay)
  NormalizedCalendar = Data.define(:start_date, :nights)
  NormalizedQuote = Data.define(:rent_total, :cleaning_fee, :guests)
  NormalizedReview = Data.define(:author, :rating, :body)
end
