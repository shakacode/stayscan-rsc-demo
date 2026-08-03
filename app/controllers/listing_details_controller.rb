# frozen_string_literal: true

# Listing detail page — the deepest page. HTTP-cached on the listing +
# viewer + currency so a repeat anonymous request is a 304.
class ListingDetailsController < ApplicationController
  PLANS = [
    { code: "premium", name: "Premium", price: RenderingExtension::PREMIUM_PRICE },
    { code: "business", name: "Business", price: RenderingExtension::BUSINESS_PRICE }
  ].freeze

  def show
    @listing = Listing.find(params[:id])

    RecordPageViewJob.perform_later(path: "listing_detail", listing_id: @listing.id)

    # no-cache = cache but always revalidate via the ETag, so a repeat request still
    # 304s while a new deploy (asset_version in the ETag) is picked up immediately —
    # a heuristically-fresh cached document can never hydrate against a newer bundle.
    return unless stale?(etag: cache_key, last_modified: @listing.updated_at,
                         cache_control: { public: current_user.nil?, no_cache: true })

    @props = { listing: listing_detail_json, layout: LayoutJson.new(user: current_user).as_json,
               locale: params[:locale].presence || "en" }
    render :show
  end

  private

  def cache_key
    [ @listing, current_user&.id || "anon", session[:currency] || "USD", asset_version ]
  end

  def listing_detail_json
    quote_allowance = Quote::Limit.new(user: current_user, used: session[:quote_count]).as_json
    ListingDetailJson.new(@listing, current_user: current_user, quote_allowance: quote_allowance, plans: PLANS).as_json
  end
end
