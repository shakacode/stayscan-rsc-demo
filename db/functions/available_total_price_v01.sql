-- Like total_price, but returns NULL if any night in the range is unavailable
-- for stay: either a blackout range overlaps the stay, or the stay reaches
-- outside the window the provider told us about and we do not assume the nights
-- beyond it are open.
CREATE OR REPLACE FUNCTION available_total_price(
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
  v_stay daterange;
BEGIN
  SELECT * INTO ch FROM listing_channels WHERE id = p_channel_id;
  -- Half-open: the nights slept are [check_in, check_out).
  v_stay := daterange(p_check_in, p_check_out);

  -- Nights we hold no calendar for are governed by the channel default.
  IF NOT COALESCE(ch.calendar_window @> v_stay, false)
     AND NOT ch.stay_availability_default THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM channel_blackouts b
     WHERE b.listing_channel_id = ch.id
       AND b.kind = 'stay'
       AND b.during && v_stay
  ) THEN
    RETURN NULL;
  END IF;

  RETURN total_price(p_channel_id, p_check_in, p_check_out, p_adults, p_children, p_infants, p_pets);
END;
$$ LANGUAGE plpgsql STABLE;
