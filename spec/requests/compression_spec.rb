# frozen_string_literal: true

require "rails_helper"

# Response compression: text responses are compressed so the SSR baseline
# reflects realistic encoded payloads. Verified on a JSON endpoint (no renderer
# needed); the same middleware compresses HTML.
RSpec.describe "Response compression", type: :request do
  def reviews_path
    listing = create(:aggregate_listing, reviews_count: 12)
    create_list(:review, 12, listing:)
    "/listings/#{listing.id}/reviews"
  end

  it "gzip-compresses when the client accepts gzip" do
    get reviews_path, headers: { "Accept-Encoding" => "gzip" }

    expect(response.headers["Content-Encoding"]).to eq("gzip")
  end

  it "prefers brotli when the client advertises it" do
    get reviews_path, headers: { "Accept-Encoding" => "br, gzip" }

    expect(response.headers["Content-Encoding"]).to eq("br")
  end

  it "sends an identity (uncompressed) body when the client accepts no encoding" do
    get reviews_path

    expect(response.headers["Content-Encoding"]).to be_nil
  end
end
