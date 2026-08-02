# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Placeholder images", type: :request do
  it "serves a deterministic SVG whose color is derived from the key" do
    get "/images/placeholder/listings/fake-1/photo-3.jpg"

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("image/svg+xml")
    first_body = response.body

    get "/images/placeholder/listings/fake-1/photo-3.jpg"
    expect(response.body).to eq(first_body) # deterministic
  end
end
