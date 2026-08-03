# frozen_string_literal: true

require "digest"

module FakeProviders
  # Seeds an RNG from a provider id + purpose so a given listing always yields
  # the same synthetic details/calendar/reviews, independent of call order and
  # without any stored fixtures.
  module Deterministic
    module_function

    def rng(*parts)
      seed = Digest::SHA256.hexdigest(parts.join("::")).to_i(16) % (2**31)
      Random.new(seed)
    end
  end
end
