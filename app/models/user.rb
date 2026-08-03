# frozen_string_literal: true

# Host / traveler account. Auth is Devise; the navbar drives sign in/up/forgot
# through JSON endpoints.
class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable

  has_many :owned_listings, class_name: "Listing", foreign_key: :owner_id, inverse_of: :owner, dependent: :nullify
  has_many :hostflow_units, foreign_key: :owner_id, inverse_of: :owner, dependent: :nullify
  has_many :trip_lists, dependent: :destroy

  def display_name
    host_name.presence || email
  end
end
