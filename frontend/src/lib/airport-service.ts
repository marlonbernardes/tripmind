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
}

// Top 200+ major world airports
// Source: Compiled from public aviation data
const AIRPORTS: Airport[] = [
  // United States
  { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States' },
  { iata: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States' },
  { iata: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States' },
  { iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { iata: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
  { iata: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States' },
  { iata: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States' },
  { iata: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  { iata: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
  { iata: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States' },
  { iata: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States' },
  { iata: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States' },
  { iata: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'United States' },
  { iata: 'DTW', name: 'Detroit Metropolitan Airport', city: 'Detroit', country: 'United States' },
  { iata: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'United States' },
  { iata: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States' },
  { iata: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington D.C.', country: 'United States' },
  { iata: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington D.C.', country: 'United States' },
  { iata: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'United States' },
  
  // United Kingdom
  { iata: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'LTN', name: 'Luton Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
  { iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom' },
  { iata: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom' },
  { iata: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'United Kingdom' },
  { iata: 'BRS', name: 'Bristol Airport', city: 'Bristol', country: 'United Kingdom' },
  
  // Ireland
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { iata: 'SNN', name: 'Shannon Airport', city: 'Shannon', country: 'Ireland' },
  { iata: 'ORK', name: 'Cork Airport', city: 'Cork', country: 'Ireland' },
  
  // France
  { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { iata: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { iata: 'NCE', name: 'Nice Côte d\'Azur Airport', city: 'Nice', country: 'France' },
  { iata: 'LYS', name: 'Lyon-Saint Exupéry Airport', city: 'Lyon', country: 'France' },
  { iata: 'MRS', name: 'Marseille Provence Airport', city: 'Marseille', country: 'France' },
  { iata: 'TLS', name: 'Toulouse-Blagnac Airport', city: 'Toulouse', country: 'France' },
  
  // Germany
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { iata: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
  { iata: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf', country: 'Germany' },
  { iata: 'HAM', name: 'Hamburg Airport', city: 'Hamburg', country: 'Germany' },
  { iata: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany' },
  { iata: 'STR', name: 'Stuttgart Airport', city: 'Stuttgart', country: 'Germany' },
  
  // Spain
  { iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain' },
  { iata: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { iata: 'PMI', name: 'Palma de Mallorca Airport', city: 'Palma de Mallorca', country: 'Spain' },
  { iata: 'AGP', name: 'Málaga Airport', city: 'Málaga', country: 'Spain' },
  { iata: 'ALC', name: 'Alicante–Elche Airport', city: 'Alicante', country: 'Spain' },
  { iata: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', country: 'Spain' },
  { iata: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain' },
  { iata: 'TFS', name: 'Tenerife South Airport', city: 'Tenerife', country: 'Spain' },
  
  // Italy
  { iata: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy' },
  { iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { iata: 'LIN', name: 'Milan Linate Airport', city: 'Milan', country: 'Italy' },
  { iata: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy' },
  { iata: 'NAP', name: 'Naples International Airport', city: 'Naples', country: 'Italy' },
  { iata: 'FLR', name: 'Florence Airport', city: 'Florence', country: 'Italy' },
  { iata: 'BGY', name: 'Milan Bergamo Airport', city: 'Bergamo', country: 'Italy' },
  
  // Netherlands
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'RTM', name: 'Rotterdam The Hague Airport', city: 'Rotterdam', country: 'Netherlands' },
  { iata: 'EIN', name: 'Eindhoven Airport', city: 'Eindhoven', country: 'Netherlands' },
  
  // Belgium
  { iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { iata: 'CRL', name: 'Brussels South Charleroi Airport', city: 'Charleroi', country: 'Belgium' },
  
  // Switzerland
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
  { iata: 'BSL', name: 'EuroAirport Basel Mulhouse Freiburg', city: 'Basel', country: 'Switzerland' },
  
  // Austria
  { iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { iata: 'SZG', name: 'Salzburg Airport', city: 'Salzburg', country: 'Austria' },
  { iata: 'INN', name: 'Innsbruck Airport', city: 'Innsbruck', country: 'Austria' },
  
  // Portugal
  { iata: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'Portugal' },
  { iata: 'OPO', name: 'Porto Airport', city: 'Porto', country: 'Portugal' },
  { iata: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal' },
  
  // Greece
  { iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  { iata: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece' },
  { iata: 'HER', name: 'Heraklion International Airport', city: 'Heraklion', country: 'Greece' },
  { iata: 'JMK', name: 'Mykonos Island National Airport', city: 'Mykonos', country: 'Greece' },
  { iata: 'JTR', name: 'Santorini Airport', city: 'Santorini', country: 'Greece' },
  
  // Scandinavia
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  { iata: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway' },
  { iata: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland' },
  { iata: 'GOT', name: 'Göteborg Landvetter Airport', city: 'Gothenburg', country: 'Sweden' },
  { iata: 'BGO', name: 'Bergen Airport Flesland', city: 'Bergen', country: 'Norway' },
  { iata: 'KEF', name: 'Keflavík International Airport', city: 'Reykjavik', country: 'Iceland' },
  
  // Eastern Europe
  { iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { iata: 'KRK', name: 'Kraków John Paul II International Airport', city: 'Kraków', country: 'Poland' },
  { iata: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic' },
  { iata: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary' },
  { iata: 'OTP', name: 'Henri Coandă International Airport', city: 'Bucharest', country: 'Romania' },
  { iata: 'SOF', name: 'Sofia Airport', city: 'Sofia', country: 'Bulgaria' },
  
  // Turkey
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { iata: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Turkey' },
  { iata: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey' },
  { iata: 'ADB', name: 'Izmir Adnan Menderes Airport', city: 'Izmir', country: 'Turkey' },
  
  // Middle East
  { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { iata: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  { iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { iata: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel' },
  { iata: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan' },
  { iata: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  { iata: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { iata: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain' },
  { iata: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman' },
  { iata: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait' },
  
  // Asia - China
  { iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  { iata: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China' },
  { iata: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  { iata: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China' },
  { iata: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China' },
  { iata: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', country: 'China' },
  { iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
  { iata: 'CTU', name: 'Chengdu Tianfu International Airport', city: 'Chengdu', country: 'China' },
  { iata: 'CKG', name: 'Chongqing Jiangbei International Airport', city: 'Chongqing', country: 'China' },
  { iata: 'XIY', name: 'Xi\'an Xianyang International Airport', city: 'Xi\'an', country: 'China' },
  
  // Asia - Japan
  { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan' },
  { iata: 'ITM', name: 'Osaka Itami Airport', city: 'Osaka', country: 'Japan' },
  { iata: 'NGO', name: 'Chubu Centrair International Airport', city: 'Nagoya', country: 'Japan' },
  { iata: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan' },
  { iata: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', country: 'Japan' },
  { iata: 'OKA', name: 'Naha Airport', city: 'Okinawa', country: 'Japan' },
  
  // Asia - South Korea
  { iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { iata: 'GMP', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea' },
  { iata: 'PUS', name: 'Gimhae International Airport', city: 'Busan', country: 'South Korea' },
  { iata: 'CJU', name: 'Jeju International Airport', city: 'Jeju', country: 'South Korea' },
  
  // Asia - Southeast Asia
  { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand' },
  { iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { iata: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  { iata: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia' },
  { iata: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
  { iata: 'CEB', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines' },
  { iata: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { iata: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
  { iata: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam' },
  
  // Asia - South Asia
  { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  { iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { iata: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
  { iata: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India' },
  { iata: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka' },
  { iata: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh' },
  { iata: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal' },
  { iata: 'MLE', name: 'Velana International Airport', city: 'Malé', country: 'Maldives' },
  
  // Taiwan
  { iata: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },
  { iata: 'TSA', name: 'Taipei Songshan Airport', city: 'Taipei', country: 'Taiwan' },
  { iata: 'KHH', name: 'Kaohsiung International Airport', city: 'Kaohsiung', country: 'Taiwan' },
  
  // Oceania
  { iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  { iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  { iata: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand' },
  { iata: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },
  { iata: 'ZQN', name: 'Queenstown Airport', city: 'Queenstown', country: 'New Zealand' },
  { iata: 'NAN', name: 'Nadi International Airport', city: 'Nadi', country: 'Fiji' },
  
  // Africa
  { iata: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { iata: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { iata: 'HRG', name: 'Hurghada International Airport', city: 'Hurghada', country: 'Egypt' },
  { iata: 'SSH', name: 'Sharm El Sheikh International Airport', city: 'Sharm El Sheikh', country: 'Egypt' },
  { iata: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
  { iata: 'RAK', name: 'Marrakech Menara Airport', city: 'Marrakech', country: 'Morocco' },
  { iata: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia' },
  { iata: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  { iata: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  { iata: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  { iata: 'MRU', name: 'Sir Seewoosagur Ramgoolam International Airport', city: 'Mauritius', country: 'Mauritius' },
  { iata: 'TNR', name: 'Ivato International Airport', city: 'Antananarivo', country: 'Madagascar' },
  { iata: 'DSS', name: 'Blaise Diagne International Airport', city: 'Dakar', country: 'Senegal' },
  
  // Central & South America
  { iata: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
  { iata: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico' },
  { iata: 'GDL', name: 'Miguel Hidalgo y Costilla International Airport', city: 'Guadalajara', country: 'Mexico' },
  { iata: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  { iata: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
  { iata: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil' },
  { iata: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
  { iata: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
  { iata: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  { iata: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama' },
  { iata: 'SJO', name: 'Juan Santamaría International Airport', city: 'San José', country: 'Costa Rica' },
  { iata: 'HAV', name: 'José Martí International Airport', city: 'Havana', country: 'Cuba' },
  { iata: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador' },
  { iata: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela' },
  
  // Caribbean
  { iata: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', country: 'Jamaica' },
  { iata: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', country: 'Bahamas' },
  { iata: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana', country: 'Dominican Republic' },
  { iata: 'SDQ', name: 'Las Américas International Airport', city: 'Santo Domingo', country: 'Dominican Republic' },
  { iata: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', country: 'Puerto Rico' },
  { iata: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad', country: 'Aruba' },
  { iata: 'CUR', name: 'Curaçao International Airport', city: 'Willemstad', country: 'Curaçao' },
  { iata: 'SXM', name: 'Princess Juliana International Airport', city: 'Philipsburg', country: 'Sint Maarten' },
  { iata: 'BGI', name: 'Grantley Adams International Airport', city: 'Bridgetown', country: 'Barbados' },
  
  // Canada
  { iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  { iata: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada' },
  { iata: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada' },
  { iata: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', country: 'Canada' },
  { iata: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton', country: 'Canada' },
  { iata: 'YHZ', name: 'Halifax Stanfield International Airport', city: 'Halifax', country: 'Canada' },
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
