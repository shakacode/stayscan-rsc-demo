# frozen_string_literal: true

FactoryBot.define do
  factory :airhive_listing do
    sequence(:native_id) { |n| "airhive-#{n}" }
  end

  factory :vacario_listing do
    sequence(:native_id) { |n| "vacario-#{n}" }
    sequence(:unit_code) { |n| "unit-#{n}" }
  end

  factory :lodgeo_listing do
    sequence(:native_id) { |n| "lodgeo-#{n}" }
    sequence(:native_unit_id) { |n| "lu-#{n}" }
  end

  factory :hostflow_unit do
    sequence(:native_id) { |n| "hostflow-#{n}" }
    association :owner, factory: :user
  end
end
