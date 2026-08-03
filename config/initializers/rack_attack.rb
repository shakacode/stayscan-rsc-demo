# frozen_string_literal: true

# Request throttling: the live-pricing quote endpoints fan out to provider
# stubs and the search endpoint hits the projection on every map pan/filter — both
# are scraping-worthy, so bound them per IP. Counters live in a dedicated in-memory
# store so throttling works even where Rails.cache is a null store (test/dev);
# per-process is fine for these coarse limits.
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

class Rack::Attack
  QUOTE_LIMIT = 20        # POST quote creation per IP per minute
  QUOTE_READ_LIMIT = 60   # GET quote polls per IP per minute (bounds enumeration)
  SEARCH_LIMIT = 60       # GET search/location per IP per minute
  CONTACT_LIMIT = 5       # POST contact form per IP per minute

  # POST quote creation (single /listings/:id/quotes and /quotes/batch).
  throttle("quotes/ip", limit: QUOTE_LIMIT, period: 60) do |req|
    req.ip if req.post? && req.path.include?("quote")
  end

  # GET quote polls (/quotes/:id, /quotes/batch). Reads are already session-scoped
  # (ApplicationController#owned_quote_ids); this bounds PK-enumeration attempts.
  throttle("quote-reads/ip", limit: QUOTE_READ_LIMIT, period: 60) do |req|
    req.ip if req.get? && req.path.start_with?("/quotes")
  end

  # GET search hits the same ListingSearch projection whether it is the browse
  # shell (/s), its JSON refetch (/s.json), or a path-routed destination (/l/*).
  throttle("search/ip", limit: SEARCH_LIMIT, period: 60) do |req|
    req.ip if req.get? && (req.path == "/s" || req.path == "/s.json" || req.path.start_with?("/l/"))
  end

  # Unauthenticated contact form enqueues mail — cap it so it can't be used to
  # flood the mailer / Sidekiq.
  throttle("contact/ip", limit: CONTACT_LIMIT, period: 60) do |req|
    req.ip if req.post? && req.path == "/contact"
  end

  self.throttled_responder = lambda do |_request|
    [ 429, { "content-type" => "application/json" }, [ { error: "Too many requests. Please slow down." }.to_json ] ]
  end
end
