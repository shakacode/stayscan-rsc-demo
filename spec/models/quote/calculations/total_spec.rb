# frozen_string_literal: true

require "rails_helper"

RSpec.describe Quote::Calculations::Total do
  let(:listing) do
    Listing.create!(origin: "aggregated",
                    airhive_listing: AirhiveListing.create!(native_id: "a1"))
  end

  def channel(**attrs)
    listing.listing_channels.create!({ provider_type: "airhive", nightly_price_default: 100 }.merge(attrs))
  end

  it "sums nightly rent, fees, per-person night fee, pet fee, and tax" do
    ch = channel(
      static_fee: 50, percent_fee: 0.10, tax_rate: 0.08, pet_fee: 25,
      per_guest_night_fee: 15, per_guest_night_fee_from: 2,
      per_guest_includes_adults: true
    )

    result = described_class.call(
      channel: ch, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4),
      adults: 3, pets: true
    )

    # rent 300; net 300 (no LOS discount at 3 nights); percent 30; static 50;
    # per-person-night 15*(3-2)*3=45; pet 25 => subtotal 450; tax 36 => 486.00
    expect(result.rent).to eq(300)
    expect(result.subtotal).to eq(450)
    expect(result.total).to eq(486)
  end

  it "applies the weekly length-of-stay discount at 7+ nights" do
    ch = channel(weekly_discount: 10)

    result = described_class.call(
      channel: ch, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 8), adults: 1
    )

    # rent 700; weekly -10% => 630; no other fees => total 630
    expect(result.total).to eq(630)
  end

  it "applies the monthly discount at 28+ nights" do
    ch = channel(weekly_discount: 10, monthly_discount: 25)

    result = described_class.call(
      channel: ch, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 29), adults: 1
    )

    # 28 nights * 100 = 2800; monthly -25% => 2100
    expect(result.total).to eq(2100)
  end

  it "reads each night's price from the rate range covering it" do
    ch = channel
    [ 100, 200, 300 ].each_with_index do |price, i|
      ch.channel_rates.create!(during: (Date.new(2026, 1, 1) + i)...(Date.new(2026, 1, 2) + i),
                               nightly_price: price)
    end
    ch.reload

    result = described_class.call(
      channel: ch, check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4), adults: 1
    )

    expect(result.rent).to eq(600)
  end
end
