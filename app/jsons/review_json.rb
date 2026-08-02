# frozen_string_literal: true

# One guest review, shared by the listing-detail view detail payload (page 1) and the paginated
# reviews endpoint so both stay in the same shape.
class ReviewJson
  def initialize(review)
    @review = review
  end

  def as_json(*)
    { id: @review.id, author: @review.author_name, rating: @review.rating,
      content: @review.content, provider: @review.provider_type }
  end
end
