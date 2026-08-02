# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Reviews", type: :request do
  it "returns a page of reviews in the shared ReviewJson shape" do
    listing = create(:aggregate_listing, reviews_count: 12)
    create_list(:review, 12, listing:)

    get "/listings/#{listing.id}/reviews", params: { page: 2 }

    expect(response).to have_http_status(:ok)
    body = response.parsed_body
    expect(body).to include("page" => 2, "perPage" => 8, "total" => 12)
    expect(body["items"].size).to eq(4)
    expect(body["items"].first.keys).to match_array(%w[id author rating content provider])
  end

  it "defaults an out-of-range page to the first page" do
    listing = create(:aggregate_listing, reviews_count: 3)
    create_list(:review, 3, listing:)

    get "/listings/#{listing.id}/reviews", params: { page: 0 }

    expect(response.parsed_body).to include("page" => 1)
    expect(response.parsed_body["items"].size).to eq(3)
  end
end
