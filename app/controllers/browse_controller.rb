# frozen_string_literal: true

# Browse view: free search (#index) and path-routed
# destination pages (#location_page). Both run ListingSearch over the denormalized
# projection, track the request, and render the browse bundle from
# ListingIndexJson. The heavy client state (map/filters/live pricing)
# lives in the browse Redux store; this controller only ships the first page.
class BrowseController < ApplicationController
  def index
    render_results(search_params)
  end

  def location_page
    @location = Location.find_by!(path: params[:path])
    render_results(search_params.merge(@location.search_bounds))
  end

  private

  def render_results(query_params)
    search = ListingSearch.new(query_params)
    listings = search.results.preload(:listing_channels)

    RecordSearchEventJob.perform_later(visitor_token: session.id&.to_s, params: query_params.stringify_keys)

    index = ListingIndexJson.new(
      listings: listings, meta: search.meta, filters: query_params, location: @location,
      query: params[:q], map_engine: FeatureFlag.map_engine
    ).as_json

    respond_to do |format|
      # HTML = the SSR page (initial load); JSON = the client store's refetch on
      # map-bounds / filter / page / sort changes.
      format.html do
        @props = { index: index, layout: LayoutJson.new(user: current_user).as_json,
                   locale: params[:locale].presence || "en" }
        render :show
      end
      format.json { render json: index }
    end
  end

  def search_params
    params.permit(:page, :sort, :min_price, :max_price, :min_bedrooms, :min_bathrooms, :min_guests,
                  :min_rating, :book_direct, :top_rated, :min_lat, :max_lat, :min_lng, :max_lng, amenity_ids: [])
          .to_h.symbolize_keys
  end
end
