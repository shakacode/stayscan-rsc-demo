# frozen_string_literal: true

# Pin Sidekiq to a dedicated Redis database so local multi-app development (or a
# shared prod Redis) doesn't cross streams — without this, Sidekiq defaults to
# db 0, where another app's jobs would surface as `uninitialized constant` retries.
# Production sets REDIS_URL; the default mirrors config/cable.yml's db.
redis_config = { url: ENV.fetch("REDIS_URL", "redis://localhost:6379/1") }

Sidekiq.configure_server { |config| config.redis = redis_config }
Sidekiq.configure_client { |config| config.redis = redis_config }
