class CreateTriggerListingsToSearchRow < ActiveRecord::Migration[7.2]
  def change
    create_trigger :listings_to_search_row, on: :listings
  end
end
