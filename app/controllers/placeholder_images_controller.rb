# frozen_string_literal: true

require "digest"

# Serves deterministic placeholder images (an SVG whose color is derived from the
# key) so listings have distinct photos without any real/copyrighted assets.
class PlaceholderImagesController < ApplicationController
  def show
    key = params[:key].to_s
    color = "##{Digest::MD5.hexdigest(key)[0, 6]}"
    svg = <<~SVG
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
        <rect width="400" height="300" fill="#{color}"/>
      </svg>
    SVG

    expires_in 1.year, public: true
    render body: svg, content_type: "image/svg+xml"
  end
end
