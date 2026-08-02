CREATE TRIGGER listings_to_search_row
  AFTER INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION listings_to_search_row_trigger();
