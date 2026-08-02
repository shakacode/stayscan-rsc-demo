# frozen_string_literal: true

require "rails_helper"

# Request throttling: the quote endpoints are the costliest path, so a client
# that hammers them past the per-IP limit is rejected with 429 before reaching the app.
RSpec.describe "Rack::Attack throttling", type: :request do
  # Rack::Attack keys its counter on the time window (Time.now / period), so a
  # burst can straddle a minute boundary and split across two windows. Sending
  # 2*LIMIT+1 requests guarantees one window still exceeds the limit, and we
  # assert a 429 occurred during the burst rather than on the final request.
  def statuses_for(count)
    Array.new(count) do
      yield
      response.status
    end
  end

  it "throttles the quote endpoint past the per-IP limit" do
    codes = statuses_for(2 * Rack::Attack::QUOTE_LIMIT + 1) do
      post "/quotes/batch", params: { listing_ids: [], check_in: "2026-08-01", check_out: "2026-08-03" }
    end

    expect(codes).to include(429)
  end

  it "lets a request through while under the limit" do
    post "/quotes/batch", params: { listing_ids: [], check_in: "2026-08-01", check_out: "2026-08-03" }

    expect(response).not_to have_http_status(:too_many_requests)
  end

  it "throttles path-routed location search (/l/*), which hits the same projection as /s" do
    codes = statuses_for(2 * Rack::Attack::SEARCH_LIMIT + 1) { get "/l/sy/marenca" }

    expect(codes).to include(429)
  end

  it "throttles the unauthenticated contact form" do
    codes = statuses_for(2 * Rack::Attack::CONTACT_LIMIT + 1) do
      post "/contact", params: { contact: { name: "A", email: "a@example.test", message: "hi" } }
    end

    expect(codes).to include(429)
  end
end
