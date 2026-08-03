# frozen_string_literal: true

# A set of channel records we believe describe one physical property. Resolving a
# cluster is what produces (or updates) the aggregated listing; `resolved_at` is
# null while a cluster is waiting to be resolved, so re-observing a property
# simply clears it and the resolver picks it up again.
class ListingCluster < ApplicationRecord
  scope :pending, -> { where(resolved_at: nil) }

  # Record that these channel records belong together, and mark the cluster as
  # needing (re)resolution.
  def self.observe(airhive_listing_id: nil, vacario_listing_id: nil, lodgeo_listing_id: nil)
    cluster = find_or_create_by!(airhive_listing_id:, vacario_listing_id:, lodgeo_listing_id:)
    cluster.update!(resolved_at: nil) if cluster.resolved_at
    cluster
  end

  def resolved!
    update!(resolved_at: Time.current)
  end
end
