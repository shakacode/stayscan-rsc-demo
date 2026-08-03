# frozen_string_literal: true

# The browse view index payload: a page of listing tiles plus the search meta
# (with the anti-scraping caps), the echoed filters (so the client hydrates its
# filter state), the location-nav block for destination pages, and SEO text. Pure
# reads — no pricing arithmetic (preview_price is a denormalized column).
class ListingIndexJson
  def initialize(listings:, meta:, filters:, location: nil, query: nil, map_engine: "leaflet")
    @listings = listings
    @meta = meta
    @filters = filters
    @location = location
    @query = query
    @map_engine = map_engine
  end

  def as_json(*)
    {
      listings: @listings.map { |listing| Listing::TileJson.new(listing).as_json },
      meta: meta,
      filters: filters,
      location: location_block,
      query: @query,
      seo: seo,
      mapEngine: @map_engine,
      facets: facets
    }
  end

  private

  def meta
    {
      totalCount: @meta[:total_count],
      currentPage: @meta[:current_page],
      pageSize: @meta[:page_size],
      capReached: @meta[:cap_reached],
      maxPages: ListingSearch::MAX_PAGES
    }
  end

  def filters
    {
      minPrice: @filters[:min_price]&.to_f,
      maxPrice: @filters[:max_price]&.to_f,
      minBedrooms: @filters[:min_bedrooms]&.to_i,
      minBathrooms: @filters[:min_bathrooms]&.to_f,
      minGuests: @filters[:min_guests]&.to_i,
      minRating: @filters[:min_rating]&.to_f,
      bookDirect: truthy?(@filters[:book_direct]),
      topRated: truthy?(@filters[:top_rated]),
      amenityIds: Array(@filters[:amenity_ids]).map(&:to_i),
      sort: @filters[:sort],
      bbox: bbox
    }
  end

  def bbox
    return nil unless @filters[:min_lat]

    { minLat: @filters[:min_lat].to_f, maxLat: @filters[:max_lat].to_f,
      minLng: @filters[:min_lng].to_f, maxLng: @filters[:max_lng].to_f }
  end

  def location_block
    return nil unless @location

    { name: @location.name, path: @location.path, kind: @location.kind,
      center: { lat: @location.center_lat&.to_f, lng: @location.center_lng&.to_f },
      breadcrumb: @location.ancestry.map { |node| { name: node.name, path: node.path } } }
  end

  def seo
    if @location
      { title: "Vacation rentals in #{@location.name}",
        description: "Compare prices on #{@meta[:total_count]} stays in #{@location.name} across every booking channel." }
    else
      { title: "Search vacation rentals",
        description: "Compare stay prices across every booking channel in one place." }
    end
  end

  def truthy?(value)
    ActiveModel::Type::Boolean.new.cast(value) || false
  end

  # The filter options: the amenity checkbox set + the price-slider bounds.
  def facets
    {
      amenities: Amenity.order(:bit_position).limit(24).pluck(:id, :name).map { |id, name| { id:, name: } },
      priceBounds: { min: 0, max: 1000 }
    }
  end
end
