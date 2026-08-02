# frozen_string_literal: true

class Review < ApplicationRecord
  belongs_to :listing

  validates :rating, inclusion: { in: 1..5 }
end
