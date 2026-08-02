# frozen_string_literal: true

# What one channel says about one listing: its own title, rating, review count
# and headline price, as of the last sync. The aggregate listing rolls these up
# (blended rating, total reviews) and the comparison table renders them side by
# side, so a listing carries one row per channel it is actually offered on.
class ChannelOffer < ApplicationRecord
  belongs_to :listing

  scope :rated, -> { where.not(review_rating: nil) }
end
