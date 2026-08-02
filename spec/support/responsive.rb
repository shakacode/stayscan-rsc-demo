# frozen_string_literal: true

# Exercise both viewports inside one system spec. The full suite is also run twice
# in CI (CAPYBARA_WINDOW_SIZE), so use `responsive` only when a single journey must
# be asserted at both sizes.
module ResponsiveHelpers
  Viewports = Struct.new(:page) do
    def mobile
      page.current_window.resize_to(375, 667)
      yield
    end

    def desktop
      page.current_window.resize_to(1024, 768)
      yield
    end
  end

  def responsive
    yield Viewports.new(page)
  end
end

RSpec.configure do |config|
  config.include ResponsiveHelpers, type: :system
end
