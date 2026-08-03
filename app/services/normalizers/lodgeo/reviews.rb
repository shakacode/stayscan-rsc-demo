# frozen_string_literal: true

module Normalizers
  module Lodgeo
    class Reviews
      def self.call(raw)
        Array(raw.dig("Reviews", "Review")).map do |r|
          NormalizedReview.new(author: r["Author"], rating: r["Score"].to_i, body: r["Text"])
        end
      end
    end
  end
end
