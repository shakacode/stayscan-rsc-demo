# frozen_string_literal: true

require "rails_helper"

RSpec.describe ListingChannel do
  # The channel knows about the four nights from start_date; the second night is
  # blacked out, and each night is priced by the rate range covering it.
  let(:start_date) { Date.new(2026, 1, 1) }
  let(:listing) do
    Listing.create!(origin: "aggregated",
                    airhive_listing: AirhiveListing.create!(native_id: "a1"))
  end
  let(:channel) do
    channel = listing.listing_channels.create!(
      provider_type: "airhive",
      calendar_window: start_date...(start_date + 4),
      stay_availability_default: false,
      nightly_price_default: 200,
      min_stay_default: 7
    )
    channel.channel_blackouts.create!(kind: "stay", during: (start_date + 1)...(start_date + 2))
    channel.channel_rates.create!(during: start_date...(start_date + 1), nightly_price: 100, min_stay: 1)
    channel.channel_rates.create!(during: (start_date + 1)...(start_date + 2), nightly_price: 120, min_stay: 2)
    channel.channel_rates.create!(during: (start_date + 2)...(start_date + 4), nightly_price: 90, min_stay: 3)
    channel.reload
  end

  describe "#available_for_stay?" do
    it "is open unless a blackout range covers the night" do
      expect(channel.available_for_stay?(start_date)).to be(true)
      expect(channel.available_for_stay?(start_date + 1)).to be(false) # blacked out
      expect(channel.available_for_stay?(start_date + 3)).to be(true)
    end

    it "falls back to the constant for nights outside the known window" do
      expect(channel.available_for_stay?(start_date + 10)).to be(false) # constant = false
    end
  end

  describe "#night_price" do
    it "reads the price from the rate range covering the night" do
      expect(channel.night_price(start_date + 1)).to eq(120)
    end

    it "falls back to the constant outside the window" do
      expect(channel.night_price(start_date + 10)).to eq(200)
    end
  end

  describe "#minimum_stay" do
    it "reads the minimum stay from the rate range covering the night" do
      expect(channel.minimum_stay(start_date + 2)).to eq(3)
    end

    it "falls back to the constant outside the window" do
      expect(channel.minimum_stay(start_date + 10)).to eq(7)
    end
  end

  describe "the calendar's exclusion constraints" do
    it "refuses a rate range that overlaps one already stored" do
      expect { channel.channel_rates.create!(during: start_date...(start_date + 2), nightly_price: 999) }
        .to raise_error(ActiveRecord::StatementInvalid, /channel_rates_no_overlap/)
    end
  end
end
