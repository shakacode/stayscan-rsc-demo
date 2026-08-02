# frozen_string_literal: true

require "rails_helper"

RSpec.describe LodgeoListing do
  # the deep-link channel ref is not in the feed; resolve it lazily, once.
  describe "#url lazy channel-ref resolution" do
    it "resolves the channel ref on first call and caches it (no second HTTP call)" do
      record = described_class.for_unit(native_id: "lod-9", native_unit_id: "u-3")
      expect(record.channel_ref).to be_blank

      first_url = record.url

      expect(record.reload.channel_ref).to be_present
      expect(first_url).to include(record.channel_ref)

      expect(ChannelDataApi).not_to receive(:new) # second call is cached
      expect(record.url).to eq(first_url)
    end
  end
end
