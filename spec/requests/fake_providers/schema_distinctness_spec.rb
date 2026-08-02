# frozen_string_literal: true

require "rails_helper"

# the three OTA "details" payloads for the same property must be
# genuinely different shapes, forcing the normalizers to do real translation.
RSpec.describe "provider raw-schema distinctness", type: :request do
  def flatten_key_paths(obj, prefix = "")
    case obj
    when Hash then obj.flat_map { |k, v| flatten_key_paths(v, "#{prefix}#{k}/") }
    when Array then obj.flat_map { |v| flatten_key_paths(v, "#{prefix}*/") }
    else [ prefix ]
    end
  end

  it "shares < 30% of flattened key paths between any two OTA detail payloads" do
    get "/fake-providers/airhive/v1/listings/p1"
    airhive = flatten_key_paths(response.parsed_body).uniq
    get "/fake-providers/vacario/units/p1/u1"
    vacario = flatten_key_paths(response.parsed_body).uniq
    get "/fake-providers/lodgeo/properties/p1/u1"
    lodgeo = flatten_key_paths(response.parsed_body).uniq

    [ [ airhive, vacario ], [ airhive, lodgeo ], [ vacario, lodgeo ] ].each do |a, b|
      shared_fraction = (a & b).size.to_f / [ a.size, b.size ].min
      expect(shared_fraction).to be < 0.30
    end
  end
end
