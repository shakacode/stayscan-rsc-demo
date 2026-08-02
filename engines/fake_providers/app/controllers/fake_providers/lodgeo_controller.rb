# frozen_string_literal: true

module FakeProviders
  class LodgeoController < ApplicationController
    def details = render(json: LodgeoData.details(params[:native_id], params[:native_unit_id]))
    def channel_ref = render(json: LodgeoData.channel_ref(params[:native_id], params[:native_unit_id]))
    def reviews = render(json: LodgeoData.reviews(params[:native_id], params[:native_unit_id]))

    def calendar
      render json: LodgeoData.calendar(params[:native_id], params[:native_unit_id], date_param(:start_date, 0), days_param)
    end

    def quote
      render json: LodgeoData.quote(params[:native_id], params[:native_unit_id], date_param(:check_in, 7),
                                    date_param(:check_out, 10), params[:guests].to_i)
    end
  end
end
