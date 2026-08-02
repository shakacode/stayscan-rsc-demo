# frozen_string_literal: true

class Quote
  # Anonymous quote-fetch gate: signed-out visitors get a small
  # number of quotes before the UsageLimitModal; signed-in users are unlimited.
  #
  # This is a UX nudge, NOT a security boundary: `used` comes from the cookie
  # session, so it resets when the cookie is dropped. Actual anti-scraping is
  # enforced elsewhere — session-scoped quote reads (ApplicationController
  # #owned_quote_ids) plus per-IP throttling (Rack::Attack).
  class Limit
    ANON_LIMIT = 5

    def initialize(user:, used:)
      @user = user
      @used = used.to_i
    end

    def reached?
      @user.nil? && @used >= ANON_LIMIT
    end

    def as_json(*)
      {
        limited: @user.nil?,
        limit: ANON_LIMIT,
        used: @used,
        remaining: @user ? nil : [ ANON_LIMIT - @used, 0 ].max
      }
    end
  end
end
