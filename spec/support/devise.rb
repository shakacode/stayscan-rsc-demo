# frozen_string_literal: true

# `sign_in`/`sign_out` for controller specs (Warden's login_as covers request/system).
RSpec.configure do |config|
  config.include Devise::Test::ControllerHelpers, type: :controller
end
