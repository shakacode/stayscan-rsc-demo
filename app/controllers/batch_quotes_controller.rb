# frozen_string_literal: true

# Batched async quotes for the browse view live-pricing grid. #create kicks
# off one async quote per visible tile (each channel settles in the background and
# streams over QuotesChannel); #index is the poll fallback the store uses until the
# batch settles. Gated as a single unit against the anonymous quote limit so the
# grid can't be used to bulk-scrape prices.
class BatchQuotesController < ApplicationController
  MAX_BATCH = 20

  def create
    limit = Quote::Limit.new(user: current_user, used: session[:quote_count])
    return render(json: { error: "quote_limit", access: limit.as_json }, status: :forbidden) if limit.reached?

    session[:quote_count] = session[:quote_count].to_i + 1 if current_user.nil?

    quotes = Listing.where(id: Array(params[:listing_ids]).first(MAX_BATCH))
                    .filter_map { |listing| build_quote(listing) }
    remember_quote_ids(*quotes.map(&:id))

    render json: { quotes: quotes.map { |quote| batch_item(quote) } }, status: :created
  end

  def index
    ids = Array(params[:ids]).map(&:to_i).first(MAX_BATCH) & owned_quote_ids
    quotes = Quote.where(id: ids)
    render json: { quotes: quotes.map { |quote| batch_item(quote) } }
  end

  private

  def build_quote(listing)
    return nil if listing.listing_channels.empty?

    Quote::CreateAsync.call(listing: listing, **stay_params)
  end

  def batch_item(quote)
    { listingId: quote.listing_id, quote: QuoteJson.new(quote).as_json }
  end

  def stay_params
    params.permit(:check_in, :check_out, :adults, :children, :infants, :pets).to_h.symbolize_keys
  end
end
