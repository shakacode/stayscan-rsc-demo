# frozen_string_literal: true

require "rails_helper"

RSpec.describe Listing::EnrichAiContent do
  def make_listing(index)
    Listing.create!(origin: "aggregated", city: "Kivora",
                    airhive_listing: AirhiveListing.create!(native_id: "enrich-#{index}"))
  end

  it "fills the three ai_content columns with structured content for eligible listings only" do
    listings = Array.new(40) { |i| make_listing(i) }

    listings.each { |listing| described_class.call(listing) }
    listings.each(&:reload)

    enriched = listings.select { |listing| listing.ai_content_host_summary.present? }
    bare = listings - enriched

    expect(enriched).not_to be_empty
    expect(bare).not_to be_empty # gating leaves an un-enriched backlog the pages must handle

    sample = enriched.first
    expect(sample.ai_content_host_summary.keys).to contain_exactly("summary", "highlights")
    expect(sample.ai_content_host_summary["highlights"].size).to eq(3)
    expect(sample.ai_content_area_highlights["items"].size).to eq(3)
    expect(sample.ai_content_review_digest["themes"].size).to eq(3)
  end

  it "is deterministic: re-running yields identical content" do
    listing = make_listing(1)

    described_class.call(listing)
    first = listing.reload.ai_content_host_summary

    described_class.call(listing)

    expect(listing.reload.ai_content_host_summary).to eq(first)
  end
end
