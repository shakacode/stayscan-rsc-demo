class CreateFunctionListingsToSearchRowTrigger < ActiveRecord::Migration[7.2]
  def change
    create_function :listings_to_search_row_trigger
  end
end
