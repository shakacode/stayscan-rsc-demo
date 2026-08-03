# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Users auth (JSON)", type: :request do
  it "signs up and returns the user block" do
    post "/users", params: { user: { email: "new@example.test", password: "password123" } }, as: :json

    expect(response).to have_http_status(:created)
    expect(response.parsed_body["user"]).to include("email" => "new@example.test")
  end

  it "returns 422 with messages on invalid sign up" do
    post "/users", params: { user: { email: "bad", password: "x" } }, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.parsed_body["errors"]).to be_present
  end

  it "signs in with valid credentials" do
    User.create!(email: "u@example.test", password: "password123")

    post "/users/sign_in", params: { user: { email: "u@example.test", password: "password123" } }, as: :json

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["user"]).to include("email" => "u@example.test")
  end

  it "rejects bad credentials with 401" do
    User.create!(email: "u@example.test", password: "password123")

    post "/users/sign_in", params: { user: { email: "u@example.test", password: "nope" } }, as: :json

    expect(response).to have_http_status(:unauthorized)
  end

  it "signs out an authenticated session" do
    User.create!(email: "u@example.test", password: "password123")
    post "/users/sign_in", params: { user: { email: "u@example.test", password: "password123" } }, as: :json

    delete "/users/sign_out", as: :json

    expect(response).to have_http_status(:no_content)
  end
end
