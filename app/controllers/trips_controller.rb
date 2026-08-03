# frozen_string_literal: true

# The signed-in traveler's saved trip lists.
class TripsController < ApplicationController
  before_action :authenticate_user!

  def index
    lists = current_user.trip_lists.order(:name).map do |list|
      { id: list.id, name: list.name, slug: list.slug,
        listings: list.listings.where.not(title: nil).limit(12).preload(:listing_channels)
                      .map { |listing| Listing::TileJson.new(listing).as_json } }
    end

    @props = {
      trips: { lists: lists },
      layout: LayoutJson.new(user: current_user).as_json,
      locale: params[:locale].presence || "en"
    }
    render "trips/index"
  end
end
