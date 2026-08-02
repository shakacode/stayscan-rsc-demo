# frozen_string_literal: true

FakeProviders::Engine.routes.draw do
  scope "airhive" do
    get "v1/listings/:native_id", to: "airhive#details"
    get "v1/listings/:native_id/calendar", to: "airhive#calendar"
    get "v1/listings/:native_id/quote", to: "airhive#quote"
    get "v1/listings/:native_id/reviews", to: "airhive#reviews"
  end

  scope "vacario" do
    get "units/:native_id/:unit_code/calendar", to: "vacario#calendar"
    get "units/:native_id/:unit_code/quote", to: "vacario#quote"
    get "units/:native_id/:unit_code/reviews", to: "vacario#reviews"
    get "units/:native_id/:unit_code", to: "vacario#details"
  end

  scope "lodgeo" do
    get "properties/:native_id/:native_unit_id/channel-ref", to: "lodgeo#channel_ref"
    get "properties/:native_id/:native_unit_id/calendar", to: "lodgeo#calendar"
    get "properties/:native_id/:native_unit_id/quote", to: "lodgeo#quote"
    get "properties/:native_id/:native_unit_id/reviews", to: "lodgeo#reviews"
    get "properties/:native_id/:native_unit_id", to: "lodgeo#details"
  end

  scope "hostflow" do
    post "tokens", to: "hostflow#token"
    get "properties", to: "hostflow#properties"
    get "units/:native_id/rates", to: "hostflow#rates"
    get "units/:native_id", to: "hostflow#unit"
  end
end
