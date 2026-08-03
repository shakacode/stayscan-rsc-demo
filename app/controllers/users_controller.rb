# frozen_string_literal: true

# Public user/host profile pages. #show is the traveler/host profile;
# HostsController renders the host variant + the map view from the same JSON.
class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    RecordPageViewJob.perform_later(path: "user", listing_id: nil)
    @props = props_for(@user, variant: "user")
    render "users/show"
  end

  private

  def props_for(user, variant:)
    {
      user: UserShowJson.new(user, page: params[:page]).as_json,
      variant: variant,
      layout: LayoutJson.new(user: current_user).as_json,
      locale: params[:locale].presence || "en"
    }
  end
end
