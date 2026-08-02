# frozen_string_literal: true

require "bigdecimal"
require "bigdecimal/util"

class Quote
  module Calculations
    # Canonical stay-price formula for one channel over [check_in, check_out).
    # Computed entirely in BigDecimal so the Postgres `total_price` SQL function
    # can mirror it exactly; the parity spec asserts they agree.
    #
    # Order (all COALESCE(nil) => 0):
    #   rent      = sum of night_price over the nights
    #   rent_net  = rent * (100 - loyalty_discount_pct) / 100
    #                 (monthly at 28+ nights, weekly at 7+ nights, else 0)
    #   fees      = static_fee + percent_fee*rent_net + per_guest_stay + per_guest_night + pet
    #   subtotal  = rent_net + fees
    #   tax       = subtotal * tax_rate
    #   total     = round(subtotal + tax, 2)
    # percent_fee and tax_rate are fractions (0.10 = 10%); discounts are integer percents.
    class Total
      Result = Data.define(:nights, :rent, :rent_net, :fees, :subtotal, :tax, :total)

      def self.call(**kwargs)
        new(**kwargs).call
      end

      def initialize(channel:, check_in:, check_out:, adults:, children: 0, infants: 0, pets: false)
        @channel = channel
        @check_in = check_in
        @check_out = check_out
        @adults = adults
        @children = children
        @infants = infants
        @pets = pets
      end

      def call
        Result.new(
          nights: nights, rent: rent, rent_net: rent_net, fees: fees,
          subtotal: subtotal, tax: tax, total: total
        )
      end

      private

      attr_reader :channel, :check_in, :check_out, :adults, :children, :infants, :pets

      def nights
        (check_out - check_in).to_i
      end

      def rent
        (check_in...check_out).sum(BigDecimal(0)) { |date| dec(channel.night_price(date)) }
      end

      def loyalty_discount_pct
        return channel.monthly_discount.to_i if nights >= 28
        return channel.weekly_discount.to_i if nights >= 7

        0
      end

      def rent_net
        rent * (100 - loyalty_discount_pct) / 100
      end

      def fees
        dec(channel.static_fee) +
          dec(channel.percent_fee) * rent_net +
          per_guest_stay_fee + per_guest_night_fee + pet_fee
      end

      def subtotal
        rent_net + fees
      end

      def tax
        (subtotal * dec(channel.tax_rate)).round(2)
      end

      def total
        (subtotal + tax).round(2)
      end

      def chargeable_guests
        count = 0
        count += adults if channel.per_guest_includes_adults?
        count += children if channel.per_guest_includes_children?
        count += infants if channel.per_guest_includes_infants?
        count
      end

      def per_guest_stay_fee
        over = [ chargeable_guests - channel.per_guest_stay_fee_from.to_i, 0 ].max
        dec(channel.per_guest_stay_fee) * over
      end

      def per_guest_night_fee
        over = [ chargeable_guests - channel.per_guest_night_fee_from.to_i, 0 ].max
        dec(channel.per_guest_night_fee) * over * nights
      end

      def pet_fee
        pets ? dec(channel.pet_fee) : BigDecimal(0)
      end

      def dec(value)
        value ? value.to_d : BigDecimal(0)
      end
    end
  end
end
