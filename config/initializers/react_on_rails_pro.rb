# frozen_string_literal: true

# React on Rails Pro configuration.
# The Pro gem is a commercial dependency consumed from public registries with a
# license supplied via ENV; its source is never vendored here.
ReactOnRailsPro.configure do |config|
  # Route server rendering through the out-of-process Node renderer (renderer.js)
  # rather than in-process ExecJS. This is the SSR path the whole project studies;
  # a smoke check proves it is genuinely remote.
  config.server_renderer = "NodeRenderer"

  # Defaults to http://localhost:3800 (matches renderer.js) when unset.
  config.renderer_url = ENV.fetch("REACT_RENDERER_URL", "http://localhost:3800")

  # Do NOT silently fall back to in-process ExecJS when the renderer is
  # unreachable (default is to fall back). This is a renderer testbed: a downed
  # renderer must surface as an error, not degrade invisibly.
  # Opt back in with REACT_RENDERER_USE_FALLBACK_EXEC_JS=true if ever needed.
  config.renderer_use_fallback_exec_js = ENV["REACT_RENDERER_USE_FALLBACK_EXEC_JS"] == "true"

  # Cache prerender output in the Rails cache (exercised further in).
  config.prerender_caching = true

  # The renderer requires a shared password in production-like environments.
  config.renderer_password = ENV["RENDERER_PASSWORD"] if Rails.env.production? || Rails.env.staging?

  # Copy loadable-stats.json (emitted by @loadable/webpack-plugin) to the node
  # renderer so SSR can resolve code-split chunks.
  config.assets_to_copy = [
    Rails.root.join(ReactOnRails::PackerUtils.packer_public_output_path, "loadable-stats.json")
  ]
end
