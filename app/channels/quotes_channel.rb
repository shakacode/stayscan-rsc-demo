# frozen_string_literal: true

# Streams per-channel quote results to the browser as each channel settles.
# Clients subscribe with a quote_id.
class QuotesChannel < ApplicationCable::Channel
  def subscribed
    quote = Quote.find_by(id: params[:quote_id])
    quote ? stream_for(quote) : reject
  end
end
