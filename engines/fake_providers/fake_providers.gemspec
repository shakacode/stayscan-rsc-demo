# frozen_string_literal: true

require_relative "lib/fake_providers/version"

Gem::Specification.new do |spec|
  spec.name        = "fake_providers"
  spec.version     = FakeProviders::VERSION
  spec.authors     = [ "StayScan" ]
  spec.summary     = "In-repo fake OTA/VRS provider APIs (synthetic, deterministic) for the RSC demo."
  spec.files       = Dir["{app,config,lib}/**/*"]
  spec.required_ruby_version = ">= 3.4"

  spec.add_dependency "rails", ">= 7.2"
end
