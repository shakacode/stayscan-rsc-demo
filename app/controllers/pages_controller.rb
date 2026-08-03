# frozen_string_literal: true

# Marketing / legal pages: each renders its own bundle through the shared
# pages/show view. Cheap pages, real bundles.
class PagesController < ApplicationController
  FAQS = [
    { id: "f1", question: "How does StayScan find prices?",
      answer: "We match the same property across partner channels and fetch each one's live nightly price." },
    { id: "f2", question: "Is it cheaper to book direct?",
      answer: "Often — we flag book-direct hosts so you can skip channel service fees." },
    { id: "f3", question: "Does StayScan add markups?",
      answer: "Never. We show each channel's own price and link you straight to it." },
    { id: "f4", question: "How much does StayScan cost?",
      answer: "Comparing and booking is always free. Premium adds price alerts and saved searches." }
  ].freeze

  def about = render_page("About", cms: cms("about"))
  def tos = render_page("Tos", cms: cms("tos"))
  def privacy = render_page("Privacy", cms: cms("privacy"))
  def faq = render_page("Faq", faqs: FAQS)

  def pricing
    render_page("Pricing", premiumPrice: RenderingExtension::PREMIUM_PRICE,
                           businessPrice: RenderingExtension::BUSINESS_PRICE)
  end

  def not_found
    render_page("NotFound", status: :not_found)
  end

  private

  def render_page(component, status: :ok, **extra)
    @component = component
    @props = { layout: layout_json, locale: params[:locale].presence || "en" }.merge(extra)
    render "pages/show", status: status
  end

  def layout_json
    LayoutJson.new(user: current_user, current_currency: session[:currency] || "USD").as_json
  end

  def cms(slug)
    page = ContentPage.find_by(slug: slug)
    page && { title: page.title, body: page.body }
  end
end
