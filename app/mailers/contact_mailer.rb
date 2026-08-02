# frozen_string_literal: true

class ContactMailer < ApplicationMailer
  def contact_message(name:, email:, message:)
    @name = name
    @message = message
    mail(to: RenderingExtension::SUPPORT_EMAIL, reply_to: email, subject: "Contact from #{name}")
  end
end
