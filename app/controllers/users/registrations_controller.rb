# frozen_string_literal: true

module Users
  # JSON sign up for the navbar auth modal. Validation failures return 422
  # with messages the modal renders inline.
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      if resource.persisted?
        render json: { user: UserJson.new(resource).as_json }, status: :created
      else
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
