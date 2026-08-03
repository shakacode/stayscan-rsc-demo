# frozen_string_literal: true

require "rails_helper"

RSpec.describe "FakeProviders APIs", type: :request do
  it "serves Airhive details as a NESTED schema, deterministically" do
    get "/fake-providers/airhive/v1/listings/air-1"

    expect(response).to have_http_status(:ok)
    body = response.parsed_body
    expect(body.dig("listing", "space", "bedrooms")).to be_present
    expect(body.dig("pricing_summary", "base_nightly")).to be_present

    first = body.dup
    get "/fake-providers/airhive/v1/listings/air-1"
    expect(response.parsed_body).to eq(first) # same id -> same payload
  end

  it "serves Vacario details as a FLAT snake_case schema keyed by native_id + unit_code" do
    get "/fake-providers/vacario/units/vac-1/unit-9"

    body = response.parsed_body
    expect(body["bedroom_count"]).to be_present
    expect(body["nightly_rate_usd"]).to be_present
    expect(body["unit_code"]).to eq("unit-9")
  end

  it "serves Lodgeo details as XML-ish JSON with string numbers and NO channel_ref in the feed" do
    get "/fake-providers/lodgeo/properties/lod-1/u-2"

    body = response.parsed_body
    expect(body.dig("Property", "Details", "Bedrooms")).to be_a(String) # string-typed numbers
    expect(body["Property"]).not_to have_key("ChannelRef")

    get "/fake-providers/lodgeo/properties/lod-1/u-2/channel-ref"
    expect(response.parsed_body.dig("Property", "ChannelRef")).to match(/\A[0-9a-z]{8}\z/)
  end

  it "encodes calendars differently per provider" do
    get "/fake-providers/airhive/v1/listings/x/calendar?days=5"
    expect(response.parsed_body["days"]).to be_an(Array) # per-day objects

    get "/fake-providers/vacario/units/x/u/calendar?days=5"
    expect(response.parsed_body["availability"].first).to include("from", "to") # date ranges

    get "/fake-providers/lodgeo/properties/x/u/calendar?days=5"
    expect(response.parsed_body.dig("Availability", "Calendar")).to match(/\A[YN]{5}\z/) # packed string
  end

  it "gates Hostflow behind a bearer token and paginates" do
    get "/fake-providers/hostflow/properties"
    expect(response).to have_http_status(:unauthorized)

    post "/fake-providers/hostflow/tokens"
    token = response.parsed_body["access_token"]

    get "/fake-providers/hostflow/properties", headers: { "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["total_pages"]).to be >= 1
    expect(response.parsed_body["units"].first["unit_id"]).to be_present
  end

  it "injects provider errors when the error rate is 1.0 (chaos knob)" do
    original = ENV.fetch("FAKE_PROVIDER_ERROR_RATE", nil)
    ENV["FAKE_PROVIDER_ERROR_RATE"] = "1.0"

    get "/fake-providers/airhive/v1/listings/x"

    expect(response).to have_http_status(:service_unavailable)
  ensure
    ENV["FAKE_PROVIDER_ERROR_RATE"] = original
  end
end
