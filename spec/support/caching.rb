# frozen_string_literal: true

# Tag an example `:caching` to run it with a real (memory) cache store and
# fragment caching on. Restored afterwards so other specs stay uncached.
RSpec.configure do |config|
  config.before(:each, :caching) do
    @__caching_original = Rails.cache
    @__caching_perform = ActionController::Base.perform_caching
    # Swap the store process-wide (not a mock) so the Capybara server thread sees it.
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    ActionController::Base.perform_caching = true
  end

  config.after(:each, :caching) do
    Rails.cache = @__caching_original
    ActionController::Base.perform_caching = @__caching_perform
  end
end
