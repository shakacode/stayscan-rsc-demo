# frozen_string_literal: true

require "rails_helper"

# the Postgres total_price function and the Ruby
# Quote::Calculations::Total must agree, so search/tile pricing (SQL) and full
# quotes (Ruby) never diverge.
RSpec.describe "total_price SQL/Ruby parity" do
  let(:listing) do
    Listing.create!(origin: "aggregated",
                    airhive_listing: AirhiveListing.create!(native_id: "p1"))
  end

  # channel attrs => stay params. `rates:` becomes channel_rates ranges. Covers
  # flat + ranged prices, weekly & monthly discounts, per-person stay+night fees,
  # pet, percent fee, tax.
  scenarios = {
    "flat, no fees" => [
      { nightly_price_default: 100 },
      { check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4), adults: 2 }
    ],
    "all fees + tax" => [
      { nightly_price_default: 137, static_fee: 55, percent_fee: 0.12, tax_rate: 0.0825, pet_fee: 30,
        per_guest_night_fee: 12, per_guest_night_fee_from: 2,
        per_guest_stay_fee: 40, per_guest_stay_fee_from: 1,
        per_guest_includes_adults: true, per_guest_includes_children: true },
      { check_in: Date.new(2026, 3, 10), check_out: Date.new(2026, 3, 15), adults: 3, children: 2, pets: true }
    ],
    "weekly discount (7 nights)" => [
      { nightly_price_default: 90, weekly_discount: 15, tax_rate: 0.07 },
      { check_in: Date.new(2026, 2, 1), check_out: Date.new(2026, 2, 8), adults: 2 }
    ],
    "monthly discount (30 nights)" => [
      { nightly_price_default: 80, weekly_discount: 10, monthly_discount: 30, static_fee: 100 },
      { check_in: Date.new(2026, 4, 1), check_out: Date.new(2026, 5, 1), adults: 1 }
    ],
    "ranged prices" => [
      { nightly_price_default: 100, percent_fee: 0.10,
        rates: [ [ Date.new(2026, 6, 1)...Date.new(2026, 6, 2), 120 ],
                 [ Date.new(2026, 6, 2)...Date.new(2026, 6, 4), 150 ],
                 [ Date.new(2026, 6, 4)...Date.new(2026, 6, 5), 200 ],
                 [ Date.new(2026, 6, 5)...Date.new(2026, 6, 6), 90 ] ] },
      { check_in: Date.new(2026, 6, 1), check_out: Date.new(2026, 6, 6), adults: 2 }
    ],
    "stay reaching past the priced ranges" => [
      { nightly_price_default: 175,
        rates: [ [ Date.new(2026, 6, 1)...Date.new(2026, 6, 2), 120 ],
                 [ Date.new(2026, 6, 2)...Date.new(2026, 6, 3), 150 ] ] },
      { check_in: Date.new(2026, 6, 1), check_out: Date.new(2026, 6, 5), adults: 2 }
    ]
  }

  def sql_total_price(channel, params)
    conn = ActiveRecord::Base.connection
    conn.select_value(
      "SELECT total_price(#{channel.id}, #{conn.quote(params[:check_in])}, " \
      "#{conn.quote(params[:check_out])}, #{params[:adults]}, #{params.fetch(:children, 0)}, " \
      "#{params.fetch(:infants, 0)}, #{conn.quote(params.fetch(:pets, false))})"
    ).to_d
  end

  scenarios.each do |name, (attrs, params)|
    it "agrees for: #{name}" do
      rates = attrs[:rates] || []
      channel = listing.listing_channels.create!(attrs.except(:rates).merge(provider_type: "airhive"))
      rates.each { |during, price| channel.channel_rates.create!(during:, nightly_price: price) }
      channel.reload

      ruby = Quote::Calculations::Total.call(channel:, **params).total
      sql = sql_total_price(channel, params)

      expect(sql).to eq(ruby)
    end
  end

  describe "available_total_price" do
    def sql_available(channel, params)
      conn = ActiveRecord::Base.connection
      conn.select_value(
        "SELECT available_total_price(#{channel.id}, #{conn.quote(params[:check_in])}, " \
        "#{conn.quote(params[:check_out])}, #{params[:adults]}, 0, 0, false)"
      )
    end

    it "equals total_price when every night is available" do
      channel = listing.listing_channels.create!(
        provider_type: "airhive", nightly_price_default: 100,
        calendar_window: Date.new(2026, 1, 1)...Date.new(2026, 1, 4), stay_availability_default: false
      )
      params = { check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4), adults: 1 }

      expect(sql_available(channel, params).to_d).to eq(Quote::Calculations::Total.call(channel:, **params).total)
    end

    it "is NULL when a blackout covers any night of the stay" do
      channel = listing.listing_channels.create!(
        provider_type: "airhive", nightly_price_default: 100,
        calendar_window: Date.new(2026, 1, 1)...Date.new(2026, 1, 4), stay_availability_default: false
      )
      channel.channel_blackouts.create!(kind: "stay",
                                        during: Date.new(2026, 1, 2)...Date.new(2026, 1, 3))
      params = { check_in: Date.new(2026, 1, 1), check_out: Date.new(2026, 1, 4), adults: 1 }

      expect(sql_available(channel, params)).to be_nil
    end
  end
end
