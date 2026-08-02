# frozen_string_literal: true

require "rails_helper"

# channels settle independently into their own
# QuoteSettlement rows, top_deal is the cheapest, one channel failing doesn't
# fail the others, and each settlement broadcasts.
RSpec.describe SettleChannelQuoteJob do
  let(:check_in) { Date.current + 30 }
  let(:check_out) { check_in + 3 }

  let(:listing) do
    Listing.create!(
      origin: "aggregated",
      airhive_listing: AirhiveListing.create!(native_id: "air-1"),
      vacario_listing: VacarioListing.create!(native_id: "vac-1", unit_code: "u-1")
    )
  end

  before do
    %w[airhive vacario].each_with_index do |provider, i|
      listing.listing_channels.create!(
        provider_type: provider, nightly_price_default: [ 100, 250 ][i],
        stay_availability_default: true
      )
    end
  end

  def create_quote_synchronously
    Quote::Create.call(listing:, check_in:, check_out:, adults: 2)
  end

  it "settles each channel independently and picks the cheapest as top_deal" do
    quote = create_quote_synchronously

    expect(quote.settlements.map(&:provider_type)).to contain_exactly("airhive", "vacario")
    expect(quote.settlements).to all(be_settled)
    expect(quote.deals["airhive"]).to be_priced
    expect(quote.top_deal.provider_type).to eq("airhive") # 100/night < 250/night
    expect(quote).to be_finished
  end

  it "records a per-channel error without failing the other channels" do
    allow_any_instance_of(ChannelDataApi).to receive(:airhive_quote).and_raise(ChannelDataApi::ProviderError)

    quote = create_quote_synchronously

    airhive = quote.deals["airhive"]
    expect(airhive.error_code).to eq("ProviderError")
    expect(airhive).to be_failed        # settled, just errored
    expect(quote.deals["vacario"]).to be_priced # unaffected
    expect(quote.top_deal.provider_type).to eq("vacario")
  end

  it "flags a calendar conflict when the provider quotes but the stored calendar is blocked" do
    airhive = listing.listing_channels.find_by(provider_type: "airhive")
    # our calendar: the whole stay is blacked out
    give_calendar(airhive, open: open_window(check_in, 10), blocked: [ check_in...(check_in + 10) ])

    quote = create_quote_synchronously

    expect(quote.deals["airhive"].calendar_conflict).to be(true)
    expect(quote.deals["airhive"]).to be_unavailable
  end

  it "broadcasts each channel result over QuotesChannel" do
    quote = Quote.create!(listing:, check_in:, check_out:, adults: 2, state: "processing")

    expect { described_class.perform_now(quote.id, "airhive") }
      .to have_broadcasted_to(quote).from_channel(QuotesChannel)
  end
end
