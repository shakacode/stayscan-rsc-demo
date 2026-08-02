# frozen_string_literal: true

# One provider's availability + pricing for a listing. A night inside
# `calendar_window` is bookable unless a blackout range covers it; a night we
# were never told about falls back to the *_default flags. Price and minimum
# stay come from the rate range covering the night, else the fallbacks.
class ListingChannel < ApplicationRecord
  PROVIDER_TYPES = %w[stayscan airhive vacario lodgeo hostflow rentora].freeze

  belongs_to :listing
  has_many :channel_blackouts, dependent: :delete_all
  has_many :channel_rates, dependent: :delete_all

  enum :provider_type, PROVIDER_TYPES.index_with(&:itself)

  def available_for_stay?(date)
    open?("stay", date) { stay_availability_default }
  end

  def available_for_check_in?(date)
    open?("check_in", date) { check_in_availability_default }
  end

  def available_for_check_out?(date)
    open?("check_out", date) { check_out_availability_default }
  end

  def night_price(date)
    rate_at(date)&.nightly_price || nightly_price_default
  end

  def minimum_stay(date)
    rate_at(date)&.min_stay || min_stay_default
  end

  private

  # Inside the window the blackouts are authoritative; outside it we have no
  # data for that night, so the caller's fallback decides.
  def open?(kind, date)
    day = date.to_date
    return yield unless known?(day)

    channel_blackouts.none? { |blackout| blackout.kind == kind && blackout.during.cover?(day) }
  end

  def known?(day)
    calendar_window.present? && calendar_window.cover?(day)
  end

  def rate_at(date)
    day = date.to_date
    channel_rates.find { |rate| rate.during.cover?(day) }
  end
end
