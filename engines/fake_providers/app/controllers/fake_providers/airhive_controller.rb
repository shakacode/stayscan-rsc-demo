# frozen_string_literal: true

module FakeProviders
  class AirhiveController < ApplicationController
    def details = render(json: AirhiveData.details(params[:native_id]))
    def calendar = render(json: AirhiveData.calendar(params[:native_id], date_param(:start_date, 0), days_param))
    def reviews = render(json: AirhiveData.reviews(params[:native_id]))

    def quote
      render json: AirhiveData.quote(params[:native_id], date_param(:check_in, 7),
                                     date_param(:check_out, 10), params[:guests].to_i)
    end
  end
end
