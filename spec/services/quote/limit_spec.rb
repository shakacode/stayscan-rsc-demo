# frozen_string_literal: true

require "rails_helper"

RSpec.describe Quote::Limit do
  it "limits anonymous visitors at the cap and reports remaining" do
    expect(described_class.new(user: nil, used: 5).reached?).to be(true)
    expect(described_class.new(user: nil, used: 4).reached?).to be(false)
    expect(described_class.new(user: nil, used: 2).as_json).to include(limited: true, remaining: 3)
  end

  it "never limits a signed-in user" do
    user = User.create!(email: "u@example.test", password: "password123")

    expect(described_class.new(user: user, used: 100).reached?).to be(false)
    expect(described_class.new(user: user, used: 100).as_json).to include(limited: false, remaining: nil)
  end
end
