# frozen_string_literal: true

# The navbar/user block. Shared by LayoutJson and the auth endpoints so the
# store's user shape is identical however it is set.
class UserJson
  def initialize(user)
    @user = user
  end

  def as_json(*)
    { id: @user.id, name: @user.display_name, email: @user.email }
  end
end
