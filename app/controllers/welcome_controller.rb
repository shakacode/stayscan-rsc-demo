# frozen_string_literal: true

# Home / marketing landing: hero + "what's cheaper" comparison + explainer,
# stats, testimonials, hosts pitch, and CMS blocks, over the shared layout.
class WelcomeController < ApplicationController
  def index
    @welcome_props = {
      layout: LayoutJson.new(user: current_user, current_currency: session[:currency] || "USD",
                             alerts: flash_alerts).as_json,
      home: HomePageJson.build,
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

  def flash_alerts
    flash.flat_map do |kind, message|
      Array(message).map { |text| { id: "flash-#{kind}", kind: kind.to_s, message: text } }
    end
  end
end
