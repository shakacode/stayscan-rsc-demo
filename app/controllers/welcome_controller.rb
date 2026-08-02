# frozen_string_literal: true

# Home / marketing landing: hero + "what's cheaper" comparison + explainer,
# stats, testimonials, hosts pitch, and CMS blocks, over the shared layout.
class WelcomeController < ApplicationController
  TESTIMONIALS = [
    { id: "t1", quote: "Saved $240 on a week in Kivora just by booking the cheaper channel.",
      author: "Mara D.", location: "Seattle" },
    { id: "t2", quote: "One search showed the same villa at three prices. Wild.",
      author: "Theo R.", location: "Austin" },
    { id: "t3", quote: "Found a book-direct host and skipped the service fees entirely.",
      author: "Iona F.", location: "Toronto" }
  ].freeze

  def index
    @welcome_props = {
      layout: LayoutJson.new(user: current_user, current_currency: session[:currency] || "USD",
                             alerts: flash_alerts).as_json,
      home: home_json,
      locale: params[:locale].presence || "en"
    }
  end

  helper_method :welcome_cache_key

  # Composite fragment-cache key: the SSR output branches on the signed-in
  # user (navbar), the selected currency (prices) and the locale, and must fold in
  # asset_version so a rebuild/deploy busts it — otherwise cached home HTML hydrates
  # against a newer client bundle and mismatches (same rationale as the listing-detail view ETag).
  def welcome_cache_key
    [ "welcome", current_user&.id || "anon", session[:currency] || "USD",
      params[:locale].presence || "en", asset_version ]
  end

  private

  def home_json
    {
      example: ExampleListingJson.build,
      cms: cms_home,
      testimonials: TESTIMONIALS,
      stats: {
        listings: Listing.count,
        destinations: Location.where(kind: "area").count,
        providers: 4
      }
    }
  end

  def cms_home
    page = ContentPage.find_by(slug: "home")
    page && { title: page.title, body: page.body }
  end

  def flash_alerts
    flash.flat_map do |kind, message|
      Array(message).map { |text| { id: "flash-#{kind}", kind: kind.to_s, message: text } }
    end
  end
end
