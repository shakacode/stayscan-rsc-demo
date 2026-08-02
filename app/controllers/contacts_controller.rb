# frozen_string_literal: true

# Contact page: renders the form bundle, and receives the JSON submission
# which is mailed (mailcatcher in development).
class ContactsController < ApplicationController
  def new
    @component = "Contact"
    @props = { layout: LayoutJson.new(user: current_user).as_json, locale: params[:locale].presence || "en" }
    render "pages/show"
  end

  def create
    ContactMailer.contact_message(**contact_params.to_h.symbolize_keys).deliver_later
    head :ok
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message)
  end
end
