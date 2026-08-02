# frozen_string_literal: true

module Normalizers
  module Vacario
    class Reviews
      def self.call(raw)
        Array(raw["reviews"]).map do |r|
          NormalizedReview.new(author: r["reviewer_name"], rating: r["score"], body: r["comment"])
        end
      end
    end
  end
end
