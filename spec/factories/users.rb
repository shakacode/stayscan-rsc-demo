# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.test" }
    password { "password123" }
    host_name { Faker::Name.name }
    host_intro_text { Faker::Lorem.sentence }
  end
end
