# frozen_string_literal: true

# Resolves one cluster of channel records into an aggregated listing, then pulls
# that listing's channel content in. Clusters are marked resolved so the resolver
# only revisits one when something re-observes the property.
class ResolveListingClusterJob < ApplicationJob
  queue_as :default

  def perform(cluster_id)
    cluster = ListingCluster.find(cluster_id)
    listing = AggregateListingFromCluster.call(cluster)
    listing.update!(listing_cluster_id: cluster.id)
    RefreshChannelDataJob.perform_now(listing.id)
    cluster.resolved!
    listing
  end
end
