# frozen_string_literal: true

# Computes a listing's quality score as a bitmask of trust/quality signals.
# The persisted value lives on listings.score; `top_rated?` is the
# Top-rated predicate.
class ListingScore
  SIGNALS = {
    book_direct: 1 << 0,
    verified: 1 << 1,
    host_info: 1 << 2,
    reviewed: 1 << 3,
    high_rating: 1 << 4,
    multi_channel: 1 << 5
  }.freeze

  HIGH_RATING_THRESHOLD = 4.7
  TRUST_SIGNALS = %i[verified book_direct].freeze

  def initialize(listing)
    @listing = listing
  end

  def bitmask
    active_signals.sum { |signal| SIGNALS.fetch(signal) }
  end

  def signal?(signal)
    active_signals.include?(signal)
  end

  # Top-rated: highly rated AND reviewed AND trusted.
  def top_rated?
    signal?(:high_rating) && signal?(:reviewed) && TRUST_SIGNALS.any? { |s| signal?(s) }
  end

  private

  attr_reader :listing

  def active_signals
    @active_signals ||= SIGNALS.keys.select { |signal| send(:"#{signal}?") }
  end

  def book_direct?
    listing.kind == :book_direct
  end

  def verified?
    listing.verified_owner_id.present?
  end

  def host_info?
    listing.owner&.host_intro_text.present?
  end

  def reviewed?
    listing.reviews_count.to_i.positive?
  end

  def high_rating?
    listing.blended_rating.to_f >= HIGH_RATING_THRESHOLD
  end

  def multi_channel?
    listing.channel_qty >= 2
  end
end
