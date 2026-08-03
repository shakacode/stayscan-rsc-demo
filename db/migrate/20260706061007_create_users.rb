# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      # Auth (Devise-compatible columns; Devise modules are wired ).
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at

      # Host profile.
      t.string :host_name
      t.string :host_avatar
      t.text :host_intro_text
      t.datetime :verified_at

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
