# frozen_string_literal: true

# Thin per-provider channel record. Provider identity only; listing
# content lives on the Listing hub.
class AirhiveListing < ApplicationRecord
  has_one :listing, dependent: :nullify
end
