# frozen_string_literal: true

require "rails_helper"

RSpec.describe Currency do
  it "converts an amount in this currency to USD" do
    eur = described_class.create!(code: "EUR", rate_to_usd: 1.08)

    expect(eur.to_usd(100)).to eq(108)
  end
end
