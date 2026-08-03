# frozen_string_literal: true

module FakeProviders
  # Shared deterministic content primitives. Each provider formats these into its
  # OWN distinct raw schema (nested vs flat vs XML-ish) and its own calendar
  # encoding (per-day array vs date ranges vs packed string), so the normalizers
  # do real translation work.
  module Synthetic
    ADJECTIVES = %w[Oceanfront Sunlit Secluded Breezy Hillside Palm-shaded Modern Rustic Cliffside Lagoon].freeze
    NOUNS = %w[Villa Bungalow Cottage Retreat Hale Hideaway Loft Casita Estate Studio].freeze
    CITIES = [ "Ondera Cove", "Kivora", "Veska Reef", "Marisel", "Selora Town", "Sabel Bay", "Altara Point" ].freeze
    HOST_FIRST = %w[Kai Nalu Mara Theo Iona Sela Rhys Nina Owen Lani].freeze
    HOST_LAST = %w[Alana Brantley Cortez Devlin Espina Farrow Grover Halloran].freeze

    # Description word banks: obviously fictional, no real addresses (P: content quality).
    DESC_SCENES = [
      "Wake to trade winds off the water", "Steps from the tide pools", "Set above a quiet cove",
      "Tucked into a palm grove", "Perched on the reef line", "Overlooking the harbor lights"
    ].freeze
    DESC_INTERIORS = [
      "an open veranda and a full island kitchen", "vaulted ceilings and a shaded reading nook",
      "a chef's kitchen and sea-glass tilework", "hand-woven textiles and a soaking tub",
      "floor-to-ceiling glass and a driftwood bar"
    ].freeze
    DESC_CLOSERS = [
      "Perfect for slow mornings and sunset swims.", "Bring the whole crew and stay a while.",
      "Snorkel gear waits by the door.", "The best ceviche shop is a short stroll away.",
      "Come for the quiet; stay for the light."
    ].freeze

    # 34-entry amenity catalog mirrored by the app's Amenity seed (mapped by code
    # == bit_position). Providers emit CODES, not labels, in their own encodings.
    AMENITY_CODES = (0..33).to_a.freeze
    AMENITY_MIN = 4
    AMENITY_MAX = 18

    module_function

    def title(rng)
      "#{ADJECTIVES.sample(random: rng)} #{NOUNS.sample(random: rng)}"
    end

    def city(rng)
      CITIES.sample(random: rng)
    end

    def host_name(rng)
      "#{HOST_FIRST.sample(random: rng)} #{HOST_LAST.sample(random: rng)}"
    end

    def bedrooms(rng) = rng.rand(1..5)
    def bathrooms(rng) = rng.rand(1..3)
    def max_guests(rng, bedrooms) = (bedrooms * 2) + rng.rand(0..2)
    def base_price(rng) = rng.rand(90..480)
    def rating(rng) = (3.8 + (rng.rand * 1.2)).round(1)
    def review_count(rng) = rng.rand(0..120)

    # Individual review stars, skewed high (mean ~4.4) like real guest reviews.
    REVIEW_STAR_WEIGHTS = [ 3, 4, 4, 5, 5, 5 ].freeze
    def review_stars(rng) = REVIEW_STAR_WEIGHTS.sample(random: rng)
    def lat(rng) = (8.7 + (rng.rand * 0.4)).round(6)
    def lng(rng) = (-140.7 + (rng.rand * 0.5)).round(6)

    def photo_urls(rng, count)
      Array.new(count) { |i| "https://cdn.example/#{rng.hex(6)}/#{i}.jpg" }
    end

    def description(rng)
      "#{DESC_SCENES.sample(random: rng)}, this #{NOUNS.sample(random: rng).downcase} pairs " \
        "#{DESC_INTERIORS.sample(random: rng)}. #{DESC_CLOSERS.sample(random: rng)}"
    end

    # 4..18 unique amenity codes (bit positions) for one channel's view of a property.
    def amenity_codes(rng)
      count = rng.rand(AMENITY_MIN..AMENITY_MAX)
      AMENITY_CODES.sample(count, random: rng).sort
    end

    # Canonical per-night availability the providers each re-encode differently.
    #
    # Real calendars come in runs, and everything downstream depends on that: a
    # booking occupies consecutive nights rather than each night flipping a coin,
    # and a rate holds for a stretch rather than moving every night. Prices ride
    # a seasonal wave but are quantised into bands so they change at boundaries;
    # weekends cost more and carry a 2-night minimum.
    BOOKING_NIGHTS = (2..7).freeze
    PRICE_BAND = 10 # prices settle on multiples of this, so a band spans days

    def calendar_nights(rng, start_date, days:)
      base = base_price(rng)
      demand = 0.30 + (rng.rand * 0.30) # per-listing baseline booked rate (30-60%)
      booked = booked_nights(rng, days, demand)

      (0...days).map do |i|
        date = start_date + i
        weekend = [ 0, 6 ].include?(date.wday)
        seasonal = 1 + (0.1 * Math.sin(i / 30.0))
        price = (base * (weekend ? 1.25 : 1.0) * seasonal / PRICE_BAND).round * PRICE_BAND
        {
          date: date,
          available: !booked.include?(i),
          price: price,
          min_stay: weekend ? 2 : 1
        }
      end
    end

    # Occupancy as stays, not as independent nights: walk the window, and where
    # demand says so, book a run of consecutive nights before moving on.
    def booked_nights(rng, days, demand)
      booked = Set.new
      night = 0
      while night < days
        seasonal_demand = (demand + (0.15 * Math.sin(night / 45.0))).clamp(0.1, 0.85)
        # `demand` is a target occupancy, but each booking fills several nights
        # and is followed by a gap, so the per-night chance of *starting* one is
        # a fraction of it — otherwise a 45% target lands nearer 60% occupied.
        if rng.rand < (seasonal_demand / 3.0)
          stay = rng.rand(BOOKING_NIGHTS)
          stay.times { |offset| booked << (night + offset) }
          night += stay
          # A turnover gap between guests, so stays do not merge into one block.
          night += 1 + rng.rand(2)
        else
          night += 1
        end
      end
      booked
    end
  end
end
