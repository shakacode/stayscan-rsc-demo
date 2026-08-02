# frozen_string_literal: true

# Static marketing/legal content (home blurbs, FAQ, TOS, privacy) rendered by the
# layout and footer. Seeded; edited out-of-band.
class ContentPage < ApplicationRecord
  SLUGS = %w[home about faq tos privacy].freeze

  validates :slug, presence: true, uniqueness: true
  validates :title, presence: true
end
