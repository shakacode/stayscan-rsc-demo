# frozen_string_literal: true

module Demo
  # Deterministic fictional content for seeding (host bios, destination geography,
  # amenity catalog). Listing content itself comes from the provider pipeline;
  # this only covers what the seed owns. No lorem ipsum, no real addresses.
  module Content
    # Destinations tile the provider coordinate range (lat 8.7..9.1, lng
    # -140.7..-140.2) so pipeline-generated listing coordinates land inside one.
    REGION = { path: "sy/marenca", name: "Marenca", kind: "region",
               min_lat: 8.7, max_lat: 9.1, min_lng: -140.7, max_lng: -140.2 }.freeze
    COUNTRY = { path: "sy", name: "Sylvara", kind: "country",
                min_lat: 8.7, max_lat: 9.1, min_lng: -140.7, max_lng: -140.2 }.freeze
    # Non-overlapping vertical strips (full lat band) of UNEQUAL width tiling the
    # region's lng range. Kivora is the dense hub (~40% of the box) so the densest
    # destination clears 800 listings at full volume; the rest thin out realistically.
    AREAS = [
      { name: "Ondera Cove",   min_lat: 8.700, max_lat: 9.100, min_lng: -140.700, max_lng: -140.620 },
      { name: "Veska Reef",  min_lat: 8.700, max_lat: 9.100, min_lng: -140.620, max_lng: -140.550 },
      { name: "Marisel",     min_lat: 8.700, max_lat: 9.100, min_lng: -140.550, max_lng: -140.490 },
      { name: "Sabel Bay",  min_lat: 8.700, max_lat: 9.100, min_lng: -140.490, max_lng: -140.440 },
      { name: "Altara Point", min_lat: 8.700, max_lat: 9.100, min_lng: -140.440, max_lng: -140.400 },
      { name: "Kivora",      min_lat: 8.700, max_lat: 9.100, min_lng: -140.400, max_lng: -140.200 }
    ].freeze

    AMENITIES = [
      "Wifi", "Pool", "Hot Tub", "Air Conditioning", "Kitchen", "Free Parking", "Washer", "Dryer",
      "Beachfront", "Ocean View", "Pet Friendly", "EV Charger", "Gym", "BBQ Grill", "Fireplace",
      "Workspace", "Crib", "Elevator", "Step-free Access", "Sauna", "Balcony", "Garden", "Bicycles",
      "Kayaks", "Snorkel Gear", "Coffee Maker", "Dishwasher", "Smart TV", "Sound System",
      "Board Games", "High Chair", "Outdoor Shower", "Fire Pit", "Veranda"
    ].freeze # 34

    BIO_OPENERS = [ "Island-based host", "Longtime local", "Third-generation resident", "Weekend surfer",
                   "Retired chef", "Marine-biology nerd" ].freeze
    BIO_CLOSERS = [ "loves sharing hidden beaches.", "will point you to the best ceviche.",
                   "keeps the veranda stocked with coffee.", "answers messages fast.",
                   "grows the mangoes out back." ].freeze

    # Static site copy (home/FAQ/TOS/privacy). Obviously fictional; StayScan is the
    # demo brand.
    CONTENT_PAGES = [
      { slug: "home", title: "Compare every price. Book the smart way.",
        body: "StayScan gathers the same vacation rental across every channel so you can " \
              "see who's cheapest before you book. No markups, no guesswork." },
      { slug: "about", title: "About StayScan",
        body: "StayScan started with a simple annoyance: the same rental, listed on three sites, " \
              "at three different prices. So we built one search that compares them all — and points " \
              "you to the cheapest, every time." },
      { slug: "faq", title: "Frequently asked questions",
        body: "How does StayScan find prices? We aggregate live rates from partner channels. " \
              "Is booking direct cheaper? Often — we flag book-direct listings so you can decide." },
      { slug: "tos", title: "Terms of service",
        body: "This is a demonstration application. All listings, hosts, and prices are synthetic " \
              "and generated for testing. No real bookings are processed." },
      { slug: "privacy", title: "Privacy policy",
        body: "StayScan is a demo and stores no real personal data. Any accounts shown are " \
              "seeded fixtures used only for local development." }
    ].freeze

    module_function

    def host_bio(rng)
      "#{BIO_OPENERS.sample(random: rng)} who #{BIO_CLOSERS.sample(random: rng)}"
    end
  end
end
