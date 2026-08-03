# frozen_string_literal: true

module Users
  # JSON "forgot password" for the auth modal. Always 200 (never reveals whether
  # an email exists); Devise queues the reset mail when it does.
  class PasswordsController < Devise::PasswordsController
    respond_to :json

    private

    def respond_with(_resource, _opts = {})
      head :ok
    end
  end
end
