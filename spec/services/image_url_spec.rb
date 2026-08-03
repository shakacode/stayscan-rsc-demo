# frozen_string_literal: true

require "rails_helper"

RSpec.describe ImageUrl do
  it "builds a size/dpr variant URL" do
    expect(described_class.build("abc/1.jpg", size: "hero", dpr: 2)).to eq("https://images.example/hero@2x/abc/1.jpg")
  end

  it "produces every size x dpr variant" do
    variants = described_class.variants("k")

    expect(variants.keys).to include("thumb@1x", "tile@2x", "hero@2x", "gallery@1x")
  end
end
