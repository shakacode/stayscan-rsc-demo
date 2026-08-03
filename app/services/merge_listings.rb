# frozen_string_literal: true

# Host-confirmed merge: register the channel records as one property and process
# the match immediately.
class MergeListings
  def self.call(airhive_listing_id: nil, vacario_listing_id: nil, lodgeo_listing_id: nil)
    match = ListingCluster.observe(airhive_listing_id:, vacario_listing_id:, lodgeo_listing_id:)
    ResolveListingClusterJob.perform_now(match.id)
    match.reload
  end
end
