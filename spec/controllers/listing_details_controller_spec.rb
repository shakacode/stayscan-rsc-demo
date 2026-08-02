# frozen_string_literal: true

require "rails_helper"

# listing-detail view HTTP + prerender cache key: the ETag folds every dimension that
# changes the SSR output, so each one busts a repeat request while the rest 304.
# Device is deliberately NOT keyed — the SSR is responsive (one HTML for every
# viewport, CSS handles the rest), so a single cache entry serves all devices.
RSpec.describe ListingDetailsController, type: :controller do
  let(:listing) { create(:aggregate_listing) }

  before do
    allow(controller).to receive(:asset_version).and_return("rel-1")
    # The cache key is independent of the JSON body; isolate it from listing data.
    allow_any_instance_of(described_class).to receive(:listing_detail_json).and_return({})
  end

  def etag
    get :show, params: { id: listing.id }
    response.headers["ETag"]
  end

  it "304s an identical repeat anonymous request" do
    request.headers["If-None-Match"] = etag

    get :show, params: { id: listing.id }

    expect(response).to have_http_status(:not_modified)
  end

  it "busts the cache key on the signed-in user" do
    anon = etag

    sign_in create(:user)

    expect(etag).not_to eq(anon)
  end

  it "busts the cache key on the selected currency" do
    usd = etag

    session[:currency] = "EUR"

    expect(etag).not_to eq(usd)
  end

  it "busts the cache key on a new release (asset_version)" do
    before_release = etag

    allow(controller).to receive(:asset_version).and_return("rel-2")

    expect(etag).not_to eq(before_release)
  end

  it "busts the cache key when the listing content changes" do
    before_edit = etag

    listing.update!(title: "#{listing.title} (updated)")

    expect(etag).not_to eq(before_edit)
  end
end
