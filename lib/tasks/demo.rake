# frozen_string_literal: true

namespace :demo do
  desc "Seed production-shaped demo data through the real pipeline (DEMO_PROFILE=test|light|full)"
  task seed: :environment do
    profile = (ENV["DEMO_PROFILE"] || "light").to_sym
    Demo::Generator.call(profile:)
  end

  desc "Truncate all data and reseed"
  task reset: :environment do
    conn = ActiveRecord::Base.connection
    tables = conn.tables - %w[schema_migrations ar_internal_metadata]
    conn.execute("TRUNCATE #{tables.map { |t| conn.quote_table_name(t) }.join(', ')} RESTART IDENTITY CASCADE")
    Rake::Task["demo:seed"].invoke
  end

  desc "Verify the seeded data meets the production-shape contract"
  task verify: :environment do
    rows = Demo::Verify.call
    width = rows.map { |r| r.dimension.length }.max
    rows.each do |row|
      mark = row.pass ? "ok  " : "FAIL"
      puts format("  %<mark>s  %<dim>-#{width}s  %<actual>s", mark:, dim: row.dimension, actual: row.actual)
    end
    structural_failures = rows.select { |r| r.kind == :structural && !r.pass }
    if structural_failures.any?
      warn "\n[demo:verify] #{structural_failures.size} structural check(s) failed."
      exit 1
    end
    puts "\n[demo:verify] structural checks passed (volume rows pass on the full profile)."
  end
end
