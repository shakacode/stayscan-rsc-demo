# frozen_string_literal: true

require "digest"

class Listing
  # Synthetic stand-in for an async LLM enrichment pass (P: AI content). Fills the
  # three ai_content_* JSONB columns deterministically for ~70% of listings; the
  # rest model an un-enriched backlog that the product pages must render gracefully.
  # Enqueued by RefreshChannelDataJob after denormalization.
  class EnrichAiContent
    COVERAGE_MODULO = 10
    COVERED_BELOW = 7 # ~70% of listings get AI content

    HOST_SUMMARIES = [
      "The host keeps this place spotless and stocks the essentials before every stay.",
      "A longtime local who answers fast and shares the quiet beaches most guests miss.",
      "Thoughtful touches everywhere — from the coffee bar to the beach towels by the door.",
      "Flexible check-in and a binder of hand-picked recommendations for the area."
    ].freeze
    HOST_HIGHLIGHTS = [
      "Self check-in with a smart lock", "Fast fiber wifi for remote work",
      "Beach gear and snorkels provided", "Dedicated parking on site",
      "Fully equipped island kitchen", "Sunset views from the veranda"
    ].freeze
    NEARBY_PLACES = [
      [ "Altara Point tide pools", "calm morning swims a short walk down the path" ],
      [ "Sabel Bay farmers market", "island fruit and fresh ceviche every weekend" ],
      [ "Veska Reef break", "gentle waves that suit first-time surfers" ],
      [ "Ondera Cove boardwalk", "sunset strolls and shave-ice stands" ],
      [ "Marisel falls trail", "a shaded hike ending at a swimming hole" ]
    ].freeze
    REVIEW_THEMES = %w[location cleanliness value hospitality views quiet comfort].freeze

    def self.call(listing) = new(listing).call

    def initialize(listing)
      @listing = listing
      @rng = Random.new(Digest::SHA256.hexdigest("ai-content:#{listing.id}").to_i(16) % (2**31))
    end

    def call
      return unless eligible?

      @listing.update!(
        ai_content_host_summary: from_the_host,
        ai_content_area_highlights: nearby_highlights,
        ai_content_review_digest: review_summary
      )
    end

    private

    def eligible?
      Digest::SHA256.hexdigest("ai-content:#{@listing.id}").to_i(16) % COVERAGE_MODULO < COVERED_BELOW
    end

    def from_the_host
      { "summary" => HOST_SUMMARIES.sample(random: @rng),
        "highlights" => HOST_HIGHLIGHTS.sample(3, random: @rng) }
    end

    def nearby_highlights
      items = NEARBY_PLACES.sample(3, random: @rng).map { |name, blurb| { "name" => name, "blurb" => blurb } }
      { "near" => @listing.city, "items" => items }
    end

    def review_summary
      { "summary" => "Guests consistently praise the #{REVIEW_THEMES.sample(random: @rng)} " \
                     "and the easy #{REVIEW_THEMES.sample(random: @rng)}.",
        "themes" => REVIEW_THEMES.sample(3, random: @rng) }
    end
  end
end
