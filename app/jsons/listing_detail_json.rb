# frozen_string_literal: true

# The listing-detail view detail payload. Ships the raw per-channel booking-engine
# data (bit-varying availability + price/min-stay arrays anchored at a start date)
# so the client `useBooking` machine can evaluate dates offline, plus decorated
# pricing rows, host, reviews, location, plans and gating. No pricing arithmetic
# here — that is Listing::PricingContext / the SQL total_price.
class ListingDetailJson
  PROVIDER_LABELS = {
    "airhive" => "Airhive", "vacario" => "Vacario", "lodgeo" => "Lodgeo", "hostflow" => "Book direct"
  }.freeze
  REVIEWS_PER_PAGE = 8

  def initialize(listing, current_user: nil, quote_allowance: nil, plans: [])
    @listing = listing
    @current_user = current_user
    @quote_allowance = quote_allowance
    @plans = plans
  end

  def as_json(*)
    pricing = Listing::PricingContext.call(@listing)

    {
      id: @listing.id,
      title: @listing.title,
      description: @listing.description,
      seoDescription: @listing.seo_description,
      city: @listing.city,
      kind: @listing.kind,
      url: "/listings/#{@listing.id}",
      coordinates: approximate_location,
      capacity: {
        bedrooms: @listing.bedrooms, bathrooms: @listing.bathrooms,
        beds: @listing.beds, maxGuests: @listing.max_guests
      },
      rating: @listing.blended_rating&.to_f,
      reviewsCount: @listing.reviews_count,
      photos: Array(@listing.photos),
      amenities: amenity_names,
      aiContent: ai_content,
      badges: badges,
      channels: channels(pricing),
      pricing: {
        cheapestProvider: pricing[:cheapest_provider],
        savings: pricing[:savings],
        sampleNights: pricing[:sample_nights]
      },
      host: host_block,
      reviews: reviews_block,
      plans: @plans,
      featureAccess: @current_user.present?,
      quoteAllowance: @quote_allowance,
      relatedListings: related_listings
    }
  end

  private

  # Half-open [from, to) as ISO strings, so the browser can compare dates as text.
  def iso_range(range)
    { from: range.first.iso8601, to: range.end.iso8601 }
  end

  def window_for(channel)
    channel.calendar_window && iso_range(channel.calendar_window)
  end


  # Coarsen the coordinates so the map shows an approximate area, not the exact address.
  def approximate_location
    return nil unless @listing.lat && @listing.lng

    { lat: @listing.lat.to_f.round(2), lng: @listing.lng.to_f.round(2), radiusMeters: 800 }
  end

  def amenity_names
    Amenity.where(id: @listing.amenity_ids).order(:bit_position).pluck(:name)
  end

  # The AI-content JSONB columns hold structured hashes (summary + highlights /
  # near + items); ~30% of listings are un-enriched ({}). Normalize to the shapes
  # the client renders, or nil so those sections are skipped.
  def ai_content
    {
      fromTheHost: from_the_host_ai,
      nearbyHighlights: nearby_highlights_ai
    }
  end

  def from_the_host_ai
    data = @listing.ai_content_host_summary
    return { summary: data, highlights: [] } if data.is_a?(String) && data.present?
    return nil unless data.is_a?(Hash) && data["summary"].present?

    { summary: data["summary"], highlights: Array(data["highlights"]) }
  end

  def nearby_highlights_ai
    data = @listing.ai_content_area_highlights
    return { near: nil, items: [ { name: data, blurb: nil } ] } if data.is_a?(String) && data.present?
    return nil unless data.is_a?(Hash)

    items = Array(data["items"]).filter_map do |item|
      { name: item["name"], blurb: item["blurb"] } if item.is_a?(Hash) && item["name"].present?
    end
    return nil if items.empty?

    { near: data["near"], items: items }
  end

  def badges
    score = @listing.listing_score
    { bookDirect: score.signal?(:book_direct), verified: score.signal?(:verified),
      topRated: @listing.top_rated?, multiChannel: score.signal?(:multi_channel) }
  end

  def channels(pricing)
    rows = pricing[:rows].index_by(&:provider_type)
    @listing.listing_channels.map do |channel|
      row = rows[channel.provider_type]
      {
        providerType: channel.provider_type,
        label: PROVIDER_LABELS.fetch(channel.provider_type, channel.provider_type.titleize),
        bookDirect: channel.provider_type == "hostflow",
        calendarWindow: window_for(channel),
        blockedRanges: channel.channel_blackouts.select(&:stay?).map { |b| iso_range(b.during) },
        rates: channel.channel_rates.map do |rate|
          { from: rate.during.first.iso8601, to: rate.during.end.iso8601,
            nightly: rate.nightly_price&.to_f, minStay: rate.min_stay }
        end,
        nightPriceConstant: channel.nightly_price_default&.to_i,
        staticFee: channel.static_fee&.to_f,
        providerFeePercent: channel.channel_fee_percent&.to_f,
        taxRate: channel.tax_rate&.to_f,
        nightlyFrom: row&.nightly_from,
        available: row&.available || false
      }
    end
  end

  def host_block
    owner = @listing.owner
    if owner && owner.host_intro_text.present?
      { known: true, name: owner.display_name, about: owner.host_intro_text,
        verified: @listing.verified_owner_id.present? }
    else
      { known: false, name: nil, about: nil, verified: false }
    end
  end

  def reviews_block
    reviews = @listing.reviews.order(created_at: :desc).limit(REVIEWS_PER_PAGE)
    breakdown = @listing.reviews.group(:rating).count
    {
      page: 1,
      perPage: REVIEWS_PER_PAGE,
      total: @listing.reviews_count,
      items: reviews.map { |review| ReviewJson.new(review).as_json },
      ratingBreakdown: (1..5).to_h { |star| [ star, breakdown[star].to_i ] },
      aiSummary: @listing.ai_content_review_digest["summary"]
    }
  end

  def related_listings
    similar = Listing.where(city: @listing.city).where.not(id: @listing.id)
                     .where.not(title: nil).limit(6)
    similar.map do |listing|
      { id: listing.id, title: listing.title, city: listing.city,
        photo: Array(listing.photos).first, rating: listing.blended_rating&.to_f,
        previewPrice: listing.preview_price&.to_f }
    end
  end
end
