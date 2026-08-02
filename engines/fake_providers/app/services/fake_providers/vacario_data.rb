# frozen_string_literal: true

module FakeProviders
  # Vacario raw schema: FLAT snake_case with a native_id + unit_code pair; calendar
  # is collapsed into date-range spans (not per night).
  module VacarioData
    module_function

    def details(native_id, unit_code)
      rng = Deterministic.rng("vacario", native_id, unit_code, "details")
      beds = Synthetic.bedrooms(rng)
      {
        native_id: native_id,
        unit_code: unit_code,
        property_ref: "LDG-#{rng.rand(10_000..99_999)}",
        title: Synthetic.title(rng),
        bedroom_count: beds,
        bathroom_count: Synthetic.bathrooms(rng),
        sleeps: Synthetic.max_guests(rng, beds),
        latitude: Synthetic.lat(rng),
        longitude: Synthetic.lng(rng),
        city_name: Synthetic.city(rng),
        country_code: "US",
        owner_full_name: Synthetic.host_name(rng),
        nightly_rate_usd: Synthetic.base_price(rng),
        cleaning_fee_usd: rng.rand(35..150),
        review_score: Synthetic.rating(rng),
        review_count: Synthetic.review_count(rng),
        summary_text: Synthetic.description(rng),
        amenity_codes: Synthetic.amenity_codes(rng).join(","),
        image_urls: Synthetic.photo_urls(rng, 12)
      }
    end

    def calendar(native_id, unit_code, start_date, days)
      rng = Deterministic.rng("vacario", native_id, unit_code, "calendar")
      nights = Synthetic.calendar_nights(rng, start_date, days: days)
      { availability: compress_spans(nights) }
    end

    def quote(native_id, unit_code, check_in, check_out, guests)
      rng = Deterministic.rng("vacario", native_id, unit_code, "calendar")
      nights = Synthetic.calendar_nights(rng, check_in, days: (check_out - check_in).to_i)
      {
        native_id: native_id,
        unit_code: unit_code,
        rent_total_usd: nights.sum { |night| night[:price] },
        cleaning_fee_usd: Deterministic.rng("vacario", native_id, unit_code, "clean").rand(35..150),
        guest_count: guests
      }
    end

    def reviews(native_id, unit_code)
      rng = Deterministic.rng("vacario", native_id, unit_code, "reviews")
      {
        native_id: native_id,
        reviews: Array.new(Synthetic.review_count(rng).clamp(0, 8)) do
          { reviewer_name: Synthetic.host_name(rng), score: Synthetic.review_stars(rng), comment: "Loved it." }
        end
      }
    end

    # Collapse consecutive nights with the same (status, rate, min_stay) into spans.
    def compress_spans(nights)
      spans = []
      nights.each do |night|
        key = [ night[:available], night[:price], night[:min_stay] ]
        if spans.last && spans.last[:__key] == key && spans.last[:__next] == night[:date]
          spans.last[:to] = (night[:date] + 1).iso8601
          spans.last[:__next] = night[:date] + 1
        else
          spans << {
            from: night[:date].iso8601,
            to: (night[:date] + 1).iso8601,
            status: night[:available] ? "open" : "booked",
            rate: night[:price],
            min_stay: night[:min_stay],
            __key: key,
            __next: night[:date] + 1
          }
        end
      end
      spans.each { |span| span.delete(:__key) && span.delete(:__next) }
    end
  end
end
