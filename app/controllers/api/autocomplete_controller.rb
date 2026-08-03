# frozen_string_literal: true

module Api
  # Destination suggestions for the navbar searchbar, served from the
  # materialized autocomplete view. Prefix match, densest destinations first.
  class AutocompleteController < ApplicationController
    LIMIT = 8
    MIN_QUERY_LENGTH = 2

    def index
      query = params[:q].to_s.strip.downcase
      results = query.length >= MIN_QUERY_LENGTH ? search(query) : []
      render json: { results: results }
    end

    private

    def search(query)
      AutocompleteLocation
        .where("name_lower LIKE ?", "#{ActiveRecord::Base.sanitize_sql_like(query)}%")
        .order(listings_count: :desc)
        .limit(LIMIT)
        .map do |location|
          { id: location.id, name: location.name, path: location.path,
            kind: location.kind, listingsCount: location.listings_count }
        end
    end
  end
end
