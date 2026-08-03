/* eslint no-console:0 */
// Vendor CSS is imported here (client pack only) so it is extracted for the
// browser but never enters the SSR server bundle, whose renderer VM lacks the
// `URL` global the css-loader runtime needs.
import 'react-day-picker/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// Uncomment to copy all static images under ./images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('./images', true)
// const imagePath = (name) => images(name, true)
