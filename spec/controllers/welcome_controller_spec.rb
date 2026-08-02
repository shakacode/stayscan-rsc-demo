# frozen_string_literal: true

require "rails_helper"

# Home prerender fragment-cache key. The home SSR has no ETag, so the
# key drives the react_component cache directly; each output-changing dimension
# must produce a distinct key.
RSpec.describe WelcomeController, type: :controller do
  before { allow(controller).to receive(:asset_version).and_return("rel-1") }

  def cache_key_after_request
    get :index
    controller.welcome_cache_key
  end

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

    get :index, params: { locale: "es" }

    expect(controller.welcome_cache_key).not_to eq(en)
  end

  it "busts on a new release (asset_version)" do
    before_release = cache_key_after_request

    allow(controller).to receive(:asset_version).and_return("rel-2")

    expect(cache_key_after_request).not_to eq(before_release)
  end
end
