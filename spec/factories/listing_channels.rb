# frozen_string_literal: true

FactoryBot.define do
  factory :listing_channel do
    association :listing, factory: :aggregate_listing
    provider_type { "airhive" }
    nightly_price_default { 150 }
    min_stay_default { 1 }
    stay_availability_default { true }

    trait :priced_nights do
      calendar_window { Date.new(2026, 1, 1)...Date.new(2026, 1, 31) }

      after(:create) do |channel|
        channel.channel_rates.create!(during: channel.calendar_window, nightly_price: 220, min_stay: 1)
      end
    end
  end
end
