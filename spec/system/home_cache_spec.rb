# frozen_string_literal: true

require "rails_helper"

# The home SSR is fragment-cached under a composite key (welcome_cache_key) via
# cached_react_component. The second identical request is a cache hit and the
# props block is not evaluated. Requests carrying flash or a last_search cookie
# skip the cache entirely to prevent cross-session data leakage.
RSpec.describe "Home fragment caching", type: :system, caching: true do
  it "writes the home render to cache, then hits it on the second request" do
    writes = 0
    hits = 0
    write_sub = ActiveSupport::Notifications.subscribe("cache_write.active_support") { writes += 1 }
    read_sub = ActiveSupport::Notifications.subscribe("cache_read.active_support") do |*args|
      hits += 1 if ActiveSupport::Notifications::Event.new(*args).payload[:hit]
    end

    visit "/"
    expect(page).to have_content("Find your stay for less")
    visit "/"
    expect(page).to have_content("Find your stay for less")

    ActiveSupport::Notifications.unsubscribe(write_sub)
    ActiveSupport::Notifications.unsubscribe(read_sub)

    expect(writes).to be_positive # first render cached the SSR
    expect(hits).to be_positive # second render served from cache
  end

  it "does not evaluate props on a cache hit" do
    content_pages_queries = { first: 0, second: 0 }
    phase = :first
    sub = ActiveSupport::Notifications.subscribe("sql.active_record") do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      content_pages_queries[phase] += 1 if event.payload[:sql]&.include?("content_pages")
    end

    visit "/"
    expect(page).to have_content("Find your stay for less")

    phase = :second
    visit "/"
    expect(page).to have_content("Find your stay for less")

    ActiveSupport::Notifications.unsubscribe(sub)

    expect(content_pages_queries[:first]).to be_positive
    expect(content_pages_queries[:second]).to eq(0)
  end

  it "does not leak the last_search cookie across visitors" do
    # Visit 1: set the last_search cookie — cache is skipped (cache_welcome_render? = false)
    # because the cookie value lands in railsContext and is not in the cache key.
    visit "/"
    page.driver.browser.manage.add_cookie(name: "last_search", value: "secret-search-xyz", path: "/")
    visit "/"
    expect(page).to have_content("Find your stay for less")

    # Visit 2: clear all cookies (simulates a fresh visitor) — should not see
    # the previous visitor's search term anywhere in the rendered HTML.
    page.driver.browser.manage.delete_all_cookies
    visit "/"
    expect(page).to have_content("Find your stay for less")
    expect(page.html).not_to include("secret-search-xyz")
  end
end
