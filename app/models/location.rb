# frozen_string_literal: true

# A destination page: nested geography (country > region > area) with a bounding
# box that browse view search queries against.
class Location < ApplicationRecord
  belongs_to :parent, class_name: "Location", optional: true
  has_many :children, class_name: "Location", foreign_key: :parent_id, inverse_of: :parent, dependent: :nullify

  def contains?(lat, lng)
    return false unless bounded? && lat && lng

    lat.between?(min_lat, max_lat) && lng.between?(min_lng, max_lng)
  end

  # Listings whose coordinates fall inside this location's bounding box.
  def listings
    return Listing.none unless bounded?

    Listing.where(lat: min_lat..max_lat, lng: min_lng..max_lng)
  end

  # Bounding-box params in the shape ListingSearch expects, so a location page
  # searches within its own bounds.
  def search_bounds
    { min_lat:, max_lat:, min_lng:, max_lng: }
  end

  # Root → self chain, for the location-nav breadcrumb.
  def ancestry
    chain = []
    node = self
    while node
      chain.unshift(node)
      node = node.parent
    end
    chain
  end

  private

  def bounded?
    [ min_lat, max_lat, min_lng, max_lng ].all?(&:present?)
  end
end
