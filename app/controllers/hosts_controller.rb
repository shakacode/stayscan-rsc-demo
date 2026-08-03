# frozen_string_literal: true

# Host pages: the public host profile (#show) and the separate map view of a
# host's listings (#map, its own bundle).
class HostsController < UsersController
  def show
    @user = User.find(params[:id])
    @props = props_for(@user, variant: "host")
    render "hosts/show"
  end

  def map
    @user = User.find(params[:id])
    tiles = @user.owned_listings.where.not(lat: nil).preload(:listing_channels)
                 .map { |listing| Listing::TileJson.new(listing).as_json }

    @props = {
      host: { id: @user.id, name: @user.display_name },
      tiles: tiles,
      mapEngine: FeatureFlag.map_engine,
      layout: LayoutJson.new(user: current_user).as_json,
      locale: params[:locale].presence || "en"
    }
    render "hosts/map"
  end
end
