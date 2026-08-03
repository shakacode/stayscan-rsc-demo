# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Batch quotes (browse view live pricing)", type: :request do
  def listing_with_channel(title)
    listing = create(:aggregate_listing, title:)
    listing.listing_channels.create!(provider_type: "airhive", stay_availability_default: true,
                                     nightly_price_default: 200)
    listing
  end

  let(:stay) { { check_in: Date.current.iso8601, check_out: (Date.current + 3).iso8601, adults: 2 } }

  it "creates one async quote per listing and returns them keyed by listingId" do
    a = listing_with_channel("Reef Villa")
    b = listing_with_channel("Palm Casita")

    expect do
      post "/quotes/batch", params: { listing_ids: [ a.id, b.id ], **stay }, as: :json
    end.to have_enqueued_job(SettleChannelQuoteJob).twice

    expect(response).to have_http_status(:created)
    items = response.parsed_body["quotes"]
    expect(items.map { |item| item["listingId"] }).to contain_exactly(a.id, b.id)
    expect(items.first["quote"]).to include("state" => "processing")
  end

  it "polls the batch by quote ids" do
    listing = listing_with_channel("Reef Villa")
    post "/quotes/batch", params: { listing_ids: [ listing.id ], **stay }, as: :json
    quote_id = response.parsed_body["quotes"].first["quote"]["id"]

    get "/quotes/batch", params: { ids: [ quote_id ] }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["quotes"].first["quote"]).to include("id" => quote_id)
  end

  it "gates the whole batch behind the anonymous quote limit" do
    listing = listing_with_channel("Reef Villa")
    allow_any_instance_of(Quote::Limit).to receive(:reached?).and_return(true)

    post "/quotes/batch", params: { listing_ids: [ listing.id ], **stay }, as: :json

    expect(response).to have_http_status(:forbidden)
    expect(response.parsed_body).to include("error" => "quote_limit")
  end

  it "omits quotes the session never created from the batch poll (IDOR)" do
    other_session_quote = Quote.create!(listing: listing_with_channel("Reef Villa"), check_in: Date.current,
                                        check_out: Date.current + 3, adults: 2)

    get "/quotes/batch", params: { ids: [ other_session_quote.id ] }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["quotes"]).to be_empty
  end
end
