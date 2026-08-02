require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module StayScan
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil

    # --- Response compression ------------------------------------------
    # Compress text responses so the SSR baseline (and the RSC experiment)
    # measures realistic encoded payloads. The `:if` touches the body to decide on
    # the actual bytes rather than a possibly-absent Content-Length. Brotli is
    # preferred (innermost via the later `use`, so it runs first on the response);
    # gzip is the fallback — each skips when the other already set Content-Encoding.
    compressible_types = %w[
      text/html text/css text/javascript application/javascript application/json image/svg+xml
    ].freeze
    compress_if = lambda do |_env, _status, headers, body|
      next false unless compressible_types.include?(headers["content-type"].to_s.split(";").first)

      bytes = 0
      body.each { |chunk| bytes += chunk.to_s.bytesize }
      bytes >= 512
    end
    config.middleware.use Rack::Deflater, if: compress_if
    config.middleware.use Rack::Brotli, if: compress_if

    # --- Request throttling (rules in config/initializers/rack_attack.rb) --
    config.middleware.use Rack::Attack
  end
end
