# frozen_string_literal: true

class Listing
  # One listing tile — the shape the browse view grid + the user/host listing grids render.
  # Pure reads (preview_price is a denormalized column); shared so both index and
  # profile pages ship identical tiles.
  class TileJson
    def initialize(listing)
      @listing = listing
    end

    def as_json(*)
      {
        id: @listing.id,
        title: @listing.title,
        city: @listing.city,
        kind: @listing.kind,
        url: "/listings/#{@listing.id}",
        photos: Array(@listing.photos).first(5),
        rating: @listing.blended_rating&.to_f,
        reviewsCount: @listing.reviews_count,
        previewPrice: @listing.preview_price&.to_f,
        capacity: { bedrooms: @listing.bedrooms, bathrooms: @listing.bathrooms, maxGuests: @listing.max_guests },
        coordinates: { lat: @listing.lat&.to_f, lng: @listing.lng&.to_f },
        channels: @listing.listing_channels.map(&:provider_type),
        badges: {
          bookDirect: @listing.kind == :book_direct,
          topRated: @listing.top_rated?,
          verified: @listing.verified_owner_id.present?
        }
      }
    end
  end
end
