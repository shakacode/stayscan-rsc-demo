# frozen_string_literal: true

# Hostflow (VRS) unit — the "book direct" channel. Owned by a real, auto-verified host.
class HostflowUnit < ApplicationRecord
  belongs_to :owner, class_name: "User", optional: true
  has_one :listing, dependent: :nullify
end
