# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserShowJson do
  it "builds the hero, badges and paginated listings for a verified host" do
    user = create(:user, host_name: "Marine Nerd", host_avatar: "avatars/mn.jpg",
                  host_intro_text: "Local guide", verified_at: Time.current)
    create_list(:aggregate_listing, 5, owner_id: user.id, title: "Reef Villa")

    json = described_class.new(user).as_json

    expect(json).to include(id: user.id, name: "Marine Nerd", avatar: "avatars/mn.jpg",
                            about: "Local guide", joinedYear: user.created_at.year, listingsCount: 5)
    expect(json[:badges]).to eq(verified: true, superhost: true, multiListing: true)
    expect(json[:pagination]).to eq(page: 1, perPage: described_class::PER_PAGE, total: 5)
    expect(json[:listings].first).to include(id: an_instance_of(Integer), title: "Reef Villa")
  end

  it "clears every badge for an unverified host with a single listing" do
    user = create(:user, verified_at: nil)
    create(:aggregate_listing, owner_id: user.id)

    json = described_class.new(user).as_json

    expect(json[:badges]).to eq(verified: false, superhost: false, multiListing: false)
  end

  it "paginates listings at PER_PAGE and reports the full total" do
    stub_const("UserShowJson::PER_PAGE", 2)
    user = create(:user)
    create_list(:aggregate_listing, 3, owner_id: user.id)

    json = described_class.new(user, page: 2).as_json

    expect(json[:listings].size).to eq(1)
    expect(json[:pagination]).to eq(page: 2, perPage: 2, total: 3)
  end

  it "excludes listings without a title" do
    user = create(:user)
    create(:aggregate_listing, owner_id: user.id, title: "Named")
    create(:aggregate_listing, owner_id: user.id, title: nil)

    json = described_class.new(user).as_json

    expect(json[:listingsCount]).to eq(1)
  end
end
