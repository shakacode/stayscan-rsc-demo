# frozen_string_literal: true

# Async quote endpoints for the listing-detail view booking widget: create settles each
# channel in the background (results stream over QuotesChannel); show is the poll
# fallback. Anonymous fetches are gated (403 -> UsageLimitModal).
class QuotesController < ApplicationController
  def create
    listing = Listing.find(params[:listing_id])
    limit = Quote::Limit.new(user: current_user, used: session[:quote_count])
    return render(json: { error: "quote_limit", access: limit.as_json }, status: :forbidden) if limit.reached?

    session[:quote_count] = session[:quote_count].to_i + 1 if current_user.nil?
    quote = Quote::CreateAsync.call(listing: listing, **quote_params)
    remember_quote_ids(quote.id)
    render json: QuoteJson.new(quote).as_json, status: :created
  end

  def show
    return head(:not_found) unless owned_quote_ids.include?(params[:id].to_i)

    render json: QuoteJson.new(Quote.find(params[:id])).as_json
  end

  private

  def quote_params
    params.require(:quote).permit(:check_in, :check_out, :adults, :children, :infants, :pets)
          .to_h.symbolize_keys
  end
end
