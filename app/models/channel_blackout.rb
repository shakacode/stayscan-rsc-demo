# frozen_string_literal: true

# A span of nights a channel is closed. `kind` says which calendar it closes:
# `stay` blocks the night itself, `check_in`/`check_out` block only arrival or
# departure on those dates (a night can be bookable mid-stay but unavailable to
# start on). A GiST exclusion constraint keeps spans of the same kind disjoint.
class ChannelBlackout < ApplicationRecord
  KINDS = %w[stay check_in check_out].freeze

  belongs_to :listing_channel

  enum :kind, KINDS.index_with(&:itself)

  scope :covering, ->(date) { where("during @> ?::date", date) }
end
