# frozen_string_literal: true

class HostAlias < ApplicationRecord
  belongs_to :host_identity
end
