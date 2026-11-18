import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { reviewerProfiles, reviewSeeds } from './reviewSeeds.js';

export const richPackages = [
  // --- BEACH & ISLANDS ---
  {
    title: 'Bali Tropical Paradise & Ubud Culture',
    slug: 'bali-tropical-paradise-and-ubud-culture',
    destination: 'Bali, Indonesia',
    description: 'Immerse in pristine sandy beaches, sacred temples in Ubud, lush emerald rice terraces, and cliffside sunsets in Uluwatu.',
    price: 64999,
    durationDays: 7,
    startDate: new Date(Date.now() + 25 * 86400000),
    totalSeats: 20,
    availableSeats: 14,
    category: 'beach',
    avgRating: 4.9,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Denpasar', details: 'VIP airport transfer to 5-star beachfront resort in Seminyak.' },
      { day: 2, title: 'Ubud Sacred Forests & Terraces', details: 'Private tour of Monkey Forest and Tegallalang rice paddies.' },
      { day: 3, title: 'Mount Batur Sunrise Trek', details: 'Guided sunrise hike with champagne breakfast overlooking Lake Batur.' },
      { day: 4, title: 'Nusa Penida Speedboat Cruise', details: 'Kelingking beach lookout, snorkeling with manta rays at Crystal Bay.' },
      { day: 5, title: 'Tibumana Waterfalls & Spa', details: 'Private jungle waterfall swim and 90-min traditional Balinese massage.' },
      { day: 6, title: 'Uluwatu Sunset & Kecak Fire Dance', details: 'Perched cliffside temple tour followed by beach seafood dinner in Jimbaran.' },
      { day: 7, title: 'Leisure & Departure', details: 'Souvenir boutique shopping and private transfer to airport.' },
    ],
    inclusions: ['5-star beachfront & pool villa stays', 'All daily gourmet breakfasts & 3 dinners', 'Private AC vehicle & English speaking guide', 'All speedboat & activity passes'],
    exclusions: ['International flights', 'Personal shopping expenses', 'Visa fees'],
    cancellationPolicy: '100% refund up to 72 hours before start date.',
    pickupLocation: 'Ngurah Rai International Airport (DPS)',
  },
  {
    title: 'Maldives Luxury Overwater Villa Retreat',
    slug: 'maldives-luxury-overwater-villa-retreat',
    destination: 'Male & Baa Atoll, Maldives',
    description: 'Ultimate ultra-luxury escape featuring turquoise lagoon villas, private glass-bottom decks, and world-class marine biology tours.',
    price: 149999,
    durationDays: 5,
    startDate: new Date(Date.now() + 15 * 86400000),
    totalSeats: 12,
    availableSeats: 4,
    category: 'beach',
    avgRating: 5.0,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Seaplane Arrival in Baa Atoll', details: 'Scenic seaplane transfer to private island resort and welcome champagne.' },
      { day: 2, title: 'Hanifaru Bay Coral Snorkeling', details: 'Guided marine biology tour with manta rays and whale sharks.' },
      { day: 3, title: 'Private Sandbank Picnic', details: 'Private speedboat trip to a secluded sandbank with chef-prepared lunch.' },
      { day: 4, title: 'Underwater Dining Experience', details: 'Subaquatic restaurant dining 5 meters below sea level.' },
      { day: 5, title: 'Sunset Cruise & Departure', details: 'Dolphin watching cruise before departure transfer.' },
    ],
    inclusions: ['Overwater bungalow with plunge pool', 'All-inclusive dining and premium beverages', 'Roundtrip scenic seaplane transfers', 'Complimentary watersports'],
    exclusions: ['Spa treatments', 'Motorized watersports'],
    cancellationPolicy: 'Full refund up to 7 days before check-in.',
    pickupLocation: 'Velana International Airport (MLE)',
  },
  {
    title: 'Santorini Sunset & Aegean Island Odyssey',
    slug: 'santorini-sunset-and-aegean-island-odyssey',
    destination: 'Santorini & Mykonos, Greece',
    description: 'Iconic whitewashed cliffside villages, caldera views, volcanic wine tasting, and luxury catamaran cruising.',
    price: 119999,
    durationDays: 6,
    startDate: new Date(Date.now() + 35 * 86400000),
    totalSeats: 16,
    availableSeats: 9,
    category: 'beach',
    avgRating: 4.8,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Fira, Santorini', details: 'Check-in to cave hotel overlooking the volcanic caldera.' },
      { day: 2, title: 'Oia Village & Sunset Catamaran', details: 'Walking tour of blue domed churches and sunset catamaran sail.' },
      { day: 3, title: 'Assyrtiko Wine Tasting Tour', details: 'Visit ancient vineyards and sample traditional Greek wines.' },
      { day: 4, title: 'High-speed Ferry to Mykonos', details: 'Arrive in Mykonos, stroll Little Venice and Windmills.' },
      { day: 5, title: 'Delos Island Ancient Ruins', details: 'Boat excursion to UNESCO birthplace of Apollo.' },
      { day: 6, title: 'Departure', details: 'Morning stroll and transfer to Mykonos Airport.' },
    ],
    inclusions: ['Boutique cave hotel stays', 'Daily Greek breakfast', 'High-speed inter-island ferry tickets', 'Caldera sunset cruise with dinner'],
    exclusions: ['City tourism tax', 'Personal souvenirs'],
    cancellationPolicy: 'Refundable up to 5 days prior to arrival.',
    pickupLocation: 'Santorini Thira Airport (JTR)',
  },
  {
    title: 'Goa Coastal Serenity & Heritage Villas',
    slug: 'goa-coastal-serenity-and-heritage-villas',
    destination: 'South Goa, India',
    description: 'Quiet white sands of Palolem and Cavelossim, Portuguese heritage mansions, spice plantations, and backwater yacht cruise.',
    price: 34999,
    durationDays: 5,
    startDate: new Date(Date.now() + 10 * 86400000),
    totalSeats: 25,
    availableSeats: 18,
    category: 'beach',
    avgRating: 4.7,
    reviewCount: 54,
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in South Goa', details: 'Check-in to luxury beachfront resort and sunset cocktail hour.' },
      { day: 2, title: 'Heritage Fontainhas & Latin Quarter', details: 'Guided heritage walk through Portuguese colonial architecture.' },
      { day: 3, title: 'Spice Plantation & Authentic Goan Feast', details: 'Spice plantation tour, elephant interaction, and traditional buffet.' },
      { day: 4, title: 'Mandovi Luxury Yacht Cruise', details: 'Private catamaran cruise with dolphin spotting and DJ.' },
      { day: 5, title: 'Flea Market & Departure', details: 'Anjuna market shopping and drop to Mopa/Dabolim airport.' },
    ],
    inclusions: ['5-star beachfront resort', 'Breakfast & Goan buffet lunch', 'Private AC vehicle for all transfers', 'Luxury catamaran cruise'],
    exclusions: ['Flight tickets', 'Water sports insurance'],
    cancellationPolicy: 'Free cancellation up to 48 hours before start date.',
    pickupLocation: 'Goa Dabolim Airport (GOI) / Mopa Airport (GOX)',
  },

  // --- MOUNTAIN & ALPINE ---
  {
    title: 'Swiss Alps Hiking & Glacier Express',
    slug: 'swiss-alps-hiking-and-glacier-express',
    destination: 'Interlaken & Zermatt, Switzerland',
    description: 'Alpine majesty featuring the iconic Matterhorn, cogwheel train ascents to Jungfraujoch, and crystalline glacial lakes.',
    price: 184999,
    durationDays: 6,
    startDate: new Date(Date.now() + 40 * 86400000),
    totalSeats: 15,
    availableSeats: 5,
    category: 'mountain',
    avgRating: 4.9,
    reviewCount: 33,
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Zurich / Transfer to Interlaken', details: 'First Class Swiss rail journey to Interlaken with alpine views.' },
      { day: 2, title: 'Jungfraujoch - Top of Europe', details: 'Ascend Europe highest railway station and explore Ice Palace.' },
      { day: 3, title: 'Lake Brienz & Giessbach Falls', details: 'Scenic steamer cruise and pine forest nature hike.' },
      { day: 4, title: 'Zermatt & Matterhorn Viewpoint', details: 'Car-free mountain village check-in with iconic Matterhorn vistas.' },
      { day: 5, title: 'Gornergrat Glacier Panorama', details: 'Cogwheel ascent for 360-degree views of 29 four-thousand-meter peaks.' },
      { day: 6, title: 'Departure via Geneva', details: 'Morning Swiss pastry breakfast and airport express transfer.' },
    ],
    inclusions: ['Swiss Rail Pass (First Class)', 'Alpine chalet boutique hotels', 'Jungfraujoch & Gornergrat excursion passes', 'Daily gourmet breakfast'],
    exclusions: ['Airfare', 'Ski equipment rentals'],
    cancellationPolicy: 'Full refund up to 7 days before departure.',
    pickupLocation: 'Zurich Central Railway Station (HB)',
  },
  {
    title: 'Manali & Solang Valley Snow Expedition',
    slug: 'manali-and-solang-valley-snow-expedition',
    destination: 'Himachal Pradesh, India',
    description: 'Snow-capped Himalayan vistas, Rohtang Pass adventure, pine forests of Old Manali, and cozy riverside wooden cabins.',
    price: 28999,
    durationDays: 5,
    startDate: new Date(Date.now() + 12 * 86400000),
    totalSeats: 30,
    availableSeats: 16,
    category: 'mountain',
    avgRating: 4.8,
    reviewCount: 71,
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Manali', details: 'Check-in to riverside cedar cabin and evening walk at Mall Road.' },
      { day: 2, title: 'Solang Valley Adventure', details: 'Paragliding, zorbing, and snow scooter rides at Solang.' },
      { day: 3, title: 'Atal Tunnel & Sissu Waterfall', details: 'Drive under Pir Panjal mountains to the surreal Lahaul valley.' },
      { day: 4, title: 'Old Manali Cafes & Hadimba Temple', details: 'Live music cafes, wooden architectural temples, and hot springs.' },
      { day: 5, title: 'Departure', details: 'Morning apple orchard walk and transfer to Bhuntar airport.' },
    ],
    inclusions: ['Riverside resort stay', 'Daily buffet breakfast & dinner', 'Private SUV for mountain passes', 'Snow activity guidance'],
    exclusions: ['Personal gear rentals', 'Optional paragliding video'],
    cancellationPolicy: '100% refund up to 48 hours before trip start.',
    pickupLocation: 'Kullu Manali Airport (KUU) / Volvo Bus Stand',
  },
  {
    title: 'Banff & Canadian Rockies Alpine Explorer',
    slug: 'banff-and-canadian-rockies-alpine-explorer',
    destination: 'Alberta, Canada',
    description: 'Turquoise waters of Lake Louise, Moraine Lake, Columbia Icefield skywalk, and wildlife spotting in Banff National Park.',
    price: 169999,
    durationDays: 7,
    startDate: new Date(Date.now() + 50 * 86400000),
    totalSeats: 14,
    availableSeats: 6,
    category: 'mountain',
    avgRating: 5.0,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Calgary / Drive to Banff', details: 'Scenic transfer along the Trans-Canada highway into Banff town.' },
      { day: 2, title: 'Banff Gondola & Upper Hot Springs', details: 'Panoramic Sulphur Mountain summit views and natural mineral baths.' },
      { day: 3, title: 'Lake Louise & Moraine Lake', details: 'Canoeing on glacial emerald waters and hiking the Plain of Six Glaciers.' },
      { day: 4, title: 'Icefields Parkway & Glacier Walk', details: 'Drive one of the world most beautiful highways and ride an Ice Explorer on Athabasca Glacier.' },
      { day: 5, title: 'Jasper National Park & Maligne Canyon', details: 'Deep limestone canyon exploration and boat cruise to Spirit Island.' },
      { day: 6, title: 'Yoho National Park & Emerald Lake', details: 'Natural bridge rock formations and quiet alpine trails.' },
      { day: 7, title: 'Calgary Departure', details: 'Scenic drive to Calgary International Airport.' },
    ],
    inclusions: ['4-star mountain lodge accommodation', 'Parks Canada National Park passes', 'Banff Gondola & Ice Explorer tickets', 'All private transfers'],
    exclusions: ['Airfare', 'Canoe rental fees'],
    cancellationPolicy: 'Full refund up to 7 days prior to start.',
    pickupLocation: 'Calgary International Airport (YYC)',
  },

  // --- ADVENTURE & SAFARI ---
  {
    title: 'Serengeti Great Migration & Ngorongoro Safari',
    slug: 'serengeti-great-migration-and-ngorongoro-safari',
    destination: 'Arusha & Serengeti, Tanzania',
    description: 'Witness the iconic Great Wildebeest Migration, the Big Five, luxury tented safari camps, and Maasai tribal interactions.',
    price: 199999,
    durationDays: 6,
    startDate: new Date(Date.now() + 30 * 86400000),
    totalSeats: 10,
    availableSeats: 3,
    category: 'adventure',
    avgRating: 5.0,
    reviewCount: 45,
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrive in Kilimanjaro / Transfer to Tarangire', details: 'First game drive among ancient baobab trees and giant elephant herds.' },
      { day: 2, title: 'Ngorongoro Crater Floor Safari', details: 'Descend 600m into volcanic caldera for black rhinos and lion prides.' },
      { day: 3, title: 'Serengeti Endless Plains', details: 'Game drive tracking cheetahs, leopards, and migrating wildebeest herds.' },
      { day: 4, title: 'Hot Air Balloon Safari at Dawn', details: 'Floating silently over savannah wildlife followed by bush breakfast.' },
      { day: 5, title: 'Maasai Cultural Village Experience', details: 'Traditional jumping dance, bush medicine walk, and craft weaving.' },
      { day: 6, title: 'Bush Flight to Arusha / Departure', details: 'Morning final drive, bush plane flight to Kilimanjaro airport.' },
    ],
    inclusions: ['Luxury safari tented lodges', 'All national park conservation fees', 'Custom 4x4 pop-top Land Cruiser & professional tracker', 'All meals & bush drinks'],
    exclusions: ['International flights', 'Maasai village donation ($20)'],
    cancellationPolicy: 'Refundable up to 10 days before departure.',
    pickupLocation: 'Kilimanjaro International Airport (JRO)',
  },
  {
    title: 'Queenstown Extreme Sports & Milford Sound',
    slug: 'queenstown-extreme-sports-and-milford-sound',
    destination: 'Queenstown, New Zealand',
    description: 'Adrenaline capital thrills: world-first bungy jumping, Shotover canyon jet boating, skydiving, and fiordland cruising.',
    price: 129999,
    durationDays: 5,
    startDate: new Date(Date.now() + 45 * 86400000),
    totalSeats: 12,
    availableSeats: 7,
    category: 'adventure',
    avgRating: 4.9,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Queenstown', details: 'Lakeside check-in and Skyline Gondola ride for panoramic luge runs.' },
      { day: 2, title: 'Shotover Jet & Kawarau Bungy Jump', details: 'Full-throttle canyon jet boat spins and leap from historical bridge.' },
      { day: 3, title: 'Milford Sound Nature Cruise', details: 'Journey through Homer Tunnel into towering fiordland waterfalls.' },
      { day: 4, title: '15,000 ft Tandem Skydive', details: 'Freefall over Lake Wakatipu and The Remarkables mountain range.' },
      { day: 5, title: 'Departure', details: 'Farewell breakfast and airport drop-off.' },
    ],
    inclusions: ['All extreme activity admissions', 'Lakeside hotel accommodation', 'Milford Sound scenic day tour with lunch', 'Local activity shuttles'],
    exclusions: ['Activity photo packages', 'Alcoholic beverages'],
    cancellationPolicy: 'Full refund up to 72 hours prior to arrival.',
    pickupLocation: 'Queenstown Airport (ZQN)',
  },
  {
    title: 'Rishikesh River Rafting & Bungee Adventure',
    slug: 'rishikesh-river-rafting-and-bungee-adventure',
    destination: 'Uttarakhand, India',
    description: 'Grade IV white water rapids on the Ganges, India highest 83m bungee jump, jungle camping, and riverside cliff jumps.',
    price: 18999,
    durationDays: 3,
    startDate: new Date(Date.now() + 8 * 86400000),
    totalSeats: 30,
    availableSeats: 21,
    category: 'adventure',
    avgRating: 4.8,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Shivpuri & Jungle Camp', details: 'Check-in to riverside luxury Swiss tents, evening bonfire & barbecue.' },
      { day: 2, title: '26km River Rafting & Cliff Jumping', details: 'Tackle The Wall, Daniel Dip, and Roller Coaster rapids on the Ganges.' },
      { day: 3, title: '83m Bungee Jump & Departure', details: 'Leap from fixed platform over river canyon before departure.' },
    ],
    inclusions: ['Luxury AC Swiss tent camp', 'All meals, snacks & bonfire', 'Certified rafting gear & safety kayaks', '83m Bungee jump pass'],
    exclusions: ['GoPro jump footage', 'Personal transport to Rishikesh'],
    cancellationPolicy: '100% refund up to 48 hours before check-in.',
    pickupLocation: 'Dehradun Jolly Grant Airport (DED) / Rishikesh',
  },

  // --- CULTURAL CITIES ---
  {
    title: 'Tokyo & Kyoto Cultural Wonders',
    slug: 'tokyo-and-kyoto-cultural-wonders',
    destination: 'Tokyo & Kyoto, Japan',
    description: 'Harmonious blend of neon futuristic skyscrapers, Michelin dining, historic Shinto shrines, and serene bamboo groves.',
    price: 154999,
    durationDays: 8,
    startDate: new Date(Date.now() + 42 * 86400000),
    totalSeats: 20,
    availableSeats: 8,
    category: 'city',
    avgRating: 4.9,
    reviewCount: 49,
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Tokyo', details: 'Shinjuku hotel check-in and evening Omoide Yokocho yakitori tour.' },
      { day: 2, title: 'Asakusa Senso-ji & Shibuya Crossing', details: 'Traditional Edo district tour and modern neon crossing.' },
      { day: 3, title: 'Mount Fuji & Lake Ashi Day Trip', details: 'Cable car ride and pirate ship cruise with Fuji reflections.' },
      { day: 4, title: 'Bullet Train Shinkansen to Kyoto', details: 'Travel at 300 km/h to historic capital and walk Fushimi Inari torii gates.' },
      { day: 5, title: 'Arashiyama Bamboo Grove & Kinkaku-ji', details: 'Morning bamboo walk and visit to the iconic Golden Pavilion.' },
      { day: 6, title: 'Nara Deer Park & Tea Ceremony', details: 'Friendly bow-trained deer and authentic matcha ceremony in a Zen garden.' },
      { day: 7, title: 'Gion Geisha District & Kaiseki Banquet', details: 'Evening lantern walk and multi-course traditional banquet.' },
      { day: 8, title: 'Departure from Osaka (KIX)', details: 'Morning leisure and express transfer to Kansai Airport.' },
    ],
    inclusions: ['7-Day Japan Rail Pass', '4-star central hotels in Tokyo & Kyoto', 'Daily breakfast & Kaiseki multi-course dinner', 'English-speaking local guide'],
    exclusions: ['International flights', 'Luggage courier overage'],
    cancellationPolicy: 'Full refund up to 7 days before departure.',
    pickupLocation: 'Tokyo Haneda Airport (HND) / Narita (NRT)',
  },
  {
    title: 'Paris Art, Architecture & Seine River Romance',
    slug: 'paris-art-architecture-and-seine-river-romance',
    destination: 'Paris, France',
    description: 'The City of Light: private Louvre guided tour, sunset Seine River champagne cruise, Versailles palace gardens, and Montmartre.',
    price: 139999,
    durationDays: 6,
    startDate: new Date(Date.now() + 28 * 86400000),
    totalSeats: 18,
    availableSeats: 11,
    category: 'city',
    avgRating: 4.8,
    reviewCount: 36,
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Paris', details: 'Private transfer to Saint-Germain boutique hotel and evening bistro dinner.' },
      { day: 2, title: 'Louvre Skip-the-Line & Tuileries', details: 'Masterpiece tour featuring Mona Lisa and Venus de Milo.' },
      { day: 3, title: 'Eiffel Tower Summit & Seine Dinner Cruise', details: 'Top-floor panoramic vistas and glass-canopy yacht dinner.' },
      { day: 4, title: 'Day Excursion to Palace of Versailles', details: 'Hall of Mirrors, Royal Apartments, and fountain gardens.' },
      { day: 5, title: 'Montmartre Artists & Sacré-Cœur', details: 'Bohemian cobblestone streets and sunset overlooking Paris.' },
      { day: 6, title: 'Departure', details: 'Croissant breakfast and transfer to Charles de Gaulle Airport.' },
    ],
    inclusions: ['Boutique 4-star hotel stay', 'Daily French breakfast', 'VIP skip-the-line museum & tower passes', 'Gourmet Seine dinner cruise'],
    exclusions: ['Airfare', 'City tax (€4/night)'],
    cancellationPolicy: '100% refund up to 5 days prior to arrival.',
    pickupLocation: 'Charles de Gaulle Airport (CDG)',
  },
  {
    title: 'Dubai Futuristic Wonders & Desert Glamping',
    slug: 'dubai-futuristic-wonders-and-desert-glamping',
    destination: 'Dubai, UAE',
    description: 'Burj Khalifa 148th floor sky lounge, luxury desert dune safari with falconry, Dubai Marina yacht cruise, and Museum of the Future.',
    price: 79999,
    durationDays: 5,
    startDate: new Date(Date.now() + 18 * 86400000),
    totalSeats: 22,
    availableSeats: 13,
    category: 'city',
    avgRating: 4.9,
    reviewCount: 63,
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Dubai Marina', details: 'Luxury hotel check-in and Dubai Marina evening walk.' },
      { day: 2, title: 'Burj Khalifa Sky & Dubai Mall', details: 'Level 148 observation lounge and Dubai Fountain show.' },
      { day: 3, title: 'Red Dune Safari & Bedouin Camp', details: 'Dune bashing, sandboarding, camel rides, and barbecue buffet under the stars.' },
      { day: 4, title: 'Museum of the Future & Old Dubai Souks', details: 'Futuristic innovation tour followed by abra boat ride on Dubai Creek.' },
      { day: 5, title: 'Departure', details: 'Morning duty-free shopping and drop to Dubai International Airport.' },
    ],
    inclusions: ['5-star luxury hotel in Downtown Dubai', 'Daily buffet breakfast', 'Burj Khalifa Level 148 VIP ticket', 'Premium Desert Safari with BBQ'],
    exclusions: ['Tourism Dirham fee', 'Personal shopping'],
    cancellationPolicy: 'Free cancellation up to 48 hours prior.',
    pickupLocation: 'Dubai International Airport (DXB)',
  },

  // --- SPIRITUAL & HERITAGE ---
  {
    title: 'Varanasi & Rishikesh Spiritual Journey',
    slug: 'varanasi-and-rishikesh-spiritual-journey',
    destination: 'Varanasi & Rishikesh, India',
    description: 'Ancient rituals along the holy Ganges, mesmerizing evening aarti ceremonies, yoga meditation retreats, and Himalayan serenity.',
    price: 32999,
    durationDays: 6,
    startDate: new Date(Date.now() + 14 * 86400000),
    totalSeats: 30,
    availableSeats: 20,
    category: 'religious',
    avgRating: 4.9,
    reviewCount: 94,
    images: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Varanasi & Evening Aarti', details: 'Private boat at Dashashwamedh Ghat for the world-famous Ganga Aarti.' },
      { day: 2, title: 'Sunrise Ghats & Kashi Vishwanath Temple', details: 'Dawn rowboat ride on the holy river and visit to the golden corridor.' },
      { day: 3, title: 'Sarnath Buddhist Pilgrimage', details: 'Excursion to Deer Park where Lord Buddha taught his first sermon.' },
      { day: 4, title: 'Flight to Dehradun / Transfer to Rishikesh', details: 'Travel to the yoga capital at the Himalayan foothills.' },
      { day: 5, title: 'Ashram Meditation & Triveni Ghat', details: 'Morning pranayama yoga session followed by sunset riverbank chants.' },
      { day: 6, title: 'Beatles Ashram & Departure', details: 'Visit iconic meditation caves and transfer to Dehradun airport.' },
    ],
    inclusions: ['Riverside heritage hotels & peaceful ashram stay', 'Pure vegetarian sattvic meals', 'Private boat cruises & priest rituals', 'All domestic airport transfers'],
    exclusions: ['Personal donations and offerings'],
    cancellationPolicy: '100% refund up to 48 hours before start date.',
    pickupLocation: 'Varanasi Lal Bahadur Shastri Airport (VNS)',
  },
  {
    title: 'Amritsar Golden Temple & Heritage Trail',
    slug: 'amritsar-golden-temple-and-heritage-trail',
    destination: 'Amritsar, Punjab, India',
    description: 'Spiritual tranquility at Harmandir Sahib, holy community kitchen (Langar) service, Wagah Border retreat ceremony, and rich Punjabi cuisine.',
    price: 21999,
    durationDays: 3,
    startDate: new Date(Date.now() + 9 * 86400000),
    totalSeats: 25,
    availableSeats: 15,
    category: 'religious',
    avgRating: 5.0,
    reviewCount: 68,
    images: [
      'https://images.unsplash.com/photo-1588096344356-9b59b58941f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Amritsar & Night Temple Visit', details: 'Check-in and night illumination tour of the Golden Temple.' },
      { day: 2, title: 'Jallianwala Bagh & Wagah Border Ceremony', details: 'Historical memorial visit followed by VIP seating at Wagah Border flag lowering.' },
      { day: 3, title: 'Langar Community Service & Departure', details: 'Volunteer service in the world largest free kitchen and airport transfer.' },
    ],
    inclusions: ['4-star heritage hotel stay', 'Daily traditional breakfast', 'VIP Wagah border ceremony pass', 'All private AC transport'],
    exclusions: ['Personal expenses', 'Shopping'],
    cancellationPolicy: 'Free cancellation up to 24 hours before trip.',
    pickupLocation: 'Sri Guru Ram Dass Jee International Airport (ATQ)',
  },
];

