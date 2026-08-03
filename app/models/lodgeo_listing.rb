# frozen_string_literal: true

# Thin Lodgeo channel record. Lodgeo's public deep-link needs an opaque
# `channel_ref` the provider assigns per (property, unit) — it is NOT in the
# property feed. Resolve it lazily via a separate call the first time a URL is
# built, then cache it on the row (the quirk).
class LodgeoListing < ApplicationRecord
  has_one :listing, dependent: :nullify

  def self.for_unit(native_id:, native_unit_id:)
    find_or_create_by!(native_id:, native_unit_id:)
  end

  def url
    resolve_channel_ref! if channel_ref.blank?
    "https://lodgeo.example/go/#{channel_ref}"
  end

  private

  # Fetch + persist the channel ref once; concurrent-safe via a row lock.
  def resolve_channel_ref!
    with_lock do
      return if channel_ref.present?

      ref = ChannelDataApi.new.lodgeo_channel_ref(native_id, native_unit_id).dig("Property", "ChannelRef")
      update!(channel_ref: ref)
    end
  end
end
