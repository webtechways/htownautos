-- Seed the canonical Copart yard list (extracted from the public Copart
-- "Locations By State" page) and wire two pre-INSERT/UPDATE triggers so
-- new auction_listings + vehicle_inspections get their yardId set
-- automatically from yardNumber. The Copart sync code stays untouched —
-- it keeps writing yardNumber and the trigger fills yardId.
--
-- Coordinates are city/yard-level approximations sufficient for shipping
-- distance estimation. Admins can refine any row from the Yards UI.

-- ── 1) Upsert every yard. (source, yardNumber) is the natural key. ──
INSERT INTO "yards" (id, source, "yardNumber", name, address, city, state, zip, country, latitude, longitude, phone, "physicalInspectionAvailable", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'COPART', 203, 'COPART CALGARY', '234082 84 STREET SE', 'CALGARY', 'AB', 'T1X 0K2', 'CA', 50.92, -113.94, '(403)290-1045', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 204, 'COPART EDMONTON', '3175 4TH STREET', 'EDMONTON', 'AB', 'T9E 8L1', 'CA', 53.41, -113.41, '(780)955-5596', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 113, 'COPART ANCHORAGE', '401 W CHIPPERFIELD DR', 'ANCHORAGE', 'AK', '99501', 'US', 61.22, -149.85, '(907) 278-2221', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 341, 'COPART DOTHAN', '10428 WEST US 84', 'NEWTON', 'AL', '36352', 'US', 31.33, -85.60, '(334) 229-9968', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 184, 'COPART MOBILE SOUTH', '9401 OLD PASCAGOULA RD', 'THEODORE', 'AL', '36582', 'US', 30.55, -88.18, '(251) 220-1132', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 58, 'COPART MOBILE', '4763 LOTT ROAD', 'EIGHT MILE', 'AL', '36613', 'US', 30.78, -88.14, '(251) 649-5011', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 136, 'COPART BIRMINGHAM', '3101 DAVEY ALLISON BLVD', 'HUEYTOWN', 'AL', '35023', 'US', 33.44, -86.99, '(205) 424-0257', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 145, 'COPART MONTGOMERY', '6044 TROY HIGHWAY', 'MONTGOMERY', 'AL', '36116', 'US', 32.31, -86.27, '(334) 281-7264', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 66, 'COPART TANNER', '20760 SANDY ROAD', 'TANNER', 'AL', '35671', 'US', 34.70, -86.96, '(256) 306-9041', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 21, 'COPART LITTLE ROCK', '703 MAIN ST', 'CONWAY', 'AR', '72032', 'US', 35.09, -92.44, '(501) 796-2812', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 140, 'COPART FAYETTEVILLE', '15976 BILL CAMPBELL ROAD', 'PRAIRIE GROVE', 'AR', '72753', 'US', 35.98, -94.32, '(479) 846-1244', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 47, 'COPART PHOENIX', '615 SO. 51ST AVENUE', 'PHOENIX', 'AZ', '85043', 'US', 33.44, -112.17, '(602) 484-7075', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 93, 'COPART TUSCON', '5600 S. ARCADIA AVENUE', 'TUCSON', 'AZ', '85706', 'US', 32.13, -110.89, '(520) 663-1900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 151, 'COPART ANTELOPE', '8650 ANTELOPE NORTH ROAD', 'ANTELOPE', 'CA', '95843', 'US', 38.72, -121.35, '(916) 721-7770', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 5, 'COPART BAKERSFIELD', '2216 COY AVENUE', 'BAKERSFIELD', 'CA', '93307', 'US', 35.34, -118.99, '(661) 834-2556', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 7, 'COPART SAN BERNARDINO', '1203 S. RANCHO AVENUE', 'COLTON', 'CA', '92324', 'US', 34.06, -117.34, '(909) 825-7600', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 4, 'COPART FRESNO', '1255 EAST CENTRAL', 'FRESNO', 'CA', '93725', 'US', 36.66, -119.74, '(559) 266-6400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 3, 'COPART HAYWARD', '1964 SABRE STREET', 'HAYWARD', 'CA', '94545', 'US', 37.67, -122.08, '(510) 783-6511', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 10, 'COPART LOS ANGELES', '8423 SOUTH ALAMEDA', 'LOS ANGELES', 'CA', '90001', 'US', 33.95, -118.25, '(323) 583-1713', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 78, 'COPART MARTINEZ', '2701 WATERFRONT ROAD', 'MARTINEZ', 'CA', '94553', 'US', 38.02, -122.13, '(925) 370-3900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 97, 'COPART RANCHO CUCAMONGA', '12167 ARROW ROUTE', 'RANCHO CUCAMONGA', 'CA', '91739', 'US', 34.11, -117.59, '(909) 581-3595', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 16, 'COPART SOUTH SACRAMENTO', '8687 WEYAND AVE', 'SACRAMENTO', 'CA', '95828', 'US', 38.49, -121.40, '(916) 381-5050', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 2, 'COPART SACRAMENTO', '8600 MORRISON CREEK DRIVE', 'SACRAMENTO', 'CA', '95828', 'US', 38.50, -121.40, '(916) 381-3999', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 59, 'COPART SAN DIEGO', '7847 AIRWAY ROAD', 'SAN DIEGO', 'CA', '92154', 'US', 32.57, -116.97, '(619) 671-0900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 6, 'COPART SAN JOSE', '13895 LLAGAS AVENUE', 'SAN MARTIN', 'CA', '95046', 'US', 37.09, -121.62, '(408) 683-9393', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 180, 'COPART SUN VALLEY', '11409 PENROSE STREET', 'SUN VALLEY', 'CA', '91352', 'US', 34.22, -118.39, '(818) 771-9389', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 343, 'COPART REDDING', '4603 LOCUST ROAD', 'REDDING', 'CA', '96007', 'US', 40.50, -122.37, '(530) 365-1253', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 1, 'COPART VALLEJO', '282 FIFTH STREET', 'VALLEJO', 'CA', '94590', 'US', 38.10, -122.26, '(707) 644-4468', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 43, 'COPART VAN NUYS', '7519 WOODMAN AVENUE', 'VAN NUYS', 'CA', '91405', 'US', 34.20, -118.43, '(818) 782-5315', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 186, 'COPART LONG BEACH', '1000E. LOMITA BLVD', 'WILMINGTON', 'CA', '90744', 'US', 33.78, -118.24, '(310) 952-9316', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 309, 'COPART ADELANTO', '10429 PANSY RD', 'ADELANTO', 'CA', '92301', 'US', 34.58, -117.41, '(442) 219-7140', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 68, 'COPART DENVER', '1281 COUNTY ROAD 27', 'BRIGHTON', 'CO', '80603', 'US', 39.99, -104.69, '(303) 659-0066', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 118, 'COPART COLORADO SPRINGS', '3701 N. NEVADA AVE', 'COLORADO SPRINGS', 'CO', '80907', 'US', 38.86, -104.82, '(719) 227-6256', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 120, 'COPART DENVER CENTRAL', '6464 DOWNING STREET', 'DENVER', 'CO', '80229', 'US', 39.83, -104.97, '(303) 289-5242', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 193, 'COPART DENVER SOUTH', '8300 BLAKELAND DRIVE', 'LITTLETON', 'CO', '80125', 'US', 39.51, -105.09, '(303) 346-3265', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 23, 'COPART HARTFORD', '138 CHRISTIAN LANE', 'NEW BRITAIN', 'CT', '06051', 'US', 41.69, -72.74, '(860) 666-1183', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 350, 'COPART HARTFORD SPRINGFIELD', '49 RUSSELL ROAD', 'EAST GRANBY', 'CT', '06026', 'US', 41.94, -72.73, '(860) 392-7700', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 130, 'COPART SEAFORD', '26029 BETHEL CONCORD ROAD', 'SEAFORD', 'DE', '19973', 'US', 38.65, -75.59, '(302) 628-5412', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 153, 'COPART ORLANDO NORTH', '3352 W ORANGE BLOSSOM TRAIL', 'APOPKA', 'FL', '32712', 'US', 28.70, -81.53, '(407) 884-0993', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 86, 'COPART FT. PIERCE', '2601 CENTER ROAD', 'FT PIERCE', 'FL', '34946', 'US', 27.45, -80.36, '(772) 461-6110', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 148, 'COPART MIAMI SOUTH', '24301 SW 137TH AVE', 'HOMESTEAD', 'FL', '33032', 'US', 25.50, -80.43, '(305) 257-1422', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 163, 'COPART JACKSONVILLE NORTH', '10200 ALTON BOX RD', 'JACKSONVILLE', 'FL', '32218', 'US', 30.41, -81.65, '(904) 800-4631', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 105, 'COPART MIAMI CENTRAL', '11858 NW 36TH AVE', 'MIAMI', 'FL', '33167', 'US', 25.86, -80.24, '(305) 685-6608', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 33, 'COPART MIAMI NORTH', '12850 NW 27TH AVE', 'MIAMI', 'FL', '33054', 'US', 25.88, -80.23, '(305) 688-6400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 117, 'COPART TALLAHASSEE', '1825 COMMERCE BLVD', 'MIDWAY', 'FL', '32343', 'US', 30.45, -84.47, '(850) 575-2075', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 108, 'COPART OCALA', '7100 NW 44 AVE', 'OCALA', 'FL', '34482', 'US', 29.21, -82.18, '(352) 732-5823', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 55, 'COPART ORLANDO SOUTH', '307 EAST LANDSTREET ROAD', 'ORLANDO', 'FL', '32824', 'US', 28.41, -81.38, '(407) 251-9832', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 137, 'COPART PUNTA GORDA', '5017 DUNCAN ROAD', 'PUNTA GORDA', 'FL', '33982', 'US', 26.95, -81.96, '(941) 505-9700', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 34, 'COPART TAMPA SOUTH', '12020 US HIGHWAY 301 SOUTH', 'RIVERVIEW', 'FL', '33578', 'US', 27.87, -82.33, '(813) 671-5550', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 70, 'COPART WEST PALM BEACH', '7876 W BELVEDERE ROAD', 'WEST PALM BEACH', 'FL', '33411', 'US', 26.69, -80.13, '(561) 798-5158', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 15, 'COPART ATLANTA WEST', '2568 OLD ALABAMA ROAD', 'AUSTELL', 'GA', '30168', 'US', 33.81, -84.64, '(770) 941-9775', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 175, 'COPART CARTERSVILLE', '1880 HWY 113', 'CARTERSVILLE', 'GA', '30120', 'US', 34.17, -84.80, '(678) 721-0730', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 146, 'COPART ATLANTA SOUTH', '761 CLARK DRIVE', 'ELLENWOOD', 'GA', '30294', 'US', 33.61, -84.28, '(770) 389-1768', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 157, 'COPART ATLANTA NORTH', '1602 ATHENS HIGHWAY', 'GAINESVILLE', 'GA', '30507', 'US', 34.30, -83.79, '(770) 534-0850', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 173, 'COPART FAIRBURN', '6737 ROOSEVELT HWY', 'FAIRBURN', 'GA', '30213', 'US', 33.57, -84.61, '(478) 606-0000', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 107, 'COPART ATLANTA EAST', '6089 HIGHWAY 20', 'LOGANVILLE', 'GA', '30052', 'US', 33.84, -83.89, '(770) 554-8836', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 187, 'COPART MACON', '304 SMITH ROAD', 'BYRON', 'GA', '31008', 'US', 32.65, -83.76, '(478) 298-4159', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 87, 'COPART SAVANNAH', '5510 SILK HOPE ROAD', 'SAVANNAH', 'GA', '31405', 'US', 32.09, -81.20, '(912) 233-1936', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 88, 'COPART TIFTON', '399 OAKRIDGE CHURCH RD', 'TIFTON', 'GA', '31794', 'US', 31.45, -83.51, '(229) 386-4900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 110, 'COPART HONOLULU', '91-542 AWAKUMOKO ST', 'KAPOLEI', 'HI', '96707', 'US', 21.34, -158.07, '(808) 682-8770', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 60, 'COPART DES MOINES', '3300 VANDALIA ROAD', 'DES MOINES', 'IA', '50317', 'US', 41.60, -93.55, '(515) 262-1900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 169, 'COPART DAVENPORT', '3601 S 1ST STREET', 'ELDRIDGE', 'IA', '52748', 'US', 41.66, -90.58, '(563) 275-3865', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 72, 'COPART BOISE', '3716 NORTH MIDDLETON ROAD', 'NAMPA', 'ID', '83651', 'US', 43.57, -116.56, '(208) 463-4040', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 189, 'COPART SOUTHERN ILLINOIS', '99 RACEHORSE DRIVE', 'ALORTON', 'IL', '62205', 'US', 38.59, -90.09, '(618) 332-3115', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 81, 'COPART CHICAGO SOUTH', '89 E SAUK TRAIL', 'CHICAGO HEIGHTS', 'IL', '60411', 'US', 41.50, -87.64, '(708) 755-0506', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 36, 'COPART CHICAGO NORTH', '1475 BLUFF CITY BLVD', 'ELGIN', 'IL', '60120', 'US', 42.04, -88.28, '(630) 497-8343', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 51, 'COPART PEORIA', '350 VETERANS DRIVE', 'PEKIN', 'IL', '61554', 'US', 40.57, -89.64, '(309) 272-3733', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 156, 'COPART WHEELING', '110 EAST PALATINE ROAD', 'WHEELING', 'IL', '60090', 'US', 42.14, -87.93, '(847) 229-6150', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 370, 'COPART DYER', '641 JOLIET ST', 'DYER', 'IN', '46311', 'US', 41.49, -87.52, '(219) 209-6992', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 170, 'COPART CICERO', '1461 E 226TH STREET', 'CICERO', 'IN', '46034', 'US', 40.12, -86.01, '(317) 758-0280', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 360, 'COPART FORT WAYNE', '3600 E. WASHINGTON BLVD.', 'FORT WAYNE', 'IN', '46803', 'US', 41.08, -85.10, '(260) 333-1153', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 167, 'COPART HAMMOND', '1849 SUMMER ST', 'HAMMOND', 'IN', '46320', 'US', 41.59, -87.50, '(219) 932-0355', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 152, 'COPART HARTFORD CITY', '696 EAST STATE ROAD 26', 'HARTFORD CITY', 'IN', '47348', 'US', 40.45, -85.37, '(765) 348-4600', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 44, 'COPART INDIANAPOLIS', '4040 OFFICE PLAZA BLVD', 'INDIANAPOLIS', 'IN', '46254', 'US', 39.83, -86.27, '(317) 216-2186', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 17, 'COPART KANSAS CITY', '6211 KANSAS AVE', 'KANSAS CITY', 'KS', '66111', 'US', 39.11, -94.73, '(913) 287-6200', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 67, 'COPART WICHITA', '4510 S MADISON', 'WICHITA', 'KS', '67216', 'US', 37.62, -97.32, '(316) 554-0123', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 83, 'COPART LEXINGTON WEST', '1051 INDUSTRY ROAD', 'LAWRENCEBURG', 'KY', '40342', 'US', 38.04, -84.90, '(502) 859-0051', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 115, 'COPART LEXINGTON EAST', '5801 KASP COURT', 'LEXINGTON', 'KY', '40509', 'US', 38.05, -84.40, '(859) 264-7401', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 345, 'COPART EARLINGTON', '700 N SANDCUT RD', 'EARLINGTON', 'KY', '42410', 'US', 37.28, -87.51, '(859) 687-8699', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 143, 'COPART LOUISVILLE', '3100 POND STATION RD', 'LOUISVILLE', 'KY', '40272', 'US', 38.13, -85.83, '(502) 361-1881', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 138, 'COPART WALTON', '13273 DIXIE HIGHWAY', 'WALTON', 'KY', '41094', 'US', 38.87, -84.61, '(859) 356-4900', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 50, 'COPART BATON ROUGE', '21595 GREENWELL SPRINGS RD', 'GREENWELL SPRINGS', 'LA', '70739', 'US', 30.57, -90.98, '(225) 261-0102', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 79, 'COPART NEW ORLEANS', '14600 OLD GENTILLY RD', 'NEW ORLEANS', 'LA', '70129', 'US', 30.04, -89.86, '(504) 254-3944', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 84, 'COPART SHREVEPORT', '5235 GREENWOOD RD', 'SHREVEPORT', 'LA', '71109', 'US', 32.47, -93.82, '(318) 636-4242', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 27, 'COPART SOUTH BOSTON', '82 CAPE ROAD', 'MENDON', 'MA', '01756', 'US', 42.10, -71.55, '(508) 473-4572', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 53, 'COPART NORTH BOSTON', '55R HIGH ST', 'NORTH BILLERICA', 'MA', '01682', 'US', 42.58, -71.27, '(978) 667-6787', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 149, 'COPART WEST WARREN', '600 OLD WEST WARREN RD', 'WEST WARREN', 'MA', '01092', 'US', 42.19, -72.21, '(413) 436-5013', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 102, 'COPART BALTIMORE', '2251 OLD WESTMINSTER PIKE', 'FINKSBURG', 'MD', '21048', 'US', 39.48, -76.99, '(410) 871-9080', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 32, 'COPART WASHINGTON DC', '11055 BILLINGSLEY ROAD', 'WALDORF', 'MD', '20602', 'US', 38.63, -76.92, '(301) 870-7844', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 342, 'COPART BALTIMORE EAST', '601 W PATAPSCO AVE', 'BALTIMORE', 'MD', '21225', 'US', 39.24, -76.61, '(443) 589-5566', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 90, 'COPART LYMAN', '136 KENNEBUNK POND ROAD', 'ALFRED', 'ME', '04002', 'US', 43.47, -70.72, '(207) 249-6176', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 159, 'COPART FLINT', '5000 N STATE ROAD', 'DAVISON', 'MI', '48243', 'US', 43.04, -83.52, '(810) 653-4161', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 161, 'COPART KINCHELOE', '5030 W KINCHELOE ROAD', 'KINCHELOE', 'MI', '49788', 'US', 46.26, -84.47, '(906) 542-4240', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 103, 'COPART LANSING', '3902 SOUTH CANAL RD', 'LANSING', 'MI', '48917', 'US', 42.69, -84.62, '(517) 322-2455', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 160, 'COPART IONIA', '8460 S STATE ROAD', 'PORTLAND', 'MI', '48875', 'US', 42.87, -84.90, '(616) 374-8818', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 61, 'COPART DETROIT', '21000 HAYDEN DRIVE', 'WOODHAVEN', 'MI', '48183', 'US', 42.14, -83.24, '(734) 365-0070', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 52, 'COPART ST. CLOUD', '200 COUNTY ROAD 159', 'AVON', 'MN', '56310', 'US', 45.61, -94.45, '(320) 356-2299', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 37, 'COPART MINNEAPOLIS', '10588 CENTRAL AVE NE', 'BLAINE', 'MN', '55434', 'US', 45.16, -93.23, '(763) 781-1025', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 80, 'COPART MINNEAPOLIS NORTH', '1526 BUNKER LAKE BLVD', 'HAM LAKE', 'MN', '55304', 'US', 45.25, -93.25, '(763) 772-0700', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 20, 'COPART ST. LOUIS', '13033 TAUSSIG AVE', 'BRIDGETON', 'MO', '63044', 'US', 38.77, -90.41, '(314) 291-8400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 125, 'COPART COLUMBIA', '8485 RICHLAND RD', 'COLUMBIA', 'MO', '65201', 'US', 38.95, -92.33, '(573) 814-0070', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 92, 'COPART SPRINGFIELD', '2889 E US HIGHWAY 60', 'ROGERSVILLE', 'MO', '65742', 'US', 37.10, -93.05, '(417) 200-0081', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 141, 'COPART SIKESTON', '687 E OUTER RD', 'SIKESTON', 'MO', '63801', 'US', 36.88, -89.59, '(573) 471-4550', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 40, 'COPART JACKSON', '205 S RANKIN INDUSTRIAL DRIVE', 'FLORENCE', 'MS', '39073', 'US', 32.15, -90.13, '(601) 939-7941', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 122, 'COPART BILLINGS', '1090 ISLAND PARK RD', 'BILLINGS', 'MT', '59101', 'US', 45.78, -108.50, '(406) 254-7516', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 106, 'COPART HELENA', '3333 BOZEMAN AVENUE', 'HELENA', 'MT', '59601', 'US', 46.59, -112.04, '(406) 443-5060', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 208, 'COPART MONCTON', '1300 BERRY MILLS RD', 'MONCTON', 'NB', 'E1E 4R8', 'CA', 46.09, -64.78, '(506) 268-2812', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 41, 'COPART CHINA GROVE', '1081 RECOVERY ROAD', 'CHINA GROVE', 'NC', '28023', 'US', 35.57, -80.58, '(704) 857-5177', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 356, 'COPART CONCORD', '7940 U.S. HIGHWAY 601 S.', 'CONCORD', 'NC', '28025', 'US', 35.41, -80.58, '(704) 209-9699', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 368, 'COPART RALEIGH NORTH', '1900 OLD CREWS RD', 'KINGHTDALE', 'NC', '27545', 'US', 35.79, -78.48, '(984) 246-2400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 54, 'COPART RALEIGH', '310 COPART ROAD', 'DUNN', 'NC', '28334', 'US', 35.31, -78.61, '(910) 891-1252', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 338, 'COPART LUMBERTON', '4019 NC 72 HWY W', 'LUMBERTON', 'NC', '28360', 'US', 34.62, -79.01, '(910) 671-5913', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 340, 'COPART GASTONIA', '1900 OLD CREWS RD', 'GASTONIA', 'NC', '27545', 'US', 35.26, -81.19, '(984) 246-2400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 154, 'COPART MEBANE', '1870 US 70 HWY', 'MEBANE', 'NC', '27302', 'US', 36.10, -79.27, '(336) 578-2934', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 196, 'COPART MOCKSVILLE', '2668 US-601', 'MOCKSVILLE', 'NC', '27028', 'US', 35.89, -80.56, '(336) 257-1804', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 363, 'COPART BISMARCK', '3700 APPLE CREEK RD', 'BISMARCK', 'ND', '58501', 'US', 46.81, -100.78, '(701) 712-6390', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 123, 'COPART LINCOLN', '13603 238TH ST', 'GREENWOOD', 'NE', '68366', 'US', 41.02, -96.44, '(402) 325-1283', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 155, 'COPART CANDIA', '134 RAYMOND RD', 'CANDIA', 'NH', '03034', 'US', 43.06, -71.32, '(603) 483-0371', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 31, 'COPART GLASSBORO EAST', '200 GROVE ST', 'GLASSBORO', 'NJ', '08028', 'US', 39.70, -75.11, '(856) 881-6700', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 69, 'COPART GLASSBORO WEST', '781 JACOB HARRIS AVENUE', 'GLASSBORO', 'NJ', '08028', 'US', 39.70, -75.11, '(609) 888-6808', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 91, 'COPART SOMERVILLE', '2124 WEST CAMPLAIN ROAD', 'HILLSBOROUGH', 'NJ', '08844', 'US', 40.52, -74.65, '(908) 541-2200', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 135, 'COPART TRENTON', '108 N MAIN STREET', 'WINDSOR', 'NJ', '08561', 'US', 40.28, -74.59, '(609) 918-1720', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 75, 'COPART ALBUQUERQUE', '7705 BROADWAY SE', 'ALBUQUERQUE', 'NM', '87105', 'US', 35.05, -106.65, '(505) 877-2424', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 207, 'COPART HALIFAX', '128 PARK ROAD', 'HALIFAX', 'NS', 'B2S 2L3', 'CA', 44.65, -63.58, '(902) 461-0238', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 57, 'COPART LAS VEGAS', '4810 N LAMB BLVD', 'LAS VEGAS', 'NV', '89115', 'US', 36.23, -115.12, '(702) 638-9300', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 100, 'COPART RENO', '9915 N VIRGINIA STREET', 'RENO', 'NV', '89506', 'US', 39.60, -119.80, '(775) 322-4377', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 94, 'COPART ALBANY', '1916 CENTRAL AVE', 'ALBANY', 'NY', '12205', 'US', 42.72, -73.85, '(518) 452-9313', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 344, 'COPART BUFFALO', '8418 SOUTHWESTERN BLVD.', 'ANGOLA', 'NY', '14006', 'US', 42.64, -78.89, '(716) 800-3145', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 30, 'COPART LONG ISLAND', '1983 MONTAUK HIGHWAY', 'BROOKHAVEN', 'NY', '11719', 'US', 40.78, -72.92, '(631) 776-0994', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 25, 'COPART SYRACUSE', '46 ZUK-PIERCE RD', 'CENTRAL SQUARE', 'NY', '13036', 'US', 43.29, -76.14, '(315) 676-7153', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 35, 'COPART ROCHESTER', '4 WEST AVE', 'LEROY', 'NY', '14482', 'US', 42.98, -77.99, '(585) 768-8160', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 24, 'COPART NEWBURGH', '91 RIVERVIEW DRIVE', 'MARLBORO', 'NY', '12542', 'US', 41.60, -74.00, '(845) 236-3371', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 112, 'COPART CLEVELAND WEST', '34417 E ROYALTON ROAD', 'COLUMBIA STATION', 'OH', '44028', 'US', 41.32, -81.92, '(440) 748-8100', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 29, 'COPART COLOMBUS', '1680 WILLIAMS ROAD', 'COLOMBUS', 'OH', '43207', 'US', 39.91, -82.96, '(614) 497-1590', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 166, 'COPART DAYTON', '4691 SPRINGBORO PIKE', 'MORAINE', 'OH', '45439', 'US', 39.69, -84.22, '(937) 296-5371', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 111, 'COPART CLEVELAND EAST', '286 EAST TWINSBURG ROAD', 'NORTHFIELD', 'OH', '44067', 'US', 41.35, -81.53, '(330) 423-1080', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 18, 'COPART OKLAHOMA CITY', '2829 SE 15TH STREET', 'OKLAHOMA CITY', 'OK', '73129', 'US', 35.45, -97.48, '(405) 672-5674', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 19, 'COPART TULSA', '2408 W 21ST STREET', 'TULSA', 'OK', '74107', 'US', 36.14, -96.05, '(918) 582-3828', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 202, 'COPART LONDON', '1809 GORE ROAD', 'LONDON', 'ON', 'N5W 6C8', 'CA', 42.98, -81.25, '(519)451-0992', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 201, 'COPART TORONTO', '175 OSBORNE ROAD', 'COURTICE', 'ON', 'L1E 2R3', 'CA', 43.89, -78.77, '(905)436-2045', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 104, 'COPART EUGENE', '29815 END ROAD EAST', 'EUGENE', 'OR', '97402', 'US', 44.05, -123.09, '(541) 689-3533', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 9, 'COPART PORTLAND NORTH', '6900 NE CORNFOOT DRIVE', 'PORTLAND', 'OR', '97218', 'US', 45.59, -122.59, '(503) 281-0848', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 134, 'COPART PORTLAND SOUTH', '2885 NATIONAL WAY', 'WOODBURN', 'OR', '97071', 'US', 45.14, -122.86, '(503) 981-0038', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 128, 'COPART CHAMBERSBURG', '2962 LINCOLN WAY WEST', 'CHAMBERSBURG', 'PA', '17201', 'US', 39.92, -77.70, '(717) 264-3331', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 142, 'COPART SCRANTON', '210 MCALPINE STREET', 'DURYEA', 'PA', '18642', 'US', 41.34, -75.76, '(570) 451-1871', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 129, 'COPART ALTOONA', '4007 ADMIRAL PEARY HWY', 'EBENSBURG', 'PA', '15931', 'US', 40.49, -78.72, '(814) 472-5392', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 28, 'COPART PITTSBURGH NORTH', '2000 RIVER ROAD', 'ELLWOOD CITY', 'PA', '16117', 'US', 40.86, -80.28, '(724) 758-0480', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 76, 'COPART HARRISBURG', '8 PARK DRIVE', 'GRANTVILLE', 'PA', '17028', 'US', 40.41, -76.69, '(717) 861-7400', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 26, 'COPART PHILADELPHIA', '2704 GERYVILLE PIKE', 'PENNSBURG', 'PA', '18073', 'US', 40.39, -75.49, '(215) 679-3164', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 164, 'COPART PHILADELPHIA EAST', '77 BRISTOL ROAD', 'CHALFONT', 'PA', '18914', 'US', 40.29, -75.21, '(215)996-0971', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 174, 'COPART PITTSBURGH WEST', '1451 LEBANON SCHOOL ROAD', 'WEST MIFFLIN', 'PA', '15122', 'US', 40.38, -79.90, '(412) 200-5626', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 85, 'COPART PITTSBURGH SOUTH', '526 THOMPSON RUN RD', 'WEST MIFFLIN', 'PA', '15122', 'US', 40.36, -79.93, '(412) 464-4340', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 127, 'COPART YORK HAVEN', '795 SIPE RD', 'YORK HAVEN', 'PA', '17370', 'US', 40.12, -76.72, '(717) 938-1879', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 205, 'COPART MONTREAL', '6900 MARIEN AVENUE', 'MONTREAL', 'QC', 'H1B 4W3', 'CA', 45.59, -73.55, '(514)643-3000', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 199, 'COPART EXETER', '10 INDUSTRIAL DRIVE', 'EXETER', 'RI', '02822', 'US', 41.57, -71.64, '(401) 397-5711', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 56, 'COPART COLUMBIA', '4324 HIGHWAY 321 SOUTH', 'GASTON', 'SC', '29053', 'US', 33.81, -81.11, '(803) 794-3252', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 144, 'COPART SPARTANBURG', '1922 NAZARETH CHURCH ROAD', 'SPARTANBURG', 'SC', '29301', 'US', 34.88, -82.01, '(864) 877-9113', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 197, 'COPART NORTH CHARLESTON', '120 COMMERCE AVE', 'HARLEYVILLE', 'SC', '29448', 'US', 33.18, -80.46, '(843) 900-6769', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 63, 'COPART NASHVILLE', '865 STUMPY LANE', 'LEBANON', 'TN', '37090', 'US', 36.19, -86.32, '(615) 449-6195', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 114, 'COPART KNOXVILLE', '6355 B HIGHWAY 411', 'MADISONVILLE', 'TN', '37354', 'US', 35.51, -84.41, '(423) 442-5866', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 22, 'COPART MEMPHIS', '5545 SWINNEA RD', 'MEMPHIS', 'TN', '38118', 'US', 35.05, -89.99, '(901) 398-8989', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 73, 'COPART ABILENE', '2630 FM ROAD #3034', 'ABILENE', 'TX', '79601', 'US', 32.41, -99.73, '(325) 676-2996', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 95, 'COPART AMARILLO', '3999 S LOOP 335 E', 'AMARILLO', 'TX', '79118', 'US', 35.18, -101.79, '(806) 335-3701', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 185, 'COPART ANDREWS', '1975 SOUTH WEST 860', 'ANDREWS', 'TX', '79714', 'US', 32.33, -102.54, '(432) 524-6353', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 45, 'COPART EL PASO', '501 VALLEY CHILI RD', 'ANTHONY', 'TX', '79821', 'US', 32.00, -106.60, '(915) 600-7145', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 96, 'COPART CORPUS CHRISTI', '3200 AGNES STREET', 'CORPUS CHRISTI', 'TX', '78405', 'US', 27.79, -97.44, '(361) 884-9260', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 313, 'CRASHEDTOYS DALLAS', '7777 JOHN W CARPENTER FREEWAY', 'DALLAS', 'TX', '75247', 'US', 32.82, -96.89, '(214) 920-9664', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 12, 'COPART DALLAS', '505 IDLEWILD ROAD', 'GRAND PRAIRIE', 'TX', '75051', 'US', 32.74, -97.00, '(972) 263-2711', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 357, 'COPART HOUSTON EAST', '15706 BEAUMONT HWY', 'HOUSTON', 'TX', '77049', 'US', 29.80, -95.18, '(281) 407-2658', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 98, 'COPART FT. WORTH', '950 BLUE MOUND ROAD WEST', 'HASLET', 'TX', '76052', 'US', 32.97, -97.35, '(817) 231-4500', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 11, 'COPART HOUSTON', '1655 RANKIN ROAD', 'HOUSTON', 'TX', '77073', 'US', 29.99, -95.40, '(281)214-7800', true, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 14, 'COPART LONGVIEW', '3046 HIGHWAY 322 SOUTH', 'LONGVIEW', 'TX', '75603', 'US', 32.52, -94.74, '(903) 643-9705', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 13, 'COPART LUFKIN', '3700 OLD UNION ROAD', 'LUFKIN', 'TX', '75904', 'US', 31.34, -94.73, '(936) 639-3558', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 65, 'COPART MCALLEN', '301 MILE 1 EAST', 'MERCEDES', 'TX', '78570', 'US', 26.15, -97.91, '(956) 514-4840', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 62, 'COPART AUSTIN', '8725 N INTERSTATE 35', 'NEW BRAUNFELS', 'TX', '78130', 'US', 29.70, -98.12, '(830) 625-2030', true, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 74, 'COPART SAN ANTONIO', '11130 APPLEWHITE RD', 'SAN ANTONIO', 'TX', '78224', 'US', 29.27, -98.52, '(210) 628-1690', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 182, 'COPART WACO', '7201 N GENERAL BRUCE DR', 'TEMPLE', 'TX', '76501', 'US', 31.10, -97.34, '(254) 773-8924', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 181, 'COPART DALLAS SOUTH', '1701 EAST BELTLINE RD', 'WILMER', 'TX', '75172', 'US', 32.59, -96.68, '(972) 525-6015', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 188, 'COPART OGDEN', '3586 NORTH 2000 WEST', 'FARR WEST', 'UT', '84404', 'US', 41.28, -112.03, '(801) 731-0216', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 336, 'COPART SALT LAKE CITY', '7320 WEST 2100 SOUTH', 'MAGNA', 'UT', '84044', 'US', 40.71, -112.10, '(801) 770-0703', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 101, 'COPART RICHMOND EAST', '6300 CHAMBERS ROAD', 'CHARLES CITY', 'VA', '23030', 'US', 37.35, -77.07, '(804) 829-9160', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 82, 'COPART DANVILLE', '12360 US HWY 29', 'CHATHAM', 'VA', '24531', 'US', 36.82, -79.40, '(434) 473-6372', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 194, 'COPART FREDERICKSBURG', '4717 MASSAPONAX CHURCH ROAD', 'FREDERICKSBURG', 'VA', '22408', 'US', 38.22, -77.51, '(540) 595-3660', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 162, 'COPART HAMPTON', '16 NETTLES LANE', 'HAMPTON', 'VA', '23666', 'US', 37.06, -76.41, '(757) 766-2750', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 139, 'COPART RICHMOND', '5701 WHITESIDE RD', 'SANDSTON', 'VA', '23150', 'US', 37.53, -77.32, '(804) 328-1023', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 116, 'COPART SPOKANE', '11019 WEST MCFARLANE ROAD', 'AIRWAY HEIGHTS', 'WA', '99001', 'US', 47.64, -117.59, '(509) 244-8585', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 48, 'COPART NORTH SEATTLE', '16701 51ST AVE NE', 'ARLINGTON', 'WA', '98223', 'US', 48.19, -122.14, '(360) 651-6299', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 64, 'COPART GRAHAM', '21421 MERIDIAN E', 'GRAHAM', 'WA', '98338', 'US', 47.05, -122.29, '(253) 847-8300', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 71, 'COPART PASCO', '3333 N RAILROAD AVENUE', 'PASCO', 'WA', '99301', 'US', 46.24, -119.10, '(509) 547-1701', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 191, 'COPART APPLETON', '2500 AMERICAN DRIVE', 'APPLETON', 'WI', '54914', 'US', 44.26, -88.42, '(920) 830-2892', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 339, 'COPART MILWAUKEE NORTH', '9201 N 107TH ST', 'MILWAUKEE', 'WI', '54914', 'US', 43.16, -88.05, '(414) 219-0986', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 39, 'COPART MILWAUKEE', '4825 S WHITNALL AVE', 'CUDAHY', 'WI', '53110', 'US', 42.94, -87.86, '(414) 769-7665', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 38, 'COPART MADISON', '5448 LIEN ROAD', 'MADISON', 'WI', '53718', 'US', 43.13, -89.30, '(608) 249-3577', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 89, 'COPART CHARLESTON', '1746 US ROUTE 60', 'HURRICANE', 'WV', '25526', 'US', 38.43, -82.01, '(304) 562-2088', false, true, NOW(), NOW()),
  (gen_random_uuid(), 'COPART', 192, 'COPART CASPER', '1998 OIL FIELD CENTER RD', 'CASPER', 'WY', '82604', 'US', 42.87, -106.31, '(307) 234-6363', false, true, NOW(), NOW())
