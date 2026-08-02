# frozen_string_literal: true

# Injects shared values into the Rails context passed to every React on Rails
# component render (see config.rendering_extension). This is the SSR/client
# contract seam: ~20 keys including device flags computed server-side from
# the User-Agent (intentionally hydration-hazardous), constants, and dummy 3rd-
# party keys. Kept user-agnostic so prerender output stays cacheable (the user
# block lives in LayoutJson).
module RenderingExtension
  DEFAULT_CURRENCY = "USD"
  FEATURE_FLAGS = { bookDirectBadge: true, mapClustering: true }.freeze
  PREMIUM_PRICE = 49
  BUSINESS_PRICE = 99
  QUOTE_TIMEOUT_MS = 12_000
  AUTOCOMPLETE_DEBOUNCE_MS = 250
  MAX_SEARCH_RESULTS = 306
  SUPPORT_EMAIL = "support@stayscan.example"

  # Called by React on Rails for each render with the view context. Must return a
  # Hash; keys become camelCase properties on `railsContext` in JS.
  def self.custom_context(view_context)
    request = view_context.request
    device = Browser.new(request.user_agent.to_s).device

    {
      railsEnv: Rails.env.to_s,
      appName: AppEnv.app_name,
      appDomain: AppEnv.app_domain,
      locale: I18n.locale.to_s,
      desktop: !(device.mobile? || device.tablet?),
      tablet: device.tablet?,
      mobile: device.mobile?,
      initialScreenSize: initial_screen_size(device),
      referer: request.referer,
      lastSearch: request.cookies["last_search"],
      currency: request.cookies["currency"].presence || DEFAULT_CURRENCY,
      featureFlags: FEATURE_FLAGS,
      premiumPrice: PREMIUM_PRICE,
      businessPrice: BUSINESS_PRICE,
      quoteTimeoutMs: QUOTE_TIMEOUT_MS,
      autocompleteDebounceMs: AUTOCOMPLETE_DEBOUNCE_MS,
      maxSearchResults: MAX_SEARCH_RESULTS,
      supportEmail: SUPPORT_EMAIL,
      analyticsKey: AppEnv.analytics_key,
      sentryDsn: ENV["SENTRY_DSN"].to_s,
      mapTileKey: ENV.fetch("MAP_TILE_KEY", "demo-map-tiles"),
      supportWidgetId: ENV.fetch("SUPPORT_WIDGET_ID", "demo-support-widget")
    }
  end

  # Server-side first-paint breakpoint hint. Mirrors the client breakpoints:
  # sm (mobile) / md (tablet) / lg (desktop, the default).
  def self.initial_screen_size(device)
    return "sm" if device.mobile?
    return "md" if device.tablet?

    "lg"
  end
end