export const seed = async () => {
  try {
    console.log('🌱 Starting comprehensive database seed script...');
    await connectDB();

    // 1. Seed or update Admin User
    let admin = await User.findOne({ email: env.ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`✅ Admin user seeded: ${admin.email}`);
    } else {
      admin.role = 'admin';
      admin.name = env.ADMIN_NAME;
      await admin.save();
      console.log(`ℹ️ Admin user verified: ${admin.email}`);
    }

    // 2. Seed a test traveler user
    let traveler = await User.findOne({ email: 'traveler@test.com' });
    if (!traveler) {
      traveler = await User.create({
        name: 'Arjun Sharma',
        email: 'traveler@test.com',
        password: 'Traveler@123',
        role: 'user',
      });
      console.log(`✅ Test traveler user seeded: traveler@test.com / Traveler@123`);
    }

    // 3. Upsert all Rich Packages
    const createdPackages = [];
    for (const pkgData of richPackages) {
      let pkg = await Package.findOne({ slug: pkgData.slug });
      if (!pkg) {
        pkg = await Package.create(pkgData);
        console.log(`✅ Seeded package: ${pkg.title}`);
      } else {
        Object.assign(pkg, pkgData);
        await pkg.save();
        console.log(`🔄 Updated package: ${pkg.title}`);
      }
      createdPackages.push(pkg);
    }

    // 4. Seed authentic reviewer accounts and detailed reviews
    const reviewers = {};
    for (const profile of reviewerProfiles) {
      let reviewer = await User.findOne({ email: profile.email });
      if (!reviewer) {
        reviewer = await User.create(profile);
      }
      reviewers[profile.email] = reviewer;
    }
    console.log(`✅ Seeded ${Object.keys(reviewers).length} reviewer profiles`);

    const reviewerIds = Object.values(reviewers).map((u) => u._id);
    await Review.deleteMany({ user: { $in: reviewerIds } });

    let seededReviewTotal = 0;
    for (const pkg of createdPackages) {
      const entries = reviewSeeds[pkg.slug] || [];
      for (const entry of entries) {
        const reviewer = reviewers[entry.email];
        if (!reviewer) continue;
        const reviewedAt = new Date(Date.now() - entry.daysAgo * 86400000);
        await Review.create({
          user: reviewer._id,
          package: pkg._id,
          rating: entry.rating,
          comment: entry.comment,
          createdAt: reviewedAt,
          updatedAt: reviewedAt,
        });
        seededReviewTotal += 1;
      }
    }

    // A single completed-journey review from the demo traveller account
    await Review.deleteMany({ user: traveler._id });
    if (createdPackages[0]) {
      await Review.create({
        package: createdPackages[0]._id,
        user: traveler._id,
        rating: 5,
        comment:
          'Booked the Bali journey for our anniversary and it exceeded every expectation. The private villa upgrade, the sunrise trek guide and the airport transfers were all handled beautifully. The team replied to every question within minutes.',
      });
    }

    // Recalculate package rating statistics from real reviews so cards never show fake counts
    for (const pkg of createdPackages) {
      const [stats] = await Review.aggregate([
        { $match: { package: pkg._id } },
        { $group: { _id: '$package', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
      ]);
      pkg.avgRating = stats ? Math.round(stats.avgRating * 10) / 10 : 0;
      pkg.reviewCount = stats ? stats.reviewCount : 0;
      await pkg.save();
    }
    console.log(`✅ Seeded ${seededReviewTotal} detailed traveler reviews and synced ratings`);

    // 5. Seed sample confirmed booking for the traveler so dashboard has live data
    const firstPkg = createdPackages[0];
    const existingBooking = await Booking.findOne({ user: traveler._id, package: firstPkg._id });
    if (!existingBooking) {
      const newBooking = await Booking.create({
        user: traveler._id,
        package: firstPkg._id,
        travelers: 2,
        travelersInfo: [
          { name: 'Arjun Sharma', age: 29, gender: 'male' },
          { name: 'Priya Sharma', age: 27, gender: 'female' },
        ],
        totalAmount: firstPkg.price * 2,
        status: 'confirmed',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      await Payment.create({
        booking: newBooking._id,
        user: traveler._id,
        amount: newBooking.totalAmount,
        status: 'success',
        transactionId: `TXN-${Date.now()}-DEMO`,
        cardLast4: '4242',
        cardBrand: 'Visa',
      });
      console.log(`✅ Seeded sample booking & payment for traveler user.`);
    }

    console.log('🎉 Database successfully seeded with 12+ full packages, reviews, and test bookings!');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seed();
