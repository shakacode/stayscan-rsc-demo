# frozen_string_literal: true

class Quote
  # Create a quote and settle each channel independently in the background.
  # Per-channel results stream over QuotesChannel as they land.
  class CreateAsync
    def self.call(**attrs)
      quote = Quote.create!(**attrs, state: "processing")
      quote.listing.listing_channels.pluck(:provider_type).each do |provider_type|
        SettleChannelQuoteJob.perform_later(quote.id, provider_type)
      end
      quote
    end
  end
end
