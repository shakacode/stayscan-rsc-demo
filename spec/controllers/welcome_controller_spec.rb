# frozen_string_literal: true

require "rails_helper"

# Home fragment-cache key. The home SSR is cached via cached_react_component;
# each output-changing dimension must produce a distinct key.
RSpec.describe WelcomeController, type: :controller do
  # Same UA string as MOBILE_UA in spec/services/rendering_extension_spec.rb.
  let(:mobile_ua) do
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " \
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  end

  before { allow(controller).to receive(:asset_version).and_return("rel-1") }

  def cache_key_after_request(params: {})
    get :index, params: params
    controller.welcome_cache_key
  end

  # --- key dimensions ---

  it "busts on the signed-in user" do
    anon = cache_key_after_request

    sign_in create(:user)

    expect(cache_key_after_request).not_to eq(anon)
  end

  it "busts on the selected currency" do
    usd = cache_key_after_request

    session[:currency] = "EUR"

    expect(cache_key_after_request).not_to eq(usd)
  end

  it "busts on the locale" do
    en = cache_key_after_request

    expect(cache_key_after_request(params: { locale: "es" })).not_to eq(en)
  end

  it "busts on a new release (asset_version)" do
    before_release = cache_key_after_request

    allow(controller).to receive(:asset_version).and_return("rel-2")

    expect(cache_key_after_request).not_to eq(before_release)
  end

  it "busts on the device class (mobile vs desktop)" do
    desktop = cache_key_after_request

    request.env["HTTP_USER_AGENT"] = mobile_ua

    expect(cache_key_after_request).not_to eq(desktop)
  end

  it "busts on the currency cookie" do
    no_cookie = cache_key_after_request

    cookies["currency"] = "GBP"

    expect(cache_key_after_request).not_to eq(no_cookie)
  end

  # --- cache skip guard ---

  it "skips cache when flash is present" do
    get :index
    controller.flash[:notice] = "signed out"

    expect(controller.cache_welcome_render?).to be false
  end

  it "skips cache when last_search cookie is present" do
    cookies["last_search"] = "marenca"
    get :index

    expect(controller.cache_welcome_render?).to be false
  end

  it "enables cache when flash and last_search are absent" do
    get :index

    expect(controller.cache_welcome_render?).to be true
  end
end
