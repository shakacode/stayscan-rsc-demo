# v1-ssr-baseline — client JS bytes (development build, 2026-08-13)
# The SSR client-side JavaScript the RSC migration measures against.
# Development build — not minified; absolute sizes are larger than production
# but the A/B delta against the treatment build is what matters.
# Brotli is the wire format (Rack::Brotli in config/application.rb).

## path=/
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       3.9 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     167.5 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      87.3 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.4 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      18.7 KiB
  js/generated/Welcome.js                                                           sync        48.8 KiB       6.2 KiB
  js/application.js                                                                 sync         4.3 KiB        1023 B
  js/components-BelowFold.chunk.js                                                  async       22.3 KiB       2.5 KiB
  TOTAL                                                                                         2.05 MiB     291.5 KiB

## path=/s
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       3.9 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     167.5 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      87.3 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.4 KiB
  js/vendors-history+immutable+redux+react-redux+... (36d291)                       sync       230.8 KiB      39.7 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      18.7 KiB
  js/generated/Browse.js                                                            sync       271.2 KiB      27.5 KiB
  js/application.js                                                                 sync         4.3 KiB        1023 B
  js/vendors-leaflet-src.chunk.js                                                   async      439.9 KiB      87.5 KiB
  js/engines-LeafletEngine.chunk.js                                                 async       10.1 KiB       2.7 KiB
  js/vendors-maplibre-gl.chunk.js                                                   async      784.8 KiB     170.9 KiB
  js/engines-MapLibreEngine.chunk.js                                                async       14.9 KiB       3.2 KiB
  TOTAL                                                                                         3.69 MiB     614.4 KiB

## path=/listings/2
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       3.9 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     167.5 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      87.3 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.4 KiB
  js/vendors-actioncable+actioncable-channels (57b828)                              sync        25.8 KiB       4.5 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      18.7 KiB
  js/generated/ListingDetail.js                                                     sync       394.5 KiB      38.6 KiB
  js/application.js                                                                 sync         4.3 KiB        1023 B
  js/modals-BookDirectRevealModal.chunk.js                                          async       16.3 KiB       2.4 KiB
  js/AmenitiesModal.chunk.js                                                        async        3.9 KiB        1016 B
  js/BookingInquiryModal.chunk.js                                                   async       33.7 KiB       3.7 KiB
  js/MessageHostModal.chunk.js                                                      async       13.4 KiB       2.2 KiB
  js/SharePricingModal.chunk.js                                                     async       16.5 KiB       2.6 KiB
  js/NegotiationWizardModal.chunk.js                                                async       37.1 KiB       4.0 KiB
  js/OtherChannelsModal.chunk.js                                                    async       24.9 KiB       3.2 KiB
  js/UsageLimitModalContainer.chunk.js                                              async       19.5 KiB       2.9 KiB
  js/ReportReviewModal.chunk.js                                                     async       18.3 KiB       2.7 KiB
  js/PriceAlertModal.chunk.js                                                       async       14.1 KiB       2.3 KiB
  TOTAL                                                                                         2.59 MiB     353.0 KiB
