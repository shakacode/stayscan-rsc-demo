# frozen_string_literal: true

# The price and minimum stay a channel applies over a span of nights. Providers
# send long runs of identical nights, so the reshaper collapses them into a few
# ranges rather than storing a value per night; a GiST exclusion constraint keeps
# a channel's ranges disjoint, so exactly one rate can apply to any night.
class ChannelRate < ApplicationRecord
  belongs_to :listing_channel

  scope :covering, ->(date) { where("during @> ?::date", date) }
end
