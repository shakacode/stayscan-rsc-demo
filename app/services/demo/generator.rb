# frozen_string_literal: true

require "digest"

module Demo
  # Produces production-shaped demo data by driving the REAL provider pipeline
  # (matches -> ResolveListingClusterJob -> sync; HostflowImport for book-direct), fully
  # offline and deterministically from DEMO_SEED. The generator never writes
  # listings/listing_channels/listing_search_rows directly (acceptance #3).
  class Generator
    PROFILES = {
      test: { aggregate_listings: 6, hostflow: 2, hosts: 3, travelers: 5 },
      light: { aggregate_listings: 130, hostflow: 25, hosts: 15, travelers: 60 },
      full: { aggregate_listings: 2600, hostflow: 400, hosts: 40, travelers: 500 }
    }.freeze

    OTA_CHANNELS = %i[airhive vacario lodgeo].freeze

    def self.call(profile: :light, seed: default_seed, verbose: true)
      new(profile:, seed:, verbose:).call
    end

    def self.default_seed
      ENV.fetch("DEMO_SEED", "stayscan")
    end

    def initialize(profile:, seed:, verbose:)
      @profile = PROFILES.fetch(profile.to_sym)
      @rng = Random.new(Digest::SHA256.hexdigest(seed.to_s).to_i(16) % (2**31))
      @verbose = verbose
    end

    def call
      with_synchronous_pipeline do
        seed_currencies
        seed_amenities
        seed_content_pages
        areas = seed_locations
        hosts = seed_hosts
        seed_travelers
        seed_aggregate_listings
        seed_hostflow_listings(hosts)
        seed_reviews
        recount_locations(areas)
        AutocompleteLocation.refresh
        log "Done. #{Listing.count} listings, #{Location.count} locations, " \
            "#{Review.count} reviews, #{User.count} users."
      end
    end

    private

    # In-process provider calls + synchronous jobs so seeding is offline + fast,
    # without leaking the adapter change to the surrounding process.
    def with_synchronous_pipeline
      previous_api = ChannelDataApi.adapter
      previous_job = ActiveJob::Base.queue_adapter
      ChannelDataApi.adapter = [ :rack, Rails.application ]
      ActiveJob::Base.queue_adapter = :inline
      yield
    ensure
      ChannelDataApi.adapter = previous_api
      ActiveJob::Base.queue_adapter = previous_job
    end

    def seed_currencies
      [ [ "USD", "$", 1.0 ], [ "EUR", "€", 1.08 ], [ "GBP", "£", 1.27 ], [ "CAD", "C$", 0.73 ] ].each do |code, symbol, rate|
        Currency.find_or_create_by!(code:) { |c| c.symbol = symbol; c.rate_to_usd = rate }
      end
    end

    def seed_amenities
      Content::AMENITIES.each_with_index do |name, i|
        Amenity.find_or_create_by!(bit_position: i) { |a| a.name = name; a.category = "general" }
      end
    end

    def seed_content_pages
      Content::CONTENT_PAGES.each do |page|
        ContentPage.find_or_create_by!(slug: page[:slug]) { |c| c.assign_attributes(page) }
      end
    end

    def seed_locations
      country = Location.find_or_create_by!(path: Content::COUNTRY[:path]) { |l| l.assign_attributes(Content::COUNTRY) }
      region = Location.find_or_create_by!(path: Content::REGION[:path]) do |l|
        l.assign_attributes(Content::REGION.merge(parent_id: country.id))
      end
      Content::AREAS.map do |area|
        Location.find_or_create_by!(path: "sy/marenca/#{area[:name].parameterize}") do |l|
          l.assign_attributes(area.merge(kind: "area", parent_id: region.id,
                                         center_lat: (area[:min_lat] + area[:max_lat]) / 2,
                                         center_lng: (area[:min_lng] + area[:max_lng]) / 2))
        end
      end
    end

    # Seeded accounts share a known demo password (documented test accounts).
    DEMO_PASSWORD = "stayscan-demo"

    def seed_hosts
      Array.new(@profile[:hosts]) do |i|
        User.find_or_create_by!(email: "host#{i}@stayscan.example") do |u|
          u.password = DEMO_PASSWORD
          u.host_name = Content::BIO_OPENERS.sample(random: @rng)
          u.host_intro_text = Content.host_bio(@rng)
          u.verified_at = Time.current
        end
      end
    end

    def seed_travelers
      @profile[:travelers].times do |i|
        User.find_or_create_by!(email: "traveler#{i}@stayscan.example") { |u| u.password = DEMO_PASSWORD }
      end
    end

    def seed_aggregate_listings
      @profile[:aggregate_listings].times do |i|
        refs = channel_refs(i, pick_ota_channels(i))
        ResolveListingClusterJob.perform_now(ListingCluster.observe(**refs).id)
        progress("aggregate_listings", i)
      end
    end

    def pick_ota_channels(index)
      rng = Random.new(Digest::SHA256.hexdigest("channels-#{index}").to_i(16) % (2**31))
      chosen = OTA_CHANNELS.select { rng.rand < 0.30 }
      chosen.empty? ? [ OTA_CHANNELS.sample(random: rng) ] : chosen
    end

    def channel_refs(index, channels)
      refs = {}
      if channels.include?(:airhive)
        refs[:airhive_listing_id] = AirhiveListing.find_or_create_by!(native_id: "demo-air-#{index}").id
      end
      if channels.include?(:vacario)
        refs[:vacario_listing_id] = VacarioListing.find_or_create_by!(native_id: "demo-vac-#{index}", unit_code: "u-#{index}").id
      end
      if channels.include?(:lodgeo)
        refs[:lodgeo_listing_id] = LodgeoListing.find_or_create_by!(native_id: "demo-lod-#{index}", native_unit_id: "u-#{index}").id
      end
      refs
    end

    def seed_hostflow_listings(hosts)
      @profile[:hostflow].times do |i|
        HostflowImport.call(native_id: "demo-hf-#{i}", owner: hosts[i % hosts.size])
        progress("hostflow", i)
      end
    end

    def seed_reviews
      api = ChannelDataApi.new
      Listing.find_each do |listing|
        next if listing.reviews.exists?

        provider, reviews = fetch_reviews(api, listing)
        reviews.first(8).each do |review|
          listing.reviews.create!(provider_type: provider, author_name: review.author,
                                  rating: review.rating.clamp(1, 5), content: review.body)
        end
      end
    end

    def fetch_reviews(api, listing)
      if listing.airhive_listing
        [ "airhive", Normalizers::Airhive::Reviews.call(api.airhive_reviews(listing.airhive_listing.native_id)) ]
      elsif listing.vacario_listing
        record = listing.vacario_listing
        [ "vacario", Normalizers::Vacario::Reviews.call(api.vacario_reviews(record.native_id, record.unit_code)) ]
      elsif listing.lodgeo_listing
        record = listing.lodgeo_listing
        [ "lodgeo", Normalizers::Lodgeo::Reviews.call(api.lodgeo_reviews(record.native_id, record.native_unit_id)) ]
      else
        [ "hostflow", [] ]
      end
    end

    def recount_locations(areas)
      areas.each { |area| area.update!(listings_count: area.listings.count) }
    end

    def progress(label, index)
      log "  #{label}: #{index + 1}" if @verbose && ((index + 1) % 25).zero?
    end

    def log(message)
      $stdout.puts(message) if @verbose
    end
  end
end
