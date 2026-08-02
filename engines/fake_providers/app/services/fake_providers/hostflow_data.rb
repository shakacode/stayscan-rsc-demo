# frozen_string_literal: true

module FakeProviders
  # Hostflow (VRS) raw schema: token-authenticated, paginated property list, and
  # per-unit rate arrays. Distinct from the OTAs (auth handshake + pagination).
  module HostflowData
    PAGE_SIZE = 25

    module_function

    def issue_token
      { access_token: "hf-#{SecureRandom.hex(16)}", token_type: "bearer", expires_in: 3600 }
    end

    def properties(page)
      page = [ page.to_i, 1 ].max
      total = 137 # deterministic fixed catalog size
      total_pages = (total.to_f / PAGE_SIZE).ceil
      start = (page - 1) * PAGE_SIZE
      units = (start...[ start + PAGE_SIZE, total ].min).map { |i| unit_summary("hf-unit-#{i + 1}") }
      { page: page, total_pages: total_pages, total: total, units: units }
    end

    def unit_summary(native_id)
      rng = Deterministic.rng("hostflow", native_id, "details")
      beds = Synthetic.bedrooms(rng)
      {
        unit_id: native_id,
        name: Synthetic.title(rng),
        bedrooms: beds,
        bathrooms: Synthetic.bathrooms(rng),
        max_occupancy: Synthetic.max_guests(rng, beds),
        latitude: Synthetic.lat(rng),
        longitude: Synthetic.lng(rng),
        manager_name: Synthetic.host_name(rng),
        description: Synthetic.description(rng),
        amenity_codes: Synthetic.amenity_codes(rng),
        image_urls: Synthetic.photo_urls(rng, 14),
        rating: Synthetic.rating(rng),
        reviews: Synthetic.review_count(rng)
      }
    end

    def rates(native_id, start_date, days)
      rng = Deterministic.rng("hostflow", native_id, "calendar")
      nights = Synthetic.calendar_nights(rng, start_date, days: days)
      {
        unit_id: native_id,
        start_date: start_date.iso8601,
        nightly: nights.map { |night| night[:price] },
        available: nights.map { |night| night[:available] },
        min_stay: nights.map { |night| night[:min_stay] },
        cleaning_fee: Deterministic.rng("hostflow", native_id, "clean").rand(25..120)
      }
    end
  end
end
