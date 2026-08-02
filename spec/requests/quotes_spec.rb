# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Quotes", type: :request do
  def listing_with_channel
    listing = Listing.create!(origin: "aggregated", title: "Villa",
                              airhive_listing: AirhiveListing.create!(native_id: "a1"))
    listing.listing_channels.create!(provider_type: "airhive", stay_availability_default: true,
                                     nightly_price_default: 200)
    listing
  end

  let(:stay) { { check_in: Date.current.iso8601, check_out: (Date.current + 3).iso8601, adults: 2 } }

  it "creates an async quote and returns the QuoteJson with pending channels" do
    listing = listing_with_channel

    expect do
      post "/listings/#{listing.id}/quotes", params: { quote: stay }, as: :json
    end.to have_enqueued_job(SettleChannelQuoteJob).with(anything, "airhive")

    expect(response).to have_http_status(:created)
    expect(response.parsed_body).to include("state" => "processing", "nights" => 3)
    expect(response.parsed_body["deals"].first).to include("provider" => "airhive", "status" => "pending")
  end

  it "returns a quote by id (poll fallback)" do
    listing = listing_with_channel
    post "/listings/#{listing.id}/quotes", params: { quote: stay }, as: :json
    quote_id = response.parsed_body["id"]

    get "/quotes/#{quote_id}"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to include("id" => quote_id)
  end

  it "does not serve a quote the session never created (IDOR over sequential PKs)" do
    other_session_quote = Quote.create!(listing: listing_with_channel, check_in: Date.current,
                                        check_out: Date.current + 3, adults: 2)

    get "/quotes/#{other_session_quote.id}"

    expect(response).to have_http_status(:not_found)
  end

  it "gates anonymous visitors with a 403 past the quote limit" do
    listing = listing_with_channel

    Quote::Limit::ANON_LIMIT.times do
      post "/listings/#{listing.id}/quotes", params: { quote: stay }, as: :json
      expect(response).to have_http_status(:created)
    end

    post "/listings/#{listing.id}/quotes", params: { quote: stay }, as: :json

    expect(response).to have_http_status(:forbidden)
    expect(response.parsed_body).to include("error" => "quote_limit")
  end
end
