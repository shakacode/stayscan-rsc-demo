# frozen_string_literal: true

require "rails_helper"

RSpec.describe RenderingExtension do
  # A desktop browser (no mobile/tablet tokens).
  DESKTOP_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " \
               "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  # An iPhone (mobile).
  MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " \
              "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  # An iPad (tablet).
  TABLET_UA = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " \
              "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

  def view_context_for(user_agent, cookies: {}, referer: nil)
    request = double("request", user_agent: user_agent, cookies: cookies, referer: referer)
    double("view_context", request: request)
  end

  it "provides at least 20 rails context keys" do
    context = described_class.custom_context(view_context_for(DESKTOP_UA))

    expect(context.keys.size).to be >= 20
    expect(context).to include(
      railsEnv: Rails.env.to_s,
      appName: AppEnv.app_name,
      appDomain: AppEnv.app_domain,
      premiumPrice: RenderingExtension::PREMIUM_PRICE
    )
    expect(context[:analyticsKey]).to be_present
  end

  it "reads the last-search and currency cookies" do
    context = described_class.custom_context(
      view_context_for(DESKTOP_UA, cookies: { "last_search" => "marenca", "currency" => "EUR" })
    )

    expect(context).to include(lastSearch: "marenca", currency: "EUR")
  end

  it "detects a desktop browser" do
    context = described_class.custom_context(view_context_for(DESKTOP_UA))

    expect(context).to include(desktop: true, tablet: false, mobile: false, initialScreenSize: "lg")
  end

  it "detects a mobile browser" do
    context = described_class.custom_context(view_context_for(MOBILE_UA))

    expect(context).to include(desktop: false, tablet: false, mobile: true, initialScreenSize: "sm")
  end

  it "detects a tablet browser" do
    context = described_class.custom_context(view_context_for(TABLET_UA))

    expect(context).to include(desktop: false, tablet: true, mobile: false, initialScreenSize: "md")
  end

  it "does not raise when the user agent is missing" do
    context = described_class.custom_context(view_context_for(nil))

    expect(context[:desktop]).to be(true)
  end
end
