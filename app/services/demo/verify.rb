# frozen_string_literal: true

module Demo
  # Reports the production-shape contract as a table of dimension / target /
  # actual / pass. Structural rows hold at any volume; volume rows only pass on
  # the full profile. `rails demo:verify` prints this and exits non-zero on any
  # structural failure.
  class Verify
    Row = Data.define(:dimension, :actual, :pass, :kind)

    def self.call
      new.call
    end

    def call
      [
        volume("Listings >= 3000", Listing.count, Listing.count >= 3000),
        volume(">= 85% aggregate_listings", "#{(aggregate_listing_fraction * 100).round}%", aggregate_listing_fraction >= 0.85),
        volume("Destinations >= 6", Location.where(kind: "area").count, Location.where(kind: "area").count >= 6),
        volume("Densest area >= 800", densest_area_count, densest_area_count >= 800),
        volume("Hostflow listings >= 200", hostflow_count, hostflow_count >= 200),
        volume("Users >= 500", User.count, User.count >= 500),
        volume("Reviews present", Review.count, Review.count.positive?),
        volume("AI content on >= 60%", "#{(ai_content_fraction * 100).round}%", ai_content_fraction >= 0.60),
        structural("Every aggregate_listing has 1-3 channels", aggregate_listings_channel_qty_ok?),
        structural("Every listing has a trigger searchable row", every_listing_search_row?),
        structural("Every listing has 4-18 amenities", amenities_per_listing_ok?),
        structural("Aggregated listings are ownerless", aggregate_listings.exists? && aggregate_listings.where.not(owner_id: nil).none?),
        structural("Hostflow listings verified + owned", hostflow_verified?),
        structural("Calendars are not all-available", calendars_realistic?),
        structural("Calendar occupancy in a realistic band (20-65%)", occupancy_realistic?),
        structural("Photos unique across listings", photos_unique?),
        structural("content_pages seeded (home/faq/tos/privacy)", content_pages_ok?),
        structural("blended_rating mean in 4.0..4.8", rating_mean_ok?)
      ]
    end

    private

    def volume(dimension, actual, pass)
      Row.new(dimension:, actual:, pass:, kind: :volume)
    end

    def structural(dimension, pass)
      Row.new(dimension:, actual: pass ? "yes" : "no", pass:, kind: :structural)
    end

    def aggregate_listings = Listing.where(origin: "aggregated")

    def aggregate_listing_fraction
      total = Listing.count
      total.zero? ? 0 : aggregate_listings.count.to_f / total
    end

    def hostflow_count = Listing.where.not(hostflow_unit_id: nil).count

    def densest_area_count
      Location.where(kind: "area").maximum(:listings_count).to_i
    end

    def ai_content_fraction
      total = Listing.count
      return 0 if total.zero?

      Listing.where("ai_content_host_summary <> '{}'::jsonb").count.to_f / total
    end

    def amenities_per_listing_ok?
      Listing.exists? && Listing.where.not("cardinality(amenity_ids) BETWEEN 4 AND 18").none?
    end

    def content_pages_ok?
      ContentPage.where(slug: ContentPage::SLUGS).count == ContentPage::SLUGS.size
    end

    def aggregate_listings_channel_qty_ok?
      aggregate_listings.exists? && aggregate_listings.find_each.all? { |listing| listing.channel_qty.between?(1, 3) }
    end

    def every_listing_search_row?
      Listing.count.positive? && Listing.count == ListingSearchRow.count
    end

    def hostflow_verified?
      Listing.where.not(hostflow_unit_id: nil).where(verified_owner_id: nil).none?
    end

    # A channel with a window but no blackouts at all would mean a calendar that
    # is open every single night, which no real listing looks like.
    def calendars_realistic?
      ListingChannel.where.not(calendar_window: nil).joins(:channel_blackouts).exists?
    end

    # Mean booked fraction over a sample of channels (a '0' bit == booked night).
    def occupancy_realistic?
      channels = ListingChannel.where.not(calendar_window: nil)
                               .includes(:channel_blackouts).limit(300)
      return false if channels.empty?

      booked = channels.map { |channel| booked_fraction(channel) }
      mean = booked.sum / booked.size
      mean.between?(0.20, 0.65)
    end

    # Share of the known window covered by stay blackouts.
    def booked_fraction(channel)
      window = channel.calendar_window
      nights = (window.end - window.first).to_i
      return 0.0 unless nights.positive?

      blocked = channel.channel_blackouts.select(&:stay?)
                       .sum { |b| (b.during.end - b.during.first).to_i }
      blocked.to_f / nights
    end

    def photos_unique?
      with_photos = Listing.where("cardinality(photos) > 0")
      with_photos.count == with_photos.distinct.count(:photos)
    end

    def rating_mean_ok?
      mean = Listing.where.not(blended_rating: nil).average(:blended_rating)
      mean && mean.between?(4.0, 4.8)
    end
  end
end
