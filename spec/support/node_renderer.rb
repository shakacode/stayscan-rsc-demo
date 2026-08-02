# frozen_string_literal: true

require "socket"

# Boots the out-of-process Node renderer (renderer.js) for JS system/SSR specs.
# SSR here is genuinely remote (no ExecJS fallback; the server bundle is a
# commonjs2/node target ExecJS can't run), so specs that prerender need it up.
# Started once, lazily, on the first system example and torn down at exit.
module NodeRenderer
  extend self

  PORT = Integer(ENV.fetch("TEST_RENDERER_PORT", "3800"))
  NODE_BIN = File.expand_path("~/.nvm/versions/node/v22.12.0/bin")

  def ensure_running!
    return if @pid || port_open?

    log = Rails.root.join("log/test-renderer.log").to_s
    path = Dir.exist?(NODE_BIN) ? "#{NODE_BIN}:#{ENV['PATH']}" : ENV["PATH"]
    @pid = Process.spawn(
      { "PATH" => path, "RAILS_ENV" => "test", "NODE_ENV" => "test",
        "RENDERER_PORT" => PORT.to_s, "RENDERER_LOG_LEVEL" => "error" },
      "node", Rails.root.join("renderer.js").to_s,
      out: log, err: %i[child out]
    )
    at_exit { stop! }
    wait_until_up!
  end

  def stop!
    return unless @pid

    Process.kill("TERM", @pid)
    Process.wait(@pid)
  rescue Errno::ESRCH, Errno::ECHILD
    # already gone
  ensure
    @pid = nil
  end

  def wait_until_up!(timeout: 30)
    deadline = monotonic + timeout
    until port_open?
      raise "node renderer failed to start on :#{PORT} (see log/test-renderer.log)" if monotonic > deadline

      sleep 0.2
    end
  end

  def port_open?
    Socket.tcp("127.0.0.1", PORT, connect_timeout: 0.2) { true }
  rescue StandardError
    false
  end

  def monotonic = Process.clock_gettime(Process::CLOCK_MONOTONIC)
end

RSpec.configure do |config|
  config.before(:each, type: :system) { NodeRenderer.ensure_running! }
end