ON CONFLICT (source, "yardNumber") DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  zip = EXCLUDED.zip,
  country = EXCLUDED.country,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  phone = EXCLUDED.phone,
  "updatedAt" = NOW();

-- ── 2) Mark the two yards we visit in person. ──────────────────────────
-- Yard #62 = COPART AUSTIN (New Braunfels, TX), yard #11 = COPART HOUSTON.
-- Already set via the INSERT above; the UPDATE here makes the intent
-- explicit and survives any future edit of the seed row.
UPDATE "yards"
SET "physicalInspectionAvailable" = true
WHERE source = 'COPART' AND "yardNumber" IN (11, 62);

-- ── 3) Trigger: keep auction_listings.yardId in sync with yardNumber. ──
-- The Copart sync writes yardNumber + yardName to listings and knows
-- nothing about the Yard table. This trigger fills yardId before the row
-- lands. Existing rows are also handled via the same trigger on UPDATE.
CREATE OR REPLACE FUNCTION sync_auction_listing_yard_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."yardNumber" IS NOT NULL THEN
    SELECT id INTO NEW."yardId"
    FROM "yards"
    WHERE source = 'COPART' AND "yardNumber" = NEW."yardNumber"
    LIMIT 1;
  ELSE
    NEW."yardId" := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auction_listing_yard_sync ON "auction_listings";
