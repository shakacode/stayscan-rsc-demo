# frozen_string_literal: true

# Ruby twin of client/app/libs/imageUrl.js — derives image variant URLs for SSR
# meta tags / JSON serialization. Same URL scheme as the JS builder.
module ImageUrl
  SIZES = %w[thumb tile gallery hero].freeze
  DPRS = [ 1, 2 ].freeze

  module_function

  def build(key, size: "tile", dpr: 1)
    "https://images.example/#{size}@#{dpr}x/#{key}"
  end

  def variants(key)
    SIZES.each_with_object({}) do |size, out|
      DPRS.each { |dpr| out["#{size}@#{dpr}x"] = build(key, size:, dpr:) }
    end
  end
end
