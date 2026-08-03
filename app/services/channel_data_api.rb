# frozen_string_literal: true

require "faraday"
require "faraday/retry"

# The single HTTP choke point to the provider APIs. Everything downstream
# consumes normalized data and never knows the responses are synthetic. In test
# it talks to the mounted FakeProviders engine in-process via the Rack adapter;
# elsewhere it makes real HTTP calls.
class ChannelDataApi
  class Error < StandardError; end
  class NotFound < Error; end
  class Timeout < Error; end
  class ProviderError < Error; end

  class << self
    attr_writer :base_url, :adapter

    def base_url
      @base_url ||= ENV.fetch("FAKE_PROVIDERS_URL", "http://localhost:3000/fake-providers/")
    end

    def adapter
      @adapter ||= Rails.env.test? ? [ :rack, Rails.application ] : [ Faraday.default_adapter ]
    end
  end

  # --- Airhive (nested) ---
  def airhive_details(native_id) = get("airhive/v1/listings/#{native_id}")
  def airhive_calendar(native_id, start_date, days) = get("airhive/v1/listings/#{native_id}/calendar", { start_date:, days: })
  def airhive_reviews(native_id) = get("airhive/v1/listings/#{native_id}/reviews")
  def airhive_quote(native_id, check_in, check_out, guests) = get("airhive/v1/listings/#{native_id}/quote", { check_in:, check_out:, guests: })

  # --- Vacario (flat, native_id + unit_code) ---
  def vacario_details(native_id, unit_code) = get("vacario/units/#{native_id}/#{unit_code}")
  def vacario_calendar(native_id, unit_code, start_date, days) = get("vacario/units/#{native_id}/#{unit_code}/calendar", { start_date:, days: })
  def vacario_reviews(native_id, unit_code) = get("vacario/units/#{native_id}/#{unit_code}/reviews")
  def vacario_quote(native_id, unit_code, check_in, check_out, guests) = get("vacario/units/#{native_id}/#{unit_code}/quote", { check_in:, check_out:, guests: })

  # --- Lodgeo (XML-ish; deep-link channel_ref resolved separately) ---
  def lodgeo_details(native_id, unit_id) = get("lodgeo/properties/#{native_id}/#{unit_id}")
  def lodgeo_channel_ref(native_id, unit_id) = get("lodgeo/properties/#{native_id}/#{unit_id}/channel-ref")
  def lodgeo_calendar(native_id, unit_id, start_date, days) = get("lodgeo/properties/#{native_id}/#{unit_id}/calendar", { start_date:, days: })
  def lodgeo_reviews(native_id, unit_id) = get("lodgeo/properties/#{native_id}/#{unit_id}/reviews")
  def lodgeo_quote(native_id, unit_id, check_in, check_out, guests) = get("lodgeo/properties/#{native_id}/#{unit_id}/quote", { check_in:, check_out:, guests: })

  # --- Hostflow (VRS; token-authenticated) ---
  def hostflow_token = post("hostflow/tokens")
  def hostflow_properties(page:, token:) = get("hostflow/properties", { page: }, token:)
  def hostflow_unit(native_id, token:) = get("hostflow/units/#{native_id}", {}, token:)
  def hostflow_rates(native_id, start_date, days, token:) = get("hostflow/units/#{native_id}/rates", { start_date:, days: }, token:)

  private

  def get(path, params = {}, token: nil)
    request(:get, path, params, token:)
  end

  def post(path, params = {}, token: nil)
    request(:post, path, params, token:)
  end

  # Always send params as the query string with no request body, so POSTs (e.g.
  # the token handshake) work uniformly through every adapter.
  def request(method, path, params, token:)
    response = connection.run_request(method, path, nil, nil) do |req|
      req.params.update(params) if params.present?
      req.headers["Authorization"] = "Bearer #{token}" if token
    end
    JSON.parse(response.body)
  rescue Faraday::ResourceNotFound
    raise NotFound, "#{method.upcase} #{path} -> 404"
  rescue Faraday::TimeoutError
    raise Timeout, "#{method.upcase} #{path} timed out"
  rescue Faraday::Error => e
    raise ProviderError, "#{method.upcase} #{path} failed: #{e.message}"
  end

  def connection
    @connection ||= Faraday.new(url: self.class.base_url) do |f|
      f.request :retry, max: 2, interval: 0.05,
                        exceptions: [ Faraday::TimeoutError, Faraday::ConnectionFailed, Faraday::ServerError ]
      f.response :raise_error
      f.options.timeout = ENV.fetch("CHANNEL_API_TIMEOUT", "5").to_f
      f.adapter(*self.class.adapter)
    end
  end
end
