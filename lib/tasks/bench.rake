# frozen_string_literal: true

# Server-time + allocation microbenchmark for the page payloads. Measures the
# Ruby-side cost — the JSON builders + their queries — for home/listing-detail/
# browse, anon and signed-in. The SSR (Node) cost is measured separately by bench/vitals.mjs.
#
#   bin/rails bench:pages                 # run + compare against the saved baseline
#   SAVE=1 bin/rails bench:pages          # (re)write bench/results/rails-baseline.yml
#   ITERS=100 bin/rails bench:pages
namespace :bench do
  desc "Server-time + allocations for home/listing-detail/browse payloads (anon + signed-in). SAVE=1 writes the baseline."
  task pages: :environment do
    iters = Integer(ENV.fetch("ITERS", "50"))
    baseline_path = Rails.root.join("bench/results/rails-baseline.yml")

    median = ->(xs) { s = xs.sort; m = s.size / 2; s.size.odd? ? s[m] : (s[m - 1] + s[m]) / 2.0 }

    user = User.first
    listing = Listing.first
    plans = [ { code: "premium", price: 49 }, { code: "business", price: 99 } ]
    abort "seed the dev DB first (bin/rails demo:reset)" unless user && listing

    build = {
      "home" => ->(u) { LayoutJson.new(user: u).as_json },
      "listing_detail" => lambda do |u|
        ListingDetailJson.new(listing, current_user: u, quote_allowance: {}, plans: plans).as_json
        LayoutJson.new(user: u).as_json
      end,
      "browse" => lambda do |u|
        search = ListingSearch.new({})
        ListingIndexJson.new(
          listings: search.results.preload(:listing_channels), meta: search.meta, filters: {}
        ).as_json
        LayoutJson.new(user: u).as_json
      end
    }

    scenarios = build.keys.product(%w[anon user]).map do |page, who|
      [ "#{page}:#{who}", -> { build.fetch(page).call(who == "user" ? user : nil) } ]
    end

    results = {}
    scenarios.each do |name, run|
      run.call # warm: prime query caches + autoload before measuring
      times = []
      allocs = []
      iters.times do
        a0 = GC.stat(:total_allocated_objects)
        t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        run.call
        t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        allocs << (GC.stat(:total_allocated_objects) - a0)
        times << (t1 - t0) * 1000.0
      end
      results[name] = { "ms" => median.call(times).round(3), "allocs" => median.call(allocs).to_i }
    end

    baseline = File.exist?(baseline_path) ? YAML.safe_load_file(baseline_path) : nil
    puts format("%-22s %10s %12s %9s", "scenario", "ms", "allocs", "Δ ms%")
    results.each do |name, r|
      base = baseline&.dig(name, "ms")
      delta = base && base.positive? ? format("%+.1f%%", (r["ms"] - base) / base * 100) : "—"
      puts format("%-22s %10.3f %12d %9s", name, r["ms"], r["allocs"], delta)
    end

    if ENV["SAVE"]
      FileUtils.mkdir_p(baseline_path.dirname)
      File.write(baseline_path, results.to_yaml)
      puts "\nbaseline written: #{baseline_path.relative_path_from(Rails.root)} (#{iters} iters)"
    elsif baseline.nil?
      puts "\n(no baseline yet — rerun with SAVE=1 to record one)"
    end
  end
end
