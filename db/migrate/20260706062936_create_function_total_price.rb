class CreateFunctionTotalPrice < ActiveRecord::Migration[7.2]
  def change
    create_function :total_price
  end
end
