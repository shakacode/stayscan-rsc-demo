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
    write_sub = ActiveSupport::Notifications.subscribe("cache_write.active_support") do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      writes += 1 if event.payload[:key]&.include?("Welcome")
    end
    read_sub = ActiveSupport::Notifications.subscribe("cache_read.active_support") do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      hits += 1 if event.payload[:hit] && event.payload[:key]&.include?("Welcome")
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
    query_count = 0
    sub = ActiveSupport::Notifications.subscribe("sql.active_record") do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      query_count += 1 if event.payload[:sql]&.include?("content_pages")
    end

    visit "/"
    expect(page).to have_content("Find your stay for less")
    first_visit_queries = query_count

    query_count = 0
    visit "/"
    expect(page).to have_content("Find your stay for less")

    ActiveSupport::Notifications.unsubscribe(sub)

    expect(first_visit_queries).to be_positive
    expect(query_count).to eq(0)
  end

  it "does not leak the last_search cookie across visitors" do
    # Navigate once to establish the browser domain for cookie setting.
    visit "/"
    expect(page).to have_content("Find your stay for less")

    # Clear the cache that the domain-setup visit just wrote so the
    # cookie-bearing visit below is the first cacheable request.
    Rails.cache.clear

    # Visitor A: set the last_search cookie, then visit. The guard
    # (cache_welcome_render?) should skip the cache; if it were broken,
    # this would write the search term into the cached blob.
    page.driver.browser.manage.add_cookie(name: "last_search", value: "secret-search-xyz", path: "/")
    visit "/"
    expect(page).to have_content("Find your stay for less")

    # Visitor B: clear cookies (new visitor), then visit. If the guard
    # was broken, Visitor B gets Visitor A's cached blob with the search term.
    page.driver.browser.manage.delete_all_cookies
    visit "/"
    expect(page).to have_content("Find your stay for less")
    expect(page.html).not_to include("secret-search-xyz")
  end
end
