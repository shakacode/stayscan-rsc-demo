# frozen_string_literal: true

require "rails_helper"

# Note: "each channel ~30%" is the per-roll offer probability;
# because a aggregate_listing must have >=1 OTA (min per-channel marginal is therefore
# 33%), the observed presence rate after the force-one-if-none step is ~40%. The
# real intent is: 1-3 channels, offered roughly evenly, never zero.
RSpec.describe "aggregate_listing factory OTA channel distribution" do
  it "offers each OTA roughly evenly and always attaches at least one" do
    n = 600
    counts = Hash.new(0)
    channel_counts = []

    n.times do
      listing = build(:aggregate_listing)
      present = Listing::OTA_CHANNELS.select { |assoc| listing.public_send(assoc).present? }
      present.each { |assoc| counts[assoc] += 1 }
      channel_counts << present.size
    end

    expect(channel_counts).to all(be >= 1)     # always >= 1 OTA channel
    expect(channel_counts.max).to be <= 3       # never more than the 3 OTAs

    rates = Listing::OTA_CHANNELS.map { |assoc| counts[assoc].to_f / n }
    expect(rates).to all(be_between(0.25, 0.55)) # each offered, none dominant
  end
end
