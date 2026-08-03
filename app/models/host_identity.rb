# frozen_string_literal: true

class HostIdentity < ApplicationRecord
  has_many :channel_hosts, dependent: :nullify
  has_many :host_aliases, dependent: :destroy
end
