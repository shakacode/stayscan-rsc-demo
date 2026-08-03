# frozen_string_literal: true

module Users
  # JSON sign in/out for the navbar auth modal. Bad credentials surface as
  # 401 via Devise's failure app.
  class SessionsController < Devise::SessionsController
    respond_to :json

    # Sign-in is a navbar modal, not a standalone page. Devise still routes
    # unauthenticated HTML requests here (via authenticate_user!), so send them to a
    # page that has the navbar and flag the modal to open, instead of rendering the
    # JSON body as a broken "page".
    def new
      redirect_to root_path(signIn: true)
    end

    private

    def respond_with(resource, _opts = {})
      render json: { user: UserJson.new(resource).as_json }, status: :ok
    end
  end
end
