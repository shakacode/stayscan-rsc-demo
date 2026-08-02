# frozen_string_literal: true

FactoryBot.define do
  # Aggregate listing: owner 0, aggregates 1-3 OTA channels. Each OTA is offered at
  # ~30% per roll; a random one is forced when none are rolled so every
  # aggregate_listing has at least one channel (the check constraint requires it).
  factory :aggregate_listing, class: "Listing" do
    origin { "aggregated" }
    title { Faker::Address.community }
    lat { 8.9 + rand(-0.1..0.1) }
    lng { -140.4 + rand(-0.1..0.1) }
    preview_price { rand(80..500) }
    bedrooms { rand(1..5) }
    bathrooms { rand(1..3) }
    max_guests { rand(2..10) }

    transient { channel_probability { 0.30 } }

    after(:build) do |listing, ev|
      Listing::OTA_CHANNELS.each do |assoc|
        listing.public_send(:"#{assoc}=", build(assoc)) if rand < ev.channel_probability
      end
      if Listing::OTA_CHANNELS.none? { |assoc| listing.public_send(assoc).present? }
        forced = Listing::OTA_CHANNELS.sample
        listing.public_send(:"#{forced}=", build(forced))
      end
    end

    trait :with_photos do
      transient { photos_count { 12 } }
      photos { Array.new(photos_count) { "images/listings/#{SecureRandom.hex(6)}.jpg" } }
    end

    # top_rated per ListingScore#top_rated?: highly rated AND reviewed AND trusted.
    trait :top_rated do
      blended_rating { 4.9 }
      reviews_count { 30 }
      verified_owner_id { create(:user).id }
    end
  end

  # Hostflow-backed "book direct" listing: a real, verified owner.
  factory :hostflow_listing, class: "Listing" do
    origin { "host_managed" }
    association :owner, factory: :user
    title { Faker::Address.community }
    lat { 8.9 }
    lng { -140.4 }
    preview_price { rand(80..500) }

    after(:build) { |listing| listing.hostflow_unit ||= build(:hostflow_unit, owner: listing.owner) }
    after(:create) { |listing| listing.update_columns(verified_owner_id: listing.owner_id) }
  end
end
