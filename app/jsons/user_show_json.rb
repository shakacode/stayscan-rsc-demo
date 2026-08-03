# frozen_string_literal: true

# The public user/host page payload: profile hero, badges, and a paginated
# grid of the host's listings (shared TileJson).
class UserShowJson
  PER_PAGE = 12

  def initialize(user, page: 1)
    @user = user
    @page = [ page.to_i, 1 ].max
  end

  def as_json(*)
    scope = @user.owned_listings.where.not(title: nil).order(:id)
    total = scope.count
    page_listings = scope.offset((@page - 1) * PER_PAGE).limit(PER_PAGE).preload(:listing_channels)

    {
      id: @user.id,
      name: @user.display_name,
      avatar: @user.host_avatar,
      about: @user.host_intro_text.presence,
      joinedYear: @user.created_at.year,
      badges: {
        verified: @user.verified_at.present?,
        superhost: total >= 5,
        multiListing: total > 1
      },
      listingsCount: total,
      listings: page_listings.map { |listing| Listing::TileJson.new(listing).as_json },
      pagination: { page: @page, perPage: PER_PAGE, total: total }
    }
  end
end
