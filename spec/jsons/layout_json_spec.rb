# frozen_string_literal: true

require "rails_helper"

RSpec.describe LayoutJson do
  it "maps currencies and leaves the user block nil when signed out" do
    Currency.create!(code: "USD", symbol: "$")

    json = described_class.new(currencies: Currency.all, current_currency: "USD").as_json

    expect(json[:user]).to be_nil
    expect(json[:currencies]).to eq([ { code: "USD", symbol: "$" } ])
    expect(json[:currentCurrency]).to eq("USD")
  end

  it "builds the user block from the signed-in user" do
    user = User.create!(password: "password123", email: "host@example.test", host_name: "Kai")

    json = described_class.new(user:).as_json

    expect(json[:user]).to include(id: user.id, name: "Kai", email: "host@example.test")
  end
end
