# frozen_string_literal: true

class TripListListing < ApplicationRecord
  belongs_to :trip_list
  belongs_to :listing
end
