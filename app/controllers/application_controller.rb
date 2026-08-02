class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  # A cache-busting token for the compiled frontend. Content-keyed HTTP/fragment
  # caches (listing-detail view ETag, react_component cache_key) must fold this in so a rebuild or
  # deploy invalidates them — otherwise a cached HTML document can hydrate against a
  # newer client bundle and mismatch. Env-aware via the Shakapacker manifest.
  def asset_version
    path = Shakapacker.config.public_manifest_path
    File.exist?(path) ? File.mtime(path).to_i.to_s : "dev"
  rescue StandardError
    "dev"
  end
  helper_method :asset_version

  # Quote reads are scoped to the session that created them (anti-scrape).
  # Quotes use sequential integer PKs, so without this an attacker could walk
  # /quotes/:id (and the batch poll) to harvest every visitor's prices + stay
  # dates. We record created ids in the session and only serve reads the session
  # owns; the list is capped so the cookie can't grow without bound.
  QUOTE_ID_MEMORY = 200

  def remember_quote_ids(*ids)
    owned = owned_quote_ids | ids.flatten.map(&:to_i)
    session[:quote_ids] = owned.last(QUOTE_ID_MEMORY)
  end

  def owned_quote_ids
    Array(session[:quote_ids]).map(&:to_i)
  end
end
