# frozen_string_literal: true

module Normalizers
  module Airhive
    class Reviews
      def self.call(raw)
        Array(raw["reviews"]).map do |r|
          NormalizedReview.new(author: r["author"], rating: r["stars"], body: r["body"])
        end
      end
    end
  end
end
