class CreateFunctionAvailableTotalPrice < ActiveRecord::Migration[7.2]
  def change
    create_function :available_total_price
  end
end
