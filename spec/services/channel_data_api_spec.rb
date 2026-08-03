# frozen_string_literal: true

require "rails_helper"

RSpec.describe ChannelDataApi do
  subject(:api) { described_class.new }

  it "fetches Airhive raw details (nested) through the client" do
    expect(api.airhive_details("air-1").dig("listing", "space", "bedrooms")).to be_present
  end

  it "resolves the Lodgeo channel ref from the separate endpoint" do
    expect(api.lodgeo_channel_ref("lod-1", "u-2").dig("Property", "ChannelRef")).to match(/\A[0-9a-z]{8}\z/)
  end

  it "authenticates Hostflow with a bearer token" do
    token = api.hostflow_token["access_token"]

    props = api.hostflow_properties(page: 1, token:)

    expect(props["units"].first["unit_id"]).to be_present
  end

  it "surfaces a Hostflow auth failure as a typed ProviderError" do
    expect { api.hostflow_properties(page: 1, token: "bogus") }.to raise_error(described_class::ProviderError)
  end

  it "surfaces an injected provider failure as a typed ProviderError (after retries)" do
    original = ENV.fetch("FAKE_PROVIDER_ERROR_RATE", nil)
    ENV["FAKE_PROVIDER_ERROR_RATE"] = "1.0"

    expect { api.airhive_details("x") }.to raise_error(described_class::ProviderError)
  ensure
    ENV["FAKE_PROVIDER_ERROR_RATE"] = original
  end
end
