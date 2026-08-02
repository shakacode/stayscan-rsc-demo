# frozen_string_literal: true

class Quote
  # Synchronous variant: settle every channel inline (specs / server-side use).
  class Create
    def self.call(**attrs)
      quote = Quote.create!(**attrs, state: "processing")
      quote.listing.listing_channels.pluck(:provider_type).each do |provider_type|
        SettleChannelQuoteJob.perform_now(quote.id, provider_type)
      end
      quote.reload
    end
  end
end
