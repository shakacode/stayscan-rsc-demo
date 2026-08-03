# frozen_string_literal: true

# Geo-bounded, faceted, sorted, paginated listing search over the denormalized
# listing_search_rows projection. Results are hard-capped (MAX_PAGES /
# MAX_RESULTS) as an anti-scraping measure.
class ListingSearch
  MAX_RESULTS = 160
  MAX_PAGES = 8
  PAGE_SIZE = 20

  AMENITY_MASK_WIDTH = 64

  def initialize(params)
    @params = params.to_h.symbolize_keys
  end

  def results
    @results ||= filtered_scope.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE)
  end

  def meta
    total = [ filtered_scope.limit(MAX_RESULTS + 1).ids.size, MAX_RESULTS ].min
    { total_count: total, current_page: page, page_size: PAGE_SIZE, cap_reached: total >= MAX_RESULTS }
  end

  private

  attr_reader :params

  def filtered_scope
    scope = Listing.joins("INNER JOIN listing_search_rows ls ON ls.listing_id = listings.id")
                   .where("ls.active AND ls.active_browse")
    scope = by_bbox(scope)
    scope = by_price(scope)
    scope = by_bedrooms(scope)
    scope = by_bathrooms(scope)
    scope = by_guests(scope)
    scope = by_rating(scope)
    scope = by_amenities(scope)
    scope = by_book_direct(scope)
    scope = by_top_rated(scope)
    ordered(scope)
  end

  def by_bbox(scope)
    return scope unless params[:min_lat]

    scope.where(
      "ls.lat BETWEEN ? AND ? AND ls.lng BETWEEN ? AND ?",
      params[:min_lat], params[:max_lat], params[:min_lng], params[:max_lng]
    )
  end

  def by_price(scope)
    scope = scope.where("ls.preview_price_cents >= ?", (params[:min_price].to_d * 100).to_i) if params[:min_price]
    scope = scope.where("ls.preview_price_cents <= ?", (params[:max_price].to_d * 100).to_i) if params[:max_price]
    scope
  end

  def by_bedrooms(scope)
    params[:min_bedrooms] ? scope.where("ls.bedrooms >= ?", params[:min_bedrooms]) : scope
  end

  def by_bathrooms(scope)
    params[:min_bathrooms] ? scope.where("ls.bathrooms_tenths >= ?", (params[:min_bathrooms].to_d * 10).to_i) : scope
  end

  def by_guests(scope)
    params[:min_guests] ? scope.where("ls.max_guests >= ?", params[:min_guests].to_i) : scope
  end

  def by_rating(scope)
    params[:min_rating] ? scope.where("ls.rating_sort_key >= ?", (params[:min_rating].to_d * 10_000_000).to_i) : scope
  end

  def by_amenities(scope)
    ids = Array(params[:amenity_ids]).compact
    return scope if ids.empty?

    mask = amenity_mask(ids)
    # mask is a machine-built 0/1 string; bind it (cast to varbit) rather than
    # inlining a bit literal, so the query stays parameterized regardless of input.
    scope.where("ls.amenity_mask IS NOT NULL AND (ls.amenity_mask & ?::varbit) = ?::varbit", mask, mask)
  end

  def by_book_direct(scope)
    params[:book_direct] ? scope.where("ls.book_direct") : scope
  end

  def by_top_rated(scope)
    params[:top_rated] ? scope.where("ls.top_rated") : scope
  end

  def ordered(scope)
    case params[:sort]
    when "price_asc" then scope.order(Arel.sql("ls.preview_price_cents ASC NULLS LAST, listings.id"))
    when "price_desc" then scope.order(Arel.sql("ls.preview_price_cents DESC NULLS LAST, listings.id"))
    when "rating" then scope.order(Arel.sql("ls.rating_sort_key DESC NULLS LAST, listings.id"))
    else scope.order(Arel.sql("ls.top_rated DESC, ls.preview_price_cents ASC NULLS LAST, listings.id"))
    end
  end

  def amenity_mask(ids)
    bits = "0" * AMENITY_MASK_WIDTH
    Amenity.where(id: ids).pluck(:bit_position).each do |pos|
      bits[pos] = "1" if pos.between?(0, AMENITY_MASK_WIDTH - 1)
    end
    bits
  end

  def page
    requested = params[:page].to_i
    requested = 1 if requested < 1
    [ requested, MAX_PAGES ].min
  end
end
