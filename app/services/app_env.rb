# frozen_string_literal: true

# Small indirection over environment-derived app settings so views, serializers,
# and the rendering context read one source. Values are dummy-safe defaults for
# local/offline runs; real deploys override via ENV. Grows through later milestones.
module AppEnv
  module_function

  def app_name
    ENV.fetch("APP_NAME", "StayScan")
  end

  def app_domain
    ENV.fetch("APP_DOMAIN", "localhost:3000")
  end

  # Client-side analytics key. Dummy by default — this demo ships no real analytics.
  def analytics_key
    ENV.fetch("ANALYTICS_KEY", "demo-analytics-key")
  end
end
