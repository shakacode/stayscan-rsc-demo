# v1-ssr-baseline — client JS bytes (development build, 2026-08-13)
# The SSR client-side JavaScript the RSC migration measures against.
# Development build — not minified; absolute sizes are larger than production
# but the A/B delta against the treatment build is what matters.
# Brotli quality 5 (matches Rack::Brotli production default).

## path=/
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       4.3 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     195.7 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      98.5 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.9 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      21.1 KiB
  js/generated/Welcome.js                                                           sync        48.8 KiB       6.9 KiB
  js/application.js                                                                 sync         4.3 KiB       1.1 KiB
  js/components-BelowFold.chunk.js                                                  async       22.3 KiB       2.7 KiB
  TOTAL                                                                                         2.05 MiB     335.2 KiB

## path=/s
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       4.3 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     195.7 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      98.5 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.9 KiB
  js/vendors-history+immutable+redux+react-redux+... (36d291)                       sync       230.8 KiB      45.5 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      21.1 KiB
  js/generated/Browse.js                                                            sync       271.2 KiB      31.1 KiB
  js/application.js                                                                 sync         4.3 KiB       1.1 KiB
  js/vendors-leaflet-src.chunk.js                                                   async      439.9 KiB     101.5 KiB
  js/engines-LeafletEngine.chunk.js                                                 async       10.1 KiB       3.0 KiB
  js/vendors-maplibre-gl.chunk.js                                                   async      784.8 KiB     192.1 KiB
  js/engines-MapLibreEngine.chunk.js                                                async       14.9 KiB       3.6 KiB
  TOTAL                                                                                         3.69 MiB     702.5 KiB

## path=/listings/2
  chunk                                                                             kind             raw        brotli
  js/runtime.js                                                                     sync        18.9 KiB       4.3 KiB
  js/vendors-react+react-on-rails-pro+react-dom+scheduler (8c8f19)                  sync        1.25 MiB     195.7 KiB
  js/vendors-prop-types+react-day-picker+react-toastify (d84f9b)                    sync       536.6 KiB      98.5 KiB
  js/vendors-loadable-component                                                     sync        21.4 KiB       4.9 KiB
  js/vendors-actioncable+actioncable-channels (57b828)                              sync        25.8 KiB       5.0 KiB
  js/app-layout (LayoutProviders+LayoutShell+...)                                   sync       170.6 KiB      21.1 KiB
  js/generated/ListingDetail.js                                                     sync       394.5 KiB      44.6 KiB
  js/application.js                                                                 sync         4.3 KiB       1.1 KiB
  js/modals-BookDirectRevealModal.chunk.js                                          async       16.3 KiB       2.6 KiB
  js/AmenitiesModal.chunk.js                                                        async        3.9 KiB       1.1 KiB
  js/BookingInquiryModal.chunk.js                                                   async       33.7 KiB       4.0 KiB
  js/MessageHostModal.chunk.js                                                      async       13.4 KiB       2.4 KiB
  js/SharePricingModal.chunk.js                                                     async       16.5 KiB       2.9 KiB
  js/NegotiationWizardModal.chunk.js                                                async       37.1 KiB       4.5 KiB
  js/OtherChannelsModal.chunk.js                                                    async       24.9 KiB       3.4 KiB
  js/UsageLimitModalContainer.chunk.js                                              async       19.5 KiB       3.1 KiB
  js/ReportReviewModal.chunk.js                                                     async       18.3 KiB       2.9 KiB
  js/PriceAlertModal.chunk.js                                                       async       14.1 KiB       2.5 KiB
  TOTAL                                                                                         2.59 MiB     404.6 KiB
