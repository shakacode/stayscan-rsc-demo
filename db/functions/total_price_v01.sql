-- Stay total for one channel over [check_in, check_out). Mirrors
-- Quote::Calculations::Total exactly (the parity spec asserts agreement).
CREATE OR REPLACE FUNCTION total_price(
  p_channel_id bigint,
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_pets boolean
) RETURNS numeric AS $$
DECLARE
  ch listing_channels%ROWTYPE;
  v_nights integer;
  v_rent numeric := 0;
  v_discount_pct integer := 0;
  v_rent_net numeric;
  v_chargeable integer := 0;
  v_pp_stay numeric;
  v_pp_night numeric;
  v_pet numeric := 0;
  v_static numeric;
  v_percent numeric;
  v_subtotal numeric;
  v_tax numeric;
BEGIN
  SELECT * INTO ch FROM listing_channels WHERE id = p_channel_id;
  v_nights := p_check_out - p_check_in;

  -- rent = sum over the nights of the rate range covering each night, falling
  -- back to the channel's default where no range does.
  SELECT COALESCE(SUM(COALESCE(r.nightly_price, ch.nightly_price_default, 0)), 0)
    INTO v_rent
    FROM generate_series(p_check_in, p_check_out - 1, interval '1 day') AS night
    LEFT JOIN channel_rates r
      ON r.listing_channel_id = ch.id
     AND r.during @> night::date;

  -- length-of-stay discount
  IF v_nights >= 28 THEN
    v_discount_pct := COALESCE(ch.monthly_discount, 0);
  ELSIF v_nights >= 7 THEN
    v_discount_pct := COALESCE(ch.weekly_discount, 0);
  END IF;
  v_rent_net := v_rent * (100 - v_discount_pct) / 100;

  -- chargeable guests for per-person fees
  IF ch.per_guest_includes_adults THEN v_chargeable := v_chargeable + p_adults; END IF;
  IF ch.per_guest_includes_children THEN v_chargeable := v_chargeable + p_children; END IF;
  IF ch.per_guest_includes_infants THEN v_chargeable := v_chargeable + p_infants; END IF;

  v_pp_stay := COALESCE(ch.per_guest_stay_fee, 0)
    * GREATEST(0, v_chargeable - COALESCE(ch.per_guest_stay_fee_from, 0));
  v_pp_night := COALESCE(ch.per_guest_night_fee, 0)
    * GREATEST(0, v_chargeable - COALESCE(ch.per_guest_night_fee_from, 0)) * v_nights;
  IF p_pets THEN v_pet := COALESCE(ch.pet_fee, 0); END IF;
  v_static := COALESCE(ch.static_fee, 0);
  v_percent := COALESCE(ch.percent_fee, 0) * v_rent_net;

  v_subtotal := v_rent_net + v_static + v_percent + v_pp_stay + v_pp_night + v_pet;
  v_tax := round(v_subtotal * COALESCE(ch.tax_rate, 0), 2);

  RETURN round(v_subtotal + v_tax, 2);
END;
$$ LANGUAGE plpgsql STABLE;
