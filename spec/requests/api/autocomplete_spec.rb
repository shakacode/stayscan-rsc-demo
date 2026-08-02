# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Autocomplete", type: :request do
  it "returns matview destinations matching the prefix, densest first" do
    Location.create!(path: "sy/marenca/kivora", name: "Kivora", kind: "area", listings_count: 900)
    Location.create!(path: "sy/marenca/kirona", name: "Kirona", kind: "area", listings_count: 200)
    Location.create!(path: "sy/marenca/marisel", name: "Marisel", kind: "area", listings_count: 300)
    AutocompleteLocation.refresh

    get "/api/autocomplete", params: { q: "ki" }

    results = response.parsed_body["results"]
    expect(results.map { |row| row["name"] }).to eq(%w[Kivora Kirona])
    expect(results.first).to include("name" => "Kivora", "path" => "sy/marenca/kivora", "listingsCount" => 900)
  end

  it "returns nothing for a query shorter than the minimum" do
    get "/api/autocomplete", params: { q: "k" }

    expect(response.parsed_body["results"]).to eq([])
  end
end
