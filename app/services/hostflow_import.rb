# frozen_string_literal: true

# Import path for a Hostflow (VRS) "book direct" listing: create the
# owned, auto-verified listing for a hostflow unit and sync its content. This is
# a pipeline service (like ResolveListingClusterJob) — the seed calls it rather than
# writing listings directly.
class HostflowImport
  def self.call(native_id:, owner:)
    unit = HostflowUnit.find_or_create_by!(native_id:) { |u| u.owner = owner }
    listing = Listing.find_or_initialize_by(hostflow_unit_id: unit.id)
    if listing.new_record?
      listing.origin = "host_managed"
      listing.owner_id = owner.id
      listing.verified_owner_id = owner.id # Hostflow listings are auto-verified
      listing.save!
    end
    RefreshChannelDataJob.perform_now(listing.id)
    listing
  end
end
