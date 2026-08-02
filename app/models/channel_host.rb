# frozen_string_literal: true

class ChannelHost < ApplicationRecord
  belongs_to :host_identity, optional: true
end
