# frozen_string_literal: true

# Plain-Ruby JSON builder for the shared layout payload: the navbar user
# block, available currencies, and server flash alerts. Emitted camelCase and
# used to seed the layout Redux store so hydration matches the server render.
class LayoutJson
  def initialize(user: nil, currencies: Currency.all, current_currency: "USD", alerts: [])
    @user = user
    @currencies = currencies
    @current_currency = current_currency
    @alerts = alerts
  end

  def as_json(*)
    {
      user: user_block,
      currencies: @currencies.map { |currency| { code: currency.code, symbol: currency.symbol } },
      currentCurrency: @current_currency,
      alerts: @alerts
    }
  end

  private

  def user_block
    return nil unless @user

    UserJson.new(@user).as_json
  end
end
