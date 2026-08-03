# frozen_string_literal: true

FactoryBot.define do
  factory :review do
    association :listing, factory: :aggregate_listing
    provider_type { "airhive" }
    author_name { Faker::Name.first_name }
    rating { rand(3..5) }
    title { Faker::Lorem.sentence(word_count: 3) }
    content { Faker::Lorem.paragraph }
  end

  factory :amenity do
    sequence(:name) { |n| "Amenity #{n}" }
    sequence(:bit_position) { |n| n % 64 }
  end

  factory :currency do
    sequence(:code) { |n| "C#{n}" }
    rate_to_usd { 1.0 }
  end

  factory :location do
    sequence(:path) { |n| "sy/area-#{n}" }
    name { Faker::Address.city }
    kind { "area" }
    min_lat { 8.5 }
    max_lat { 9.1 }
    min_lng { -140.7 }
    max_lng { -140.2 }
  end

  factory :trip_list do
    association :user
    sequence(:name) { |n| "Trip #{n}" }
    sequence(:slug) { |n| "trip-#{n}" }
  end
end
