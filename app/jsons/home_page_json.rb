# frozen_string_literal: true

# Builds the home page's JSON payload — the props subset that corresponds to
# WelcomeController#index's `home:` key. Extracted so both the controller and
# the bench:pages task share one code path.
class HomePageJson
  TESTIMONIALS = [
    { id: "t1", quote: "Saved $240 on a week in Kivora just by booking the cheaper channel.",
      author: "Mara D.", location: "Seattle" },
    { id: "t2", quote: "One search showed the same villa at three prices. Wild.",
      author: "Theo R.", location: "Austin" },
    { id: "t3", quote: "Found a book-direct host and skipped the service fees entirely.",
      author: "Iona F.", location: "Toronto" }
  ].freeze

  def self.build
    {
      example: ExampleListingJson.build,
      cms: cms_home,
      testimonials: TESTIMONIALS,
      stats: {
        listings: Listing.count,
        destinations: Location.where(kind: "area").count,
        providers: 4
      }
    }
  end

  def self.cms_home
    page = ContentPage.find_by(slug: "home")
    page && { title: page.title, body: page.body }
  end
  private_class_method :cms_home
end
