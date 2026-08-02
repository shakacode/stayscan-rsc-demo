# frozen_string_literal: true

module Identity
  # Populate the host-identity graph from parsed provider host names:
  # group channel records under a HostIdentity via per-channel ChannelHosts.
  class LinkManagers
    CHANNEL_RECORDS = { airhive: :airhive_listing, vacario: :vacario_listing,
                        lodgeo: :lodgeo_listing, hostflow: :hostflow_unit }.freeze

    def self.call(listing, details)
      new(listing, details).call
    end

    def initialize(listing, details)
      @listing = listing
      @details = details
    end

    def call
      @details.each do |channel, d|
        next if d.host_name.blank?

        record = @listing.public_send(CHANNEL_RECORDS.fetch(channel))
        next unless record

        host_identity = HostIdentity.find_or_create_by!(slug: d.host_name.parameterize) { |m| m.name = d.host_name }
        ChannelHost.find_or_create_by!(provider_type: channel.to_s, native_id: record.native_id) do |manager|
          manager.name = d.host_name
          manager.host_identity = host_identity
        end
      end
    end
  end
end
