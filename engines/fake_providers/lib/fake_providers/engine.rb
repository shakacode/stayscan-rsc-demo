# frozen_string_literal: true

module FakeProviders
  # In-repo Rails engine serving synthetic OTA/VRS provider APIs over real HTTP.
  # Deliberately mimics three genuinely different provider schemas so the
  # per-provider normalizers do real translation work.
  class Engine < ::Rails::Engine
    isolate_namespace FakeProviders
  end
end
