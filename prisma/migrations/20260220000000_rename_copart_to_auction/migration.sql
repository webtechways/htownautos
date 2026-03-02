-- Rename copart tables to auction tables
ALTER TABLE copart_listings RENAME TO auction_listings;
ALTER TABLE copart_favorites RENAME TO auction_favorites;
