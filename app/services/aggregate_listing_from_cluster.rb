# frozen_string_literal: true

# Find-or-create the aggregated listing for a cluster's channel records. Content
# is filled in by RefreshChannelDataJob.
class AggregateListingFromCluster
  def self.call(cluster)
    new(cluster).call
  end

  def initialize(cluster)
    @cluster = cluster
  end

  def call
    listing = Listing.find_or_initialize_by(
      airhive_listing_id: @cluster.airhive_listing_id,
      vacario_listing_id: @cluster.vacario_listing_id,
      lodgeo_listing_id: @cluster.lodgeo_listing_id
    )
    listing.origin = "aggregated" if listing.new_record?
    listing.save!
    listing
  end
end
