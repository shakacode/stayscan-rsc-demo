Rails.application.routes.draw do
  # Synthetic OTA/VRS provider APIs (the app consumes these over HTTP via
  # ChannelDataApi). They back the seed/sync pipeline and must not be publicly
  # reachable on a real deploy (L3) — mount outside production unless a box
  # explicitly needs to re-sync (MOUNT_FAKE_PROVIDERS=true).
  if !Rails.env.production? || ENV["MOUNT_FAKE_PROVIDERS"] == "true"
    mount FakeProviders::Engine => "/fake-providers"
  end

  devise_for :users, controllers: {
    sessions: "users/sessions", registrations: "users/registrations", passwords: "users/passwords"
  }

  namespace :api do
    get "autocomplete", to: "autocomplete#index"
  end

  get "hello_world", to: "hello_world#index"
  get "images/placeholder/*key", to: "placeholder_images#show", format: false
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Home / marketing landing.
  root "welcome#index"

  # Listing detail page + async quote endpoints.
  get "listings/:id", to: "listing_details#show", as: :listing
  post "listings/:listing_id/quotes", to: "quotes#create", as: :listing_quotes
  # Batched browse view live pricing — must precede quotes/:id so "batch" isn't read as an id.
  post "quotes/batch", to: "batch_quotes#create", as: :batch_quotes
  get "quotes/batch", to: "batch_quotes#index"
  get "quotes/:id", to: "quotes#show", as: :quote
  get "listings/:listing_id/reviews", to: "reviews#index", as: :listing_reviews

  # Browse view: free search + path-routed destination pages.
  get "s", to: "browse#index", as: :search
  get "l/*path", to: "browse#location_page", as: :location_page, format: false

  # User / host / account pages.
  get "users/:id", to: "users#show", as: :user_profile
  get "hosts/:id", to: "hosts#show", as: :host
  get "hosts/:id/map", to: "hosts#map", as: :host_map
  get "accounts/edit", to: "accounts#edit", as: :edit_account
  get "trips", to: "trips#index", as: :trips

  # Marketing / legal pages.
  get "about", to: "pages#about"
  get "faq", to: "pages#faq"
  get "pricing", to: "pages#pricing"
  get "tos", to: "pages#tos"
  get "privacy", to: "pages#privacy"
  get "contact", to: "contacts#new"
  post "contact", to: "contacts#create"

  # 404 for unmatched HTML paths (must stay last). Renders the NotFound bundle.
  match "*unmatched", to: "pages#not_found", via: :all,
        constraints: ->(request) { request.format.html? || request.format.to_s.blank? }
end
