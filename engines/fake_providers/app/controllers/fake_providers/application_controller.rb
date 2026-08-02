# frozen_string_literal: true

module FakeProviders
  # Base controller for the synthetic provider APIs. Adds the chaos knobs
  # (latency + error injection) so the sync/quote pipelines are exercised against
  # realistic timeouts and failures.
  class ApplicationController < ActionController::API
    before_action :inject_latency
    before_action :maybe_inject_error

    private

    def inject_latency
      ms = ENV.fetch("FAKE_PROVIDER_LATENCY_MS", "0").to_i
      sleep(ms / 1000.0) if ms.positive?
    end

    def maybe_inject_error
      rate = ENV.fetch("FAKE_PROVIDER_ERROR_RATE", "0").to_f
      return unless rate.positive? && rand < rate

      render json: { error: "injected_provider_error" }, status: :service_unavailable
    end

    def date_param(key, default_offset_days)
      params[key].present? ? Date.parse(params[key]) : Date.current + default_offset_days
    end

    MAX_CALENDAR_DAYS = 1000 # providers publish up to a ~3-year availability window

    def days_param
      params[:days].present? ? params[:days].to_i.clamp(1, MAX_CALENDAR_DAYS) : 90
    end
  end
end
