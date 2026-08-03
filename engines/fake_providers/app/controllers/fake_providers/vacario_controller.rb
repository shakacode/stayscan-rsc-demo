# frozen_string_literal: true

module FakeProviders
  class VacarioController < ApplicationController
    def details = render(json: VacarioData.details(params[:native_id], params[:unit_code]))
    def reviews = render(json: VacarioData.reviews(params[:native_id], params[:unit_code]))

    def calendar
      render json: VacarioData.calendar(params[:native_id], params[:unit_code], date_param(:start_date, 0), days_param)
    end

    def quote
      render json: VacarioData.quote(params[:native_id], params[:unit_code], date_param(:check_in, 7),
                                     date_param(:check_out, 10), params[:guests].to_i)
    end
  end
end
