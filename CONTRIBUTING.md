# Contributing

Thanks for helping with this RSC testbed. The goal is unusual: keep the app **complex enough
that genuine React Server Components issues surface**, while keeping every brand, listing, and
byte of data fictional and synthetic.

## Ground rules

1. **Fictional brands and synthetic data only.** Every provider here is invented
   (`StayScan / Airhive / Vacario / Lodgeo / Hostflow / Rentora`). No real booking-brand
   identifiers, no real listing data, no real photos, no secrets. Listing content, calendars,
   reviews, and images are all generated deterministically from a seed.
2. **Keep the complexity.** The value of this repo is that it is big. Do not simplify a
   subsystem — the availability/pricing engine, the per-provider normalizers, the Redux browse
   page, or the booking state machine — just to make a change easier.
3. **Prices are computed in two places on purpose.** Search and tiles price in SQL; full quotes
   price in Ruby. A spec asserts the two agree. If you change one, change both.
4. **The calendar is range-shaped.** Availability and rates are stored as date ranges guarded by
   exclusion constraints, not as a row or a bit per night. Reshapers collapse consecutive
   identical nights into one range; keep it that way.

## Workflow

- Write the test first for any behavior change (red → green → refactor).
- Frontend changes need a system spec, and system specs run in **both** viewports:
  ```bash
  bundle exec rspec spec/system
  CAPYBARA_WINDOW_SIZE=mobile bundle exec rspec spec/system
  ```
- Run the same checks CI runs before you commit:
  ```bash
  bundle exec rubocop
  yarn --cwd client lint
  bundle exec rspec
  yarn --cwd client test
  bin/shakapacker            # client + server bundles
  ```

## Repo conventions

- Ruby: rubocop (omakase). JS/JSX: eslint + prettier (in `client/`). Tests: RSpec (Ruby),
  Jest (JS).
- Frontend lives in `client/` with its own `package.json` and yarn lockfile. The root
  `package.json` holds only the Pro Node renderer. Node 22.12.0 is required for the renderer
  and the webpack build.
- System specs boot a real Puma server and the out-of-process Node renderer, so build the
  bundles before running them.
