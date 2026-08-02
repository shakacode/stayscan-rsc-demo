# frozen_string_literal: true

# Builds a channel's calendar the way the reshaper does — a known window plus
# blackout and rate ranges — so specs can describe availability in dates rather
# than assembling range rows by hand.
module ChannelCalendars
  # `open` is the window we hold a calendar for; `blocked` are spans inside it
  # that are closed for stays; `rate` prices the whole window.
  def give_calendar(channel, open:, blocked: [], nightly: nil, min_stay: nil, kind: "stay")
    channel.update!(calendar_window: open, stay_availability_default: false)
    channel.channel_blackouts.delete_all
    channel.channel_rates.delete_all

    Array(blocked).each { |during| channel.channel_blackouts.create!(kind:, during:) }
    channel.channel_rates.create!(during: open, nightly_price: nightly, min_stay:) if nightly || min_stay
    channel.reload
  end

  # A window of `nights` starting at `from`, fully open.
  def open_window(from, nights) = from...(from + nights)
end

RSpec.configure { |config| config.include ChannelCalendars }
