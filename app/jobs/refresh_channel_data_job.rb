# frozen_string_literal: true

# Pulls every channel a listing is offered on back into sync: fetch raw through
# the ChannelDataApi choke point, normalize per provider (the raw schemas differ,
# so this is where the real translation lives), hand the result to ChannelIngest,
# then fold the channels' own view of the listing onto the hub. Re-run
# periodically via sidekiq-cron.
class RefreshChannelDataJob < ApplicationJob
  queue_as :default

  DAYS = 720
  # Channels whose own title/rating/price we surface next to ours.
  QUOTED_CHANNELS = %i[airhive vacario lodgeo].freeze

  def perform(listing_id, start_date: Date.current)
    listing = Listing.find(listing_id)
    api = ChannelDataApi.new

    details = fetchers(listing, api, start_date).filter_map do |channel, fetch|
      [ channel, fetch.call ]
    end.to_h

    fold_onto_listing(listing, details)
    listing.save!

    Identity::LinkManagers.call(listing, details)
    UpdateListingPreviewPriceJob.perform_later(listing.id)
    EnrichListingAiContentJob.perform_later(listing.id)
  end

  private

  # Only the channels this listing is actually on, each with the call that pulls
  # it. Which endpoints to hit is per-provider; what happens next is not.
  def fetchers(listing, api, start_date)
    {
      airhive: (-> { airhive(listing, api, start_date) } if listing.airhive_listing_id),
      vacario: (-> { vacario(listing, api, start_date) } if listing.vacario_listing_id),
      lodgeo: (-> { lodgeo(listing, api, start_date) } if listing.lodgeo_listing_id),
      hostflow: (-> { hostflow(listing, api, start_date) } if listing.hostflow_unit_id)
    }.compact
  end

  def airhive(listing, api, start_date)
    native_id = listing.airhive_listing.native_id
    details = Normalizers::Airhive::Details.call(api.airhive_details(native_id))
    calendar = Normalizers::Airhive::Calendar.call(api.airhive_calendar(native_id, start_date, DAYS))
    ChannelIngest.call(listing, channel: :airhive, details:, calendar:)
    details
  end

  def vacario(listing, api, start_date)
    record = listing.vacario_listing
    details = Normalizers::Vacario::Details.call(api.vacario_details(record.native_id, record.unit_code))
    calendar = Normalizers::Vacario::Calendar.call(api.vacario_calendar(record.native_id, record.unit_code, start_date, DAYS))
    ChannelIngest.call(listing, channel: :vacario, details:, calendar:)
    details
  end

  def lodgeo(listing, api, start_date)
    record = listing.lodgeo_listing
    details = Normalizers::Lodgeo::Details.call(api.lodgeo_details(record.native_id, record.native_unit_id))
    calendar = Normalizers::Lodgeo::Calendar.call(api.lodgeo_calendar(record.native_id, record.native_unit_id, start_date, DAYS))
    ChannelIngest.call(listing, channel: :lodgeo, details:, calendar:)
    details
  end

  def hostflow(listing, api, start_date)
    native_id = listing.hostflow_unit.native_id
    token = api.hostflow_token["access_token"]
    details = Normalizers::Hostflow::Details.call(api.hostflow_unit(native_id, token:))
    calendar = Normalizers::Hostflow::Calendar.call(api.hostflow_rates(native_id, start_date, DAYS, token:))
    ChannelIngest.call(listing, channel: :hostflow, details:, calendar:)
    details
  end

  # One offer row per channel, plus the roll-ups the hub itself serves.
  def fold_onto_listing(listing, details)
    QUOTED_CHANNELS.each do |channel|
      d = details[channel]
      next unless d

      offer = listing.channel_offers.find_or_initialize_by(provider_type: channel.to_s)
      offer.update!(title: d.title, review_rating: d.rating, reviews_count: d.reviews_count,
                    native_price: d.base_price, seen_at: Time.current)
    end

    present = details.values
    listing.title = present.filter_map(&:title).first
    listing.description = present.filter_map(&:description).first
    listing.seo_description = listing.description&.truncate(160)
    listing.lat ||= present.filter_map(&:lat).first
    listing.lng ||= present.filter_map(&:lng).first
    listing.city ||= present.filter_map(&:city).first
    listing.bedrooms ||= present.filter_map(&:bedrooms).first
    listing.bathrooms ||= present.filter_map(&:bathrooms).first
    listing.max_guests ||= present.filter_map(&:max_guests).first
    listing.photos = present.flat_map { |d| Array(d.photos) }.uniq
    listing.amenity_ids = amenity_ids_for(present.filter_map(&:amenities).first)

    ratings = present.filter_map(&:rating)
    listing.blended_rating = (ratings.sum / ratings.size).round(3) if ratings.any?
    listing.reviews_count = present.filter_map(&:reviews_count).sum
    listing.score = listing.listing_score.bitmask
  end

  # Provider amenity codes are catalog bit positions; map them to Amenity ids
  # (the search-row trigger reads bit_position back off these).
  def amenity_ids_for(codes)
    return [] if codes.blank?

    Amenity.where(bit_position: codes).pluck(:id)
  end
end
