# frozen_string_literal: true

# Account settings — the action-heavy Redux page: profile, email prefs,
# password, and delete-account, in a tabbed form. Sign-in required.
class AccountsController < ApplicationController
  before_action :authenticate_user!

  def edit
    @props = {
      account: {
        id: current_user.id,
        name: current_user.host_name,
        email: current_user.email,
        about: current_user.host_intro_text,
        avatar: current_user.host_avatar
      },
      layout: LayoutJson.new(user: current_user).as_json,
      locale: params[:locale].presence || "en"
    }
    render "accounts/edit"
  end
end
