/**
 * Airport Service
 * Provides airport search functionality with mock data.
 * TODO: Replace with actual backend API when ready.
 */

export interface Airport {
  iata: string
  name: string
  city: string
  country: string
  lat: number
  lng: number
}

// Top 200+ major world airports with coordinates
// Source: Compiled from public aviation data
const AIRPORTS: Airport[] = [
  // United States
  { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 },
  { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', lat: 33.9416, lng: -118.4085 },
  { iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', lat: 41.9742, lng: -87.9073 },
  { iata: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', lat: 32.8998, lng: -97.0403 },
  { iata: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', lat: 39.8561, lng: -104.6737 },
  { iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', lat: 37.6213, lng: -122.3790 },
  { iata: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', lat: 47.4502, lng: -122.3088 },
  { iata: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States', lat: 36.0840, lng: -115.1537 },
  { iata: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', lat: 28.4312, lng: -81.3081 },
  { iata: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', lat: 25.7959, lng: -80.2870 },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', lat: 33.6407, lng: -84.4277 },
  { iata: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', lat: 42.3656, lng: -71.0096 },
  { iata: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', lat: 33.4373, lng: -112.0078 },
  { iata: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', lat: 29.9902, lng: -95.3368 },
  { iata: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', lat: 40.6895, lng: -74.1745 },
  { iata: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'United States', lat: 44.8848, lng: -93.2223 },
  { iata: 'DTW', name: 'Detroit Metropolitan Airport', city: 'Detroit', country: 'United States', lat: 42.2162, lng: -83.3554 },
  { iata: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'United States', lat: 39.8744, lng: -75.2424 },
  { iata: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States', lat: 32.7338, lng: -117.1933 },
  { iata: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington D.C.', country: 'United States', lat: 38.8512, lng: -77.0402 },
  { iata: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington D.C.', country: 'United States', lat: 38.9531, lng: -77.4565 },
  { iata: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'United States', lat: 21.3187, lng: -157.9225 },
  
  // United Kingdom
  { iata: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543 },
  { iata: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', lat: 51.1537, lng: -0.1821 },
  { iata: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom', lat: 51.8860, lng: 0.2389 },
  { iata: 'LTN', name: 'Luton Airport', city: 'London', country: 'United Kingdom', lat: 51.8747, lng: -0.3683 },
  { iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', lat: 53.3537, lng: -2.2750 },
  { iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', lat: 55.9508, lng: -3.3615 },
  { iata: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom', lat: 52.4539, lng: -1.7480 },
  { iata: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'United Kingdom', lat: 55.8642, lng: -4.4331 },
  { iata: 'BRS', name: 'Bristol Airport', city: 'Bristol', country: 'United Kingdom', lat: 51.3827, lng: -2.7190 },
  
  // Ireland
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', lat: 53.4264, lng: -6.2499 },
  { iata: 'SNN', name: 'Shannon Airport', city: 'Shannon', country: 'Ireland', lat: 52.7019, lng: -8.9248 },
  { iata: 'ORK', name: 'Cork Airport', city: 'Cork', country: 'Ireland', lat: 51.8413, lng: -8.4911 },
  
  // France
  { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  { iata: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France', lat: 48.7262, lng: 2.3652 },
  { iata: 'NCE', name: 'Nice Côte d\'Azur Airport', city: 'Nice', country: 'France', lat: 43.6584, lng: 7.2159 },
  { iata: 'LYS', name: 'Lyon-Saint Exupéry Airport', city: 'Lyon', country: 'France', lat: 45.7256, lng: 5.0811 },
  { iata: 'MRS', name: 'Marseille Provence Airport', city: 'Marseille', country: 'France', lat: 43.4393, lng: 5.2214 },
  { iata: 'TLS', name: 'Toulouse-Blagnac Airport', city: 'Toulouse', country: 'France', lat: 43.6293, lng: 1.3638 },
  
  // Germany
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622 },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3537, lng: 11.7750 },
  { iata: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', lat: 52.3667, lng: 13.5033 },
  { iata: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf', country: 'Germany', lat: 51.2895, lng: 6.7668 },
  { iata: 'HAM', name: 'Hamburg Airport', city: 'Hamburg', country: 'Germany', lat: 53.6304, lng: 9.9882 },
  { iata: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany', lat: 50.8659, lng: 7.1427 },
  { iata: 'STR', name: 'Stuttgart Airport', city: 'Stuttgart', country: 'Germany', lat: 48.6899, lng: 9.2220 },
  
  // Spain
  { iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', lat: 40.4983, lng: -3.5676 },
  { iata: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', lat: 41.2971, lng: 2.0785 },
  { iata: 'PMI', name: 'Palma de Mallorca Airport', city: 'Palma de Mallorca', country: 'Spain', lat: 39.5517, lng: 2.7388 },
  { iata: 'AGP', name: 'Málaga Airport', city: 'Málaga', country: 'Spain', lat: 36.6749, lng: -4.4991 },
  { iata: 'ALC', name: 'Alicante–Elche Airport', city: 'Alicante', country: 'Spain', lat: 38.2822, lng: -0.5582 },
  { iata: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', country: 'Spain', lat: 38.8729, lng: 1.3731 },
  { iata: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain', lat: 39.4893, lng: -0.4816 },
  { iata: 'TFS', name: 'Tenerife South Airport', city: 'Tenerife', country: 'Spain', lat: 28.0445, lng: -16.5725 },
  
  // Italy
  { iata: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389 },
  { iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', lat: 45.6306, lng: 8.7281 },
  { iata: 'LIN', name: 'Milan Linate Airport', city: 'Milan', country: 'Italy', lat: 45.4494, lng: 9.2783 },
  { iata: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy', lat: 45.5053, lng: 12.3519 },
  { iata: 'NAP', name: 'Naples International Airport', city: 'Naples', country: 'Italy', lat: 40.8860, lng: 14.2908 },
  { iata: 'FLR', name: 'Florence Airport', city: 'Florence', country: 'Italy', lat: 43.8100, lng: 11.2051 },
  { iata: 'BGY', name: 'Milan Bergamo Airport', city: 'Bergamo', country: 'Italy', lat: 45.6739, lng: 9.7042 },
  
  // Netherlands
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
  { iata: 'RTM', name: 'Rotterdam The Hague Airport', city: 'Rotterdam', country: 'Netherlands', lat: 51.9569, lng: 4.4372 },
  { iata: 'EIN', name: 'Eindhoven Airport', city: 'Eindhoven', country: 'Netherlands', lat: 51.4500, lng: 5.3747 },
  
  // Belgium
  { iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', lat: 50.9010, lng: 4.4844 },
  { iata: 'CRL', name: 'Brussels South Charleroi Airport', city: 'Charleroi', country: 'Belgium', lat: 50.4592, lng: 4.4538 },
  
  // Switzerland
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lng: 8.5492 },
  { iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', lat: 46.2381, lng: 6.1090 },
  { iata: 'BSL', name: 'EuroAirport Basel Mulhouse Freiburg', city: 'Basel', country: 'Switzerland', lat: 47.5896, lng: 7.5299 },
  
  // Austria
  { iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', lat: 48.1103, lng: 16.5697 },
  { iata: 'SZG', name: 'Salzburg Airport', city: 'Salzburg', country: 'Austria', lat: 47.7933, lng: 13.0043 },
  { iata: 'INN', name: 'Innsbruck Airport', city: 'Innsbruck', country: 'Austria', lat: 47.2602, lng: 11.3439 },
  
  // Portugal
  { iata: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'Portugal', lat: 38.7742, lng: -9.1342 },
  { iata: 'OPO', name: 'Porto Airport', city: 'Porto', country: 'Portugal', lat: 41.2481, lng: -8.6814 },
  { iata: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal', lat: 37.0144, lng: -7.9659 },
  
  // Greece
  { iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9445 },
  { iata: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece', lat: 40.5197, lng: 22.9709 },
  { iata: 'HER', name: 'Heraklion International Airport', city: 'Heraklion', country: 'Greece', lat: 35.3397, lng: 25.1803 },
  { iata: 'JMK', name: 'Mykonos Island National Airport', city: 'Mykonos', country: 'Greece', lat: 37.4351, lng: 25.3481 },
  { iata: 'JTR', name: 'Santorini Airport', city: 'Santorini', country: 'Greece', lat: 36.3992, lng: 25.4793 },
  
  // Scandinavia
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', lat: 55.6180, lng: 12.6508 },
  { iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', lat: 59.6498, lng: 17.9238 },
  { iata: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', lat: 60.1939, lng: 11.1004 },
  { iata: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', lat: 60.3172, lng: 24.9633 },
  { iata: 'GOT', name: 'Göteborg Landvetter Airport', city: 'Gothenburg', country: 'Sweden', lat: 57.6628, lng: 12.2798 },
  { iata: 'BGO', name: 'Bergen Airport Flesland', city: 'Bergen', country: 'Norway', lat: 60.2934, lng: 5.2181 },
  { iata: 'KEF', name: 'Keflavík International Airport', city: 'Reykjavik', country: 'Iceland', lat: 63.9850, lng: -22.6056 },
  
  // Eastern Europe
  { iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', lat: 52.1657, lng: 20.9671 },
  { iata: 'KRK', name: 'Kraków John Paul II International Airport', city: 'Kraków', country: 'Poland', lat: 50.0777, lng: 19.7848 },
  { iata: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', lat: 50.1008, lng: 14.2600 },
  { iata: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary', lat: 47.4369, lng: 19.2556 },
  { iata: 'OTP', name: 'Henri Coandă International Airport', city: 'Bucharest', country: 'Romania', lat: 44.5711, lng: 26.0850 },
  { iata: 'SOF', name: 'Sofia Airport', city: 'Sofia', country: 'Bulgaria', lat: 42.6952, lng: 23.4063 },
  
  // Turkey
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519 },
  { iata: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Turkey', lat: 40.8986, lng: 29.3092 },
  { iata: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey', lat: 36.8987, lng: 30.8005 },
  { iata: 'ADB', name: 'Izmir Adnan Menderes Airport', city: 'Izmir', country: 'Turkey', lat: 38.2924, lng: 27.1570 },
  
  // Middle East
  { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lng: 55.3657 },
  { iata: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4330, lng: 54.6511 },
  { iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2609, lng: 51.6138 },
  { iata: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', lat: 32.0055, lng: 34.8854 },
  { iata: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan', lat: 31.7226, lng: 35.9932 },
  { iata: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lng: 46.6988 },
  { iata: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', lat: 21.6796, lng: 39.1565 },
  { iata: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', lat: 26.2708, lng: 50.6336 },
  { iata: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', lat: 23.5933, lng: 58.2844 },
  { iata: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', lat: 29.2266, lng: 47.9689 },
  
  // Asia - China
  { iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0799, lng: 116.6031 },
  { iata: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China', lat: 39.5098, lng: 116.4105 },
  { iata: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083 },
  { iata: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China', lat: 31.1979, lng: 121.3363 },
  { iata: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', lat: 23.3924, lng: 113.2988 },
  { iata: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', country: 'China', lat: 22.6393, lng: 113.8107 },
  { iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185 },
  { iata: 'CTU', name: 'Chengdu Tianfu International Airport', city: 'Chengdu', country: 'China', lat: 30.3106, lng: 104.4419 },
  { iata: 'CKG', name: 'Chongqing Jiangbei International Airport', city: 'Chongqing', country: 'China', lat: 29.7192, lng: 106.6417 },
  { iata: 'XIY', name: 'Xi\'an Xianyang International Airport', city: 'Xi\'an', country: 'China', lat: 34.4471, lng: 108.7516 },
  
  // Asia - Japan
  { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929 },
  { iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798 },
  { iata: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', lat: 34.4347, lng: 135.2441 },
  { iata: 'ITM', name: 'Osaka Itami Airport', city: 'Osaka', country: 'Japan', lat: 34.7855, lng: 135.4380 },
  { iata: 'NGO', name: 'Chubu Centrair International Airport', city: 'Nagoya', country: 'Japan', lat: 34.8584, lng: 136.8125 },
  { iata: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan', lat: 33.5903, lng: 130.4514 },
  { iata: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', country: 'Japan', lat: 42.7752, lng: 141.6924 },
  { iata: 'OKA', name: 'Naha Airport', city: 'Okinawa', country: 'Japan', lat: 26.1958, lng: 127.6459 },
  
  // Asia - South Korea
  { iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
  { iata: 'GMP', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea', lat: 37.5583, lng: 126.7906 },
  { iata: 'PUS', name: 'Gimhae International Airport', city: 'Busan', country: 'South Korea', lat: 35.1795, lng: 128.9383 },
  { iata: 'CJU', name: 'Jeju International Airport', city: 'Jeju', country: 'South Korea', lat: 33.5113, lng: 126.4929 },
  
  // Asia - Southeast Asia
  { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
  { iata: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', lat: 13.9126, lng: 100.6068 },
  { iata: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', lat: 8.1132, lng: 98.3169 },
  { iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7099 },
  { iata: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', lat: -6.1256, lng: 106.6559 },
  { iata: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', lat: -8.7482, lng: 115.1670 },
  { iata: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0198 },
  { iata: 'CEB', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines', lat: 10.3076, lng: 123.9790 },
  { iata: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8188, lng: 106.6520 },
  { iata: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', lat: 21.2212, lng: 105.8070 },
  { iata: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam', lat: 16.0439, lng: 108.1992 },
  
  // Asia - South Asia
  { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', lat: 28.5562, lng: 77.1000 },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656 },
  { iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', lat: 13.1986, lng: 77.7066 },
  { iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9941, lng: 80.1709 },
  { iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294 },
  { iata: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', lat: 22.6520, lng: 88.4463 },
  { iata: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', lat: 10.1520, lng: 76.4019 },
  { iata: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', lat: 7.1808, lng: 79.8841 },
  { iata: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', lat: 23.8433, lng: 90.3978 },
  { iata: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', lat: 27.6966, lng: 85.3591 },
  { iata: 'MLE', name: 'Velana International Airport', city: 'Malé', country: 'Maldives', lat: 4.1918, lng: 73.5290 },
  
  // Taiwan
  { iata: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lng: 121.2342 },
  { iata: 'TSA', name: 'Taipei Songshan Airport', city: 'Taipei', country: 'Taiwan', lat: 25.0694, lng: 121.5521 },
  { iata: 'KHH', name: 'Kaohsiung International Airport', city: 'Kaohsiung', country: 'Taiwan', lat: 22.5771, lng: 120.3500 },
  
  // Oceania
  { iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6690, lng: 144.8410 },
  { iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', lat: -27.3942, lng: 153.1218 },
  { iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', lat: -31.9385, lng: 115.9672 },
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lng: 174.7850 },
  { iata: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand', lat: -41.3272, lng: 174.8053 },
  { iata: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', lat: -43.4894, lng: 172.5324 },
  { iata: 'ZQN', name: 'Queenstown Airport', city: 'Queenstown', country: 'New Zealand', lat: -45.0211, lng: 168.7392 },
  { iata: 'NAN', name: 'Nadi International Airport', city: 'Nadi', country: 'Fiji', lat: -17.7554, lng: 177.4436 },
  
  // Africa
  { iata: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lng: 28.2460 },
  { iata: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', lat: -33.9715, lng: 18.6021 },
  { iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056 },
  { iata: 'HRG', name: 'Hurghada International Airport', city: 'Hurghada', country: 'Egypt', lat: 27.1783, lng: 33.7994 },
  { iata: 'SSH', name: 'Sharm El Sheikh International Airport', city: 'Sharm El Sheikh', country: 'Egypt', lat: 27.9773, lng: 34.3950 },
  { iata: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', lat: 33.3675, lng: -7.5898 },
  { iata: 'RAK', name: 'Marrakech Menara Airport', city: 'Marrakech', country: 'Morocco', lat: 31.6069, lng: -8.0363 },
  { iata: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia', lat: 36.8510, lng: 10.2272 },
  { iata: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lng: 36.9258 },
  { iata: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', lat: 8.9779, lng: 38.7993 },
  { iata: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', lat: 6.5774, lng: 3.3212 },
  { iata: 'MRU', name: 'Sir Seewoosagur Ramgoolam International Airport', city: 'Mauritius', country: 'Mauritius', lat: -20.4302, lng: 57.6836 },
  { iata: 'TNR', name: 'Ivato International Airport', city: 'Antananarivo', country: 'Madagascar', lat: -18.7969, lng: 47.4788 },
  { iata: 'DSS', name: 'Blaise Diagne International Airport', city: 'Dakar', country: 'Senegal', lat: 14.6714, lng: -17.0728 },
  
  // Central & South America
  { iata: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721 },
  { iata: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', lat: 21.0365, lng: -86.8771 },
  { iata: 'GDL', name: 'Miguel Hidalgo y Costilla International Airport', city: 'Guadalajara', country: 'Mexico', lat: 20.5218, lng: -103.3111 },
  { iata: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
  { iata: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8100, lng: -43.2505 },
  { iata: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil', lat: -15.8711, lng: -47.9186 },
  { iata: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lng: -58.5358 },
  { iata: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', lat: -34.5592, lng: -58.4156 },
  { iata: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', lat: -33.3930, lng: -70.7858 },
  { iata: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', lat: -12.0219, lng: -77.1143 },
  { iata: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469 },
  { iata: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', lat: 9.0714, lng: -79.3835 },
  { iata: 'SJO', name: 'Juan Santamaría International Airport', city: 'San José', country: 'Costa Rica', lat: 9.9939, lng: -84.2088 },
  { iata: 'HAV', name: 'José Martí International Airport', city: 'Havana', country: 'Cuba', lat: 22.9892, lng: -82.4091 },
  { iata: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador', lat: -0.1292, lng: -78.3575 },
  { iata: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela', lat: 10.6012, lng: -66.9913 },
  
  // Caribbean
  { iata: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', country: 'Jamaica', lat: 18.5037, lng: -77.9134 },
  { iata: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', country: 'Bahamas', lat: 25.0390, lng: -77.4662 },
  { iata: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana', country: 'Dominican Republic', lat: 18.5674, lng: -68.3634 },
  { iata: 'SDQ', name: 'Las Américas International Airport', city: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4297, lng: -69.6689 },
  { iata: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', country: 'Puerto Rico', lat: 18.4394, lng: -66.0018 },
  { iata: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad', country: 'Aruba', lat: 12.5014, lng: -70.0152 },
  { iata: 'CUR', name: 'Curaçao International Airport', city: 'Willemstad', country: 'Curaçao', lat: 12.1889, lng: -68.9600 },
  { iata: 'SXM', name: 'Princess Juliana International Airport', city: 'Philipsburg', country: 'Sint Maarten', lat: 18.0410, lng: -63.1089 },
  { iata: 'BGI', name: 'Grantley Adams International Airport', city: 'Bridgetown', country: 'Barbados', lat: 13.0746, lng: -59.4925 },
  
  // Canada
  { iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248 },
  { iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815 },
  { iata: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', lat: 45.4706, lng: -73.7408 },
  { iata: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada', lat: 51.1315, lng: -114.0106 },
  { iata: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', country: 'Canada', lat: 45.3225, lng: -75.6692 },
  { iata: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton', country: 'Canada', lat: 53.3097, lng: -113.5800 },
  { iata: 'YHZ', name: 'Halifax Stanfield International Airport', city: 'Halifax', country: 'Canada', lat: 44.8808, lng: -63.5086 },
]

/**
 * Search airports by query string
 * Matches against IATA code, airport name, city, and country
 * @param query - Search query (min 2 characters)
 * @returns Array of matching airports, sorted by relevance
 */
export async function searchAirports(query: string): Promise<Airport[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!query || query.length < 2) {
    return []
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  // Score-based matching for better relevance
  const scored = AIRPORTS.map(airport => {
    let score = 0
    const iataLower = airport.iata.toLowerCase()
    const nameLower = airport.name.toLowerCase()
    const cityLower = airport.city.toLowerCase()
    const countryLower = airport.country.toLowerCase()
    
    // Exact IATA code match (highest priority)
    if (iataLower === normalizedQuery) {
      score = 100
    }
    // IATA starts with query
    else if (iataLower.startsWith(normalizedQuery)) {
      score = 80
    }
    // City exact match
    else if (cityLower === normalizedQuery) {
      score = 70
    }
    // City starts with query
    else if (cityLower.startsWith(normalizedQuery)) {
      score = 60
    }
    // Airport name starts with query
    else if (nameLower.startsWith(normalizedQuery)) {
      score = 50
    }
    // Any word in city/name starts with query
    else if (
      cityLower.split(' ').some(word => word.startsWith(normalizedQuery)) ||
      nameLower.split(' ').some(word => word.startsWith(normalizedQuery))
    ) {
      score = 40
    }
    // Country match
    else if (countryLower.startsWith(normalizedQuery)) {
      score = 30
    }
    // Contains query anywhere
    else if (
      iataLower.includes(normalizedQuery) ||
      cityLower.includes(normalizedQuery) ||
      nameLower.includes(normalizedQuery)
    ) {
      score = 20
    }
    
    return { airport, score }
  })
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.airport)
}

/**
 * Get airport by IATA code
 */
export function getAirportByCode(iata: string): Airport | undefined {
  return AIRPORTS.find(a => a.iata.toUpperCase() === iata.toUpperCase())
}

/**
 * Format airport for display
 * @returns "City (IATA)" e.g. "London (LHR)"
 */
export function formatAirport(airport: Airport): string {
  return `${airport.city} (${airport.iata})`
}

/**
 * Format airport with full details
 * @returns "City (IATA) - Airport Name" 
 */
export function formatAirportFull(airport: Airport): string {
  return `${airport.city} (${airport.iata}) - ${airport.name}`
}
