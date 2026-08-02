# frozen_string_literal: true

module FakeProviders
  class HostflowController < ApplicationController
    before_action :require_token, except: :token

    def token = render(json: HostflowData.issue_token)
    def properties = render(json: HostflowData.properties(params[:page]))
    def unit = render(json: HostflowData.unit_summary(params[:native_id]))
    def rates = render(json: HostflowData.rates(params[:native_id], date_param(:start_date, 0), days_param))

    private

    def require_token
      return if request.headers["Authorization"].to_s.start_with?("Bearer hf-")

      render json: { error: "unauthorized" }, status: :unauthorized
    end
  end
end
