# frozen_string_literal: true

require "rails_helper"

RSpec.describe AutocompleteLocation do
  it "surfaces locations that have listings, most-listed first, after a refresh" do
    Location.create!(path: "sy/marenca", name: "Marenca", kind: "region", listings_count: 40)
    Location.create!(path: "sy/corvelle", name: "Corvelle", kind: "region", listings_count: 120)
    Location.create!(path: "sy/tesari", name: "Tesari", kind: "region", listings_count: 0)

    described_class.refresh

    expect(described_class.pluck(:name)).to eq(%w[Corvelle Marenca])
  end
end