CREATE TRIGGER auction_listing_yard_sync
  BEFORE INSERT OR UPDATE OF "yardNumber" ON "auction_listings"
  FOR EACH ROW
  EXECUTE FUNCTION sync_auction_listing_yard_id();

-- Same pattern for vehicle_inspections — its yardNumber is TEXT (the
-- inspection service copies it as a string), so we cast both sides.
CREATE OR REPLACE FUNCTION sync_vehicle_inspection_yard_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."yardNumber" IS NOT NULL AND NEW."yardNumber" <> '' THEN
    BEGIN
      SELECT id INTO NEW."yardId"
      FROM "yards"
      WHERE source = 'COPART' AND "yardNumber" = NEW."yardNumber"::integer
      LIMIT 1;
    EXCEPTION WHEN invalid_text_representation THEN
      -- yardNumber isn't a clean integer (e.g. "OH-DAYTON-2"); leave yardId NULL.
      NEW."yardId" := NULL;
    END;
  ELSE
    NEW."yardId" := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_inspection_yard_sync ON "vehicle_inspections";
CREATE TRIGGER vehicle_inspection_yard_sync
  BEFORE INSERT OR UPDATE OF "yardNumber" ON "vehicle_inspections"
  FOR EACH ROW
  EXECUTE FUNCTION sync_vehicle_inspection_yard_id();

-- ── 4) Backfill yardId for any rows the new seed created yards for. ────
-- The previous migration linked listings whose yardName existed in the
-- listing table; this catches any that match the canonical seed by
-- yardNumber alone.
UPDATE "auction_listings" al
SET "yardId" = y.id
FROM "yards" y
WHERE y.source = 'COPART'
  AND y."yardNumber" = al."yardNumber"
  AND al."yardNumber" IS NOT NULL
  AND (al."yardId" IS NULL OR al."yardId" <> y.id);
