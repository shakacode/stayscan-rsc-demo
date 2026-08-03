# frozen_string_literal: true

# Async AI-content enrichment (P: AI content). Enqueued after a listing syncs;
# fills the ai_content_* columns for eligible listings.
class EnrichListingAiContentJob < ApplicationJob
  queue_as :default

  def perform(listing_id)
    Listing::EnrichAiContent.call(Listing.find(listing_id))
  end
end
