# frozen_string_literal: true

class TripList < ApplicationRecord
  belongs_to :user, optional: true
  has_many :trip_list_listings, dependent: :destroy
  has_many :listings, through: :trip_list_listings
end
