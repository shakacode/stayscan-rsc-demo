# frozen_string_literal: true

# The aggregation hub. Brings one physical property's provider channels
# together. An *aggregated* listing was assembled from matched channel records
# and has no owner; a Hostflow/Rentora-backed listing is host-managed and is
# "book direct".
class Listing < ApplicationRecord
  ORIGINS = %w[aggregated host_managed].freeze

  # OTA channels are separate records linked by FK (not subclasses).
  OTA_CHANNELS = %i[airhive_listing vacario_listing lodgeo_listing].freeze

  enum :origin, ORIGINS.index_with(&:itself)

  belongs_to :owner, class_name: "User", optional: true
  belongs_to :airhive_listing, optional: true
  belongs_to :vacario_listing, optional: true
  belongs_to :lodgeo_listing, optional: true
  belongs_to :hostflow_unit, optional: true

  # Per-provider availability + pricing engine.
  has_many :listing_channels, dependent: :destroy
  # What each channel says about this listing — rolled up into the aggregate.
  has_many :channel_offers, dependent: :destroy
  has_many :reviews, dependent: :destroy

  def aggregate_listing?
    aggregated?
  end

  def listing_score
    ListingScore.new(self)
  end

  # Persist the quality bitmask onto listings.score.
  def update_score!
    update!(score: listing_score.bitmask)
  end

  def top_rated?
    listing_score.top_rated?
  end

  # Number of provider channels this listing aggregates (OTAs + VRS).
  def channel_qty
    ota_channel_count + vrs_channel_count
  end

  # :book_direct (has a VRS/direct channel) | :cross_listed (2+ OTAs) | :regular (single OTA).
  def kind
    return :book_direct if vrs_channel_count.positive?

    ota_channel_count >= 2 ? :cross_listed : :regular
  end

  private

  def ota_channel_count
    OTA_CHANNELS.count { |channel| public_send(:"#{channel}_id").present? }
  end

  def vrs_channel_count
    [ hostflow_unit_id, rentora_native_id ].count(&:present?)
  end
end
