source "https://rubygems.org"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.2.3"
# The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
gem "sprockets-rails"
# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"

# ==== React on Rails Pro + React Server Components (versions synced with client/package.json)
gem "react_on_rails", "17.0.0.rc.6"
gem "react_on_rails_pro", "17.0.0.rc.6"
gem "shakapacker", "10.1.0"
# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

# ==== Database: versioned SQL functions/triggers (fx) + views (scenic), dumped
# into schema.rb so db:reset restores them.
gem "fx"
gem "scenic"

# ==== Backing services & infrastructure
gem "redis", ">= 4.0.1"
gem "connection_pool"
gem "dalli"                 # memcached client (Rails cache store; falls back to memory_store)
gem "sidekiq"               # background jobs
gem "sidekiq-cron"          # periodic re-sync jobs
gem "rack-attack"           # request throttling

# ==== In-repo fake provider APIs (the OTA/VRS "moat" replacement, served over HTTP)
gem "fake_providers", path: "engines/fake_providers"

# ==== Domain & request-context building blocks
gem "devise"                # authentication
gem "browser"               # server-side device detection for RenderingExtension
gem "faraday"               # HTTP client for the provider data API
gem "faraday-follow_redirects"
gem "faraday-retry"
# In-process Rack transport: ChannelDataApi hits the mounted FakeProviders engine
# without real sockets (tests + the seed generator).
gem "faraday-rack"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ windows jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false

  # Test framework
  gem "rspec-rails", "~> 7.1"
  gem "factory_bot_rails"
  gem "faker"

  # System specs (Capybara + headless Chrome)
  gem "capybara"
  gem "selenium-webdriver"
  # System specs hit a real Puma server on a separate connection, so transactional
  # rollback can't cover their writes — truncate after each instead.
  gem "database_cleaner-active_record"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"
end

gem "rack-brotli", "~> 2.0"  # Brotli response compression
