# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Contacts", type: :request do
  it "mails the contact message and returns ok" do
    expect do
      post "/contact", params: { contact: { name: "Ada", email: "ada@example.test", message: "Hi" } }, as: :json
    end.to have_enqueued_mail(ContactMailer, :contact_message)

    expect(response).to have_http_status(:ok)
  end
end
