# frozen_string_literal: true

require "database_cleaner/active_record"

# Unit/request specs run in a transaction (fast, rolled back). System specs hit a
# real Puma server on a separate DB connection, so their writes can't be rolled
# back — truncate after each instead. This replaces use_transactional_fixtures
# (disabled in rails_helper) with a strategy that also covers the server thread.
RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, type: :system) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) { DatabaseCleaner.start }
  config.append_after(:each) { DatabaseCleaner.clean }
end
