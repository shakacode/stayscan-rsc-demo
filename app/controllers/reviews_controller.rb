# frozen_string_literal: true

# Paginated reviews for the listing-detail view reviews section. Page 1 ships inline with
# the listing; this serves the rest as the guest pages through them.
class ReviewsController < ApplicationController
  PER_PAGE = 8

  def index
    listing = Listing.find(params[:listing_id])
    page = [ params[:page].to_i, 1 ].max
    reviews = listing.reviews.order(created_at: :desc).offset((page - 1) * PER_PAGE).limit(PER_PAGE)

    render json: {
      page: page,
      perPage: PER_PAGE,
      total: listing.reviews_count,
      items: reviews.map { |review| ReviewJson.new(review).as_json }
    }
  end
end
