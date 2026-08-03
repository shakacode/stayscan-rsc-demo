ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

# react_on_rails_pro 17-rc "fails closed": its renderer-password validation only
# skips when ENV["RAILS_ENV"] is *explicitly* "development" or "test". An unset
# RAILS_ENV is treated as production-like and raises "RENDERER_PASSWORD must be
# set" at boot. Rails already defaults to development, so make that explicit here
# (production/test set RAILS_ENV themselves, so ||= never overrides them).
ENV["RAILS_ENV"] ||= "development"

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
