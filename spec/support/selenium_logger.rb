# frozen_string_literal: true

# Fail any JS system spec that logs a browser console error — hydration mismatches,
# uncaught exceptions, failed asset loads all surface here. Third-party noise is
# suppressed by pattern; expected app errors should be scoped with a per-test guard,
# never added globally here.
module SeleniumLogger
  SUPPRESSED = [
    /favicon\.ico/,
    /Download the React DevTools/,
    %r{net::ERR_INTERNET_DISCONNECTED},
    /web-vitals/
  ].freeze

  def assert_no_browser_errors
    logs = page.driver.browser.logs.get(:browser)
    severe = logs.select { |entry| entry.level == "SEVERE" }
                 .reject { |entry| SUPPRESSED.any? { |pattern| entry.message.match?(pattern) } }
    return if severe.empty?

    raise "Browser console errors:\n#{severe.map(&:message).join("\n")}"
  end
end

RSpec.configure do |config|
  config.include SeleniumLogger, type: :system

  config.after(:each, type: :system) do |example|
    if example.metadata[:allow_http_error]
      # Pages that intentionally return non-2xx (e.g. 404). Still drain the log
      # buffer so their expected errors don't leak into the next example.
      page.driver.browser.logs.get(:browser)
      next
    end

    assert_no_browser_errors if respond_to?(:assert_no_browser_errors) && page.current_url.present?
  rescue Selenium::WebDriver::Error::WebDriverError
    # browser already gone (e.g. the example never navigated) — nothing to assert
  end
end
