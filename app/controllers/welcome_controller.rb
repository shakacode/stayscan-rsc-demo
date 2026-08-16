# frozen_string_literal: true

# Home / marketing landing: hero + "what's cheaper" comparison + explainer,
# stats, testimonials, hosts pitch, and CMS blocks, over the shared layout.
#
# Props are built lazily via the welcome_props helper so that
# cached_react_component can skip them entirely on a cache hit.
class WelcomeController < ApplicationController
  def index; end

  helper_method :welcome_cache_key, :welcome_props, :cache_welcome_render?

  # Props for the Welcome component. Evaluated only when the cache misses
  # (cached_react_component passes this as the block).
  def welcome_props
    {
      layout: LayoutJson.new(user: current_user, current_currency: session[:currency] || "USD",
                             alerts: flash_alerts).as_json,
      home: HomePageJson.build,
      locale: params[:locale].presence || "en"
    }
  end

  # Composite fragment-cache key. Each dimension that changes the cached blob
  # must appear here. Bounded dimensions only — unbounded ones (flash,
  # last_search) use cache_welcome_render? to skip the cache instead.
  def welcome_cache_key
    [ "welcome", current_user&.id || "anon", session[:currency] || "USD",
      cookies["currency"].presence || "USD",
      RenderingExtension.screen_size_for(request),
      params[:locale].presence || "en", asset_version ]
  end

  # Flash alerts (props) and the last_search cookie (railsContext) both land
  # inside the cached blob and neither is in the key, so skip the cache for
  # those requests rather than risk serving one visitor's data to another.
  # T8 moves both into an uncached client island, at which point these guards
  # can be deleted.
  def cache_welcome_render?
    flash.none? && cookies["last_search"].blank?
  end

  private

  def flash_alerts
    flash.flat_map do |kind, message|
      Array(message).map { |text| { id: "flash-#{kind}", kind: kind.to_s, message: text } }
    end
  end
end
