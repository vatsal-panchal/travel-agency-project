import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const DestinationsPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 72 World Destinations across regions (6 per page x 12 pages = exactly 72 destinations)
  const allDestinations = [
    // Page 1
    {
      name: 'Bali & Southeast Asia',
      country: 'Indonesia',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      description: 'Lush terraced rice fields, sacred water temples, pristine surfing beaches, and luxury pool villas.',
      tag: 'Tropical Escapes',
      query: 'Bali',
    },
    {
      name: 'Swiss Alps & Glaciers',
      country: 'Switzerland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      description: 'Towering Matterhorn peaks, crystalline glacial lakes, and world-class cogwheel railway journeys.',
      tag: 'Alpine Treks',
      query: 'Switzerland',
    },
    {
      name: 'Tokyo & Ancient Kyoto',
      country: 'Japan',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      description: 'Futuristic neon skylines, historic torii gates, authentic tea ceremonies, and Michelin-starred dining.',
      tag: 'Cultural Wonders',
      query: 'Japan',
    },
    {
      name: 'Santorini & Cyclades',
      country: 'Greece',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      description: 'Caldera cliffside cave suites, blue-domed architecture, Aegean catamaran cruises, and sunset dining.',
      tag: 'Mediterranean Romance',
      query: 'Greece',
    },
    {
      name: 'Serengeti & Ngorongoro',
      country: 'Tanzania',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      description: 'Witness the Great Wildebeest Migration, the Big Five, and luxury tented camps under endless savannah skies.',
      tag: 'Wildlife Safari',
      query: 'Tanzania',
    },
    {
      name: 'Maldives Private Atolls',
      country: 'Maldives',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      description: 'Secluded overwater bungalows, private sandbank banquets, and swimming alongside whale sharks.',
      tag: 'Ultra Luxury',
      query: 'Maldives',
    },

    // Page 2
    {
      name: 'Dubai & Arabian Dunes',
      country: 'UAE',
      region: 'middle-east',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      description: 'Sky-piercing skyscrapers, Level 148 Burj Khalifa decks, and luxury desert safari glamping under star-lit skies.',
      tag: 'Modern Metropolis',
      query: 'Dubai',
    },
    {
      name: 'Varanasi & Rishikesh',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      description: 'Sacred Ganga river aarti rituals, ancient Ghats, yoga ashrams, and Himalayan spiritual serenity.',
      tag: 'Spiritual Serenity',
      query: 'Varanasi',
    },
    {
      name: 'Banff & Canadian Rockies',
      country: 'Canada',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
      description: 'Glacial turquoise waters of Lake Louise and Moraine Lake, and ice skywalks on Athabasca Glacier.',
      tag: 'Untamed Wilderness',
      query: 'Canada',
    },
    {
      name: 'Amalfi Coast & Positano',
      country: 'Italy',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      description: 'Pastel cliffside villas, lemon orchards of Sorrento, and private wooden Riva boat cruises around Capri.',
      tag: 'Coastal Elegance',
      query: 'Italy',
    },
    {
      name: 'Reykjavik & Northern Lights',
      country: 'Iceland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      description: 'Dancing aurora borealis, Blue Lagoon geothermal springs, and explosive geysers along the Golden Circle.',
      tag: 'Arctic Wonder',
      query: 'Iceland',
    },
    {
      name: 'Queenstown & Fiordlands',
      country: 'New Zealand',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
      description: 'Dramatic glacial fjords of Milford Sound, adrenaline jet boat spins, and helicopter mountain landings.',
      tag: 'Adventure Capital',
      query: 'New Zealand',
    },

    // Page 3
    {
      name: 'Kyoto Zen Temples & Bamboo',
      country: 'Japan',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      description: 'Ancient wooden pagodas, quiet moss gardens, and historic stone pathways lined with cherry blossoms.',
      tag: 'Heritage Sanctuary',
      query: 'Kyoto',
    },
    {
      name: 'Paris Arts & Seine Romance',
      country: 'France',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      description: 'VIP Louvre masterclasses, sunset champagne cruises on the Seine, and Michelin dining in Saint-Germain.',
      tag: 'Capital of Art',
      query: 'Paris',
    },
    {
      name: 'Cape Town & Table Mountain',
      country: 'South Africa',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      description: 'Cable car ascents to Table Mountain, wine tasting in Stellenbosch, and penguin colonies at Boulders Beach.',
      tag: 'Ocean & Peaks',
      query: 'Cape Town',
    },
    {
      name: 'Petra & Wadi Rum Desert',
      country: 'Jordan',
      region: 'middle-east',
      image: 'https://images.unsplash.com/photo-1579606032834-deaff9a5c81f?auto=format&fit=crop&w=800&q=80',
      description: 'Rose-red city carved into sandstone canyons and Martian desert glamping with Bedouin star-gazing.',
      tag: 'Ancient Wonder',
      query: 'Jordan',
    },
    {
      name: 'Manali & Rohtang Heights',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      description: 'Pine-scented mountain cabins, Rohtang Pass snow valleys, and quiet streams in the Pir Panjal range.',
      tag: 'Himalayan Escape',
      query: 'Manali',
    },
    {
      name: 'Machu Picchu & Sacred Valley',
      country: 'Peru',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
      description: 'Lost Incan citadel floating among Andean cloud forests, scenic Hiram Bingham train, and Cusco markets.',
      tag: 'Incan Citadel',
      query: 'Peru',
    },

    // Page 4
    {
      name: 'Cappadocia Hot Air Balloons',
      country: 'Turkey',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
      description: 'Hundreds of sunrise hot air balloons floating over fairy chimney rock formations and ancient cave suites.',
      tag: 'Fairy Tale Skies',
      query: 'Turkey',
    },
    {
      name: 'Seychelles Granite Atolls',
      country: 'Seychelles',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1589979481223-deb893043163?auto=format&fit=crop&w=800&q=80',
      description: 'Giant granite boulders framing Anse Source d’Argent, giant Aldabra tortoises, and emerald water villas.',
      tag: 'Island Paradise',
      query: 'Seychelles',
    },
    {
      name: 'Zermatt & Matterhorn Peak',
      country: 'Switzerland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      description: 'Car-free alpine paradise under the iconic pyramid peak, luxury fondue chalets, and glacial skiing.',
      tag: 'Alpine Majesty',
      query: 'Zermatt',
    },
    {
      name: 'Phuket & Phi Phi Islands',
      country: 'Thailand',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
      description: 'Towering limestone karst cliffs rising from emerald waters, sea cave kayaking, and sunset yacht cruises.',
      tag: 'Andaman Jewels',
      query: 'Thailand',
    },
    {
      name: 'Cairo & Giza Pyramids',
      country: 'Egypt',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
      description: 'Millennia-old Great Pyramids, the enigmatic Sphinx, and luxury five-star Nile River sailing dahabiyas.',
      tag: 'Pharaonic Legacy',
      query: 'Egypt',
    },
    {
      name: 'Moroccan Sahara & Marrakech',
      country: 'Morocco',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80',
      description: 'Ornate riad courtyards in the Medina, spice-scented souks, and camel trekking across Erg Chebbi golden dunes.',
      tag: 'Imperial Elegance',
      query: 'Morocco',
    },

    // Page 5
    {
      name: 'Interlaken Lakes & Valleys',
      country: 'Switzerland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
      description: 'Nestled between Lake Thun and Lake Brienz, surrounded by 72 alpine waterfalls in Lauterbrunnen valley.',
      tag: 'Valley of Waterfalls',
      query: 'Interlaken',
    },
    {
      name: 'Amritsar Harmandir Sahib',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1588096344356-9b59b58941f1?auto=format&fit=crop&w=800&q=80',
      description: 'Glistening Golden Temple reflections, world-largest free community kitchen, and Wagah Border ceremony.',
      tag: 'Sacred Sanctuary',
      query: 'Amritsar',
    },
    {
      name: 'Maui & Hawaiian Archipelago',
      country: 'United States',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      description: 'Road to Hana coastal rainforest drives, sunrise above the clouds on Haleakala, and humpback whale watching.',
      tag: 'Pacific Haven',
      query: 'Hawaii',
    },
    {
      name: 'Dubrovnik & Adriatic Coast',
      country: 'Croatia',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      description: 'Centuries-old stone ramparts overlooking crystal-clear sapphire seas, limestone alleyways, and island hopping.',
      tag: 'Pearl of the Adriatic',
      query: 'Croatia',
    },
    {
      name: 'Muscat & Oman Fjords',
      country: 'Oman',
      region: 'middle-east',
      image: 'https://images.unsplash.com/photo-1578895101407-c37617300d83?auto=format&fit=crop&w=800&q=80',
      description: 'Sultan Qaboos Grand Mosque, turquoise wadi swimming holes, and dhow sailing along the Musandam peninsula.',
      tag: 'Arabian Peninsula',
      query: 'Oman',
    },
    {
      name: 'Bora Bora Coral Lagoon',
      country: 'French Polynesia',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80',
      description: 'Mount Otemanu rising dramatically from an electric turquoise lagoon, overwater bungalows, and ray feeding.',
      tag: 'South Pacific Jewel',
      query: 'Bora Bora',
    },

    // Page 6
    {
      name: 'Barcelona Gaudí Masterpieces',
      country: 'Spain',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
      description: 'Sagrada Família soaring spires, Park Güell mosaics, beachfront tapas dining, and Gothic Quarter vibes.',
      tag: 'Catalan Culture',
      query: 'Barcelona',
    },
    {
      name: 'South Goa Heritage Mansions',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      description: 'Private palm-lined sands of Palolem and Cavelossim, Portuguese estates, and luxury catamaran cruising.',
      tag: 'Coastal Serenity',
      query: 'Goa',
    },
    {
      name: 'Venice Grand Canal & Gondolas',
      country: 'Italy',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
      description: 'Waterway labyrinths, marble Renaissance palazzos, historic St. Mark’s Basilica, and private singing gondolas.',
      tag: 'Floating City',
      query: 'Venice',
    },
    {
      name: 'Victoria Falls & Zambezi',
      country: 'Zambia & Zimbabwe',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?auto=format&fit=crop&w=800&q=80',
      description: 'The Smoke That Thunders: mile-wide plunging falls, helicopter flights over the gorge, and sunset river safaris.',
      tag: 'Natural Wonder',
      query: 'Victoria Falls',
    },
    {
      name: 'Rio de Janeiro & Copacabana',
      country: 'Brazil',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
      description: 'Christ the Redeemer overlooking Sugarloaf Mountain, golden Copacabana beaches, and lively samba nights.',
      tag: 'Marvelous City',
      query: 'Brazil',
    },
    {
      name: 'Doha Corniche & Inland Sea',
      country: 'Qatar',
      region: 'middle-east',
      image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
      description: 'Museum of Islamic Art, Souq Waqif falcon market, and dramatic Khor Al Adaid where desert dunes meet the sea.',
      tag: 'Gulf Modernity',
      query: 'Qatar',
    },

    // Page 7
    {
      name: 'London Royal Palaces & Thames',
      country: 'United Kingdom',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      description: 'Buckingham Palace pageantry, West End theater galas, luxury Mayfair shopping, and Tower Bridge views.',
      tag: 'Royal Heritage',
      query: 'London',
    },
    {
      name: 'Sydney Harbour & Opera House',
      country: 'Australia',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
      description: 'Iconic architectural sail roofs, Harbour Bridge climbs, Bondi to Coogee coastal walks, and sailing yachts.',
      tag: 'Harbour City',
      query: 'Sydney',
    },
    {
      name: 'Edinburgh Castle & Highlands',
      country: 'Scotland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
      description: 'Perched volcanic fortress, cobblestone Royal Mile, single-malt whisky vaults, and Isle of Skye road trips.',
      tag: 'Highland Legend',
      query: 'Scotland',
    },
    {
      name: 'Hoi An Ancient Lantern Town',
      country: 'Vietnam',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      description: 'Canal-side yellow French colonial merchant homes, colorful silk lanterns, and tailor boutiques.',
      tag: 'UNESCO Jewel',
      query: 'Vietnam',
    },
    {
      name: 'Prague Spired Skyline',
      country: 'Czech Republic',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
      description: 'Charles Bridge gothic statues, astronomical clock chimes, and hilltop Prague Castle overlooking the Vltava.',
      tag: 'City of Hundred Spires',
      query: 'Prague',
    },
    {
      name: 'Galapagos Islands Wildlife',
      country: 'Ecuador',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      description: 'Close encounters with marine iguanas, blue-footed boobies, and giant sea tortoises in Darwin’s living lab.',
      tag: 'Evolutionary Haven',
      query: 'Galapagos',
    },

    // Page 8
    {
      name: 'Udaipur City of Lakes',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=800&q=80',
      description: 'Marble Lake Palace floating on Lake Pichola, royal Mewar courtyards, and luxury rooftop candlelight dining.',
      tag: 'Royal Romance',
      query: 'Udaipur',
    },
    {
      name: 'Lofoten Islands & Arctic Fjords',
      country: 'Norway',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
      description: 'Red fisherman rorbuer cabins resting on stilts, jagged razor-sharp peaks, and midnight sun fishing.',
      tag: 'Fjordland Magic',
      query: 'Norway',
    },
    {
      name: 'Singapore Garden Metropolis',
      country: 'Singapore',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      description: 'Gardens by the Bay supertree lights, Marina Bay Sands rooftop infinity pool, and world-class street food.',
      tag: 'City in a Garden',
      query: 'Singapore',
    },
    {
      name: 'Great Barrier Reef & Whitsundays',
      country: 'Australia',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      description: 'Scenic helicopter flights over Heart Reef, silica sands of Whitehaven Beach, and world-class scuba diving.',
      tag: 'Living Coral Wonder',
      query: 'Barrier Reef',
    },
    {
      name: 'Siem Reap & Angkor Wat',
      country: 'Cambodia',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      description: 'Towering stone lotus towers of Angkor Wat at dawn, giant tree roots reclaiming Ta Prohm temple ruins.',
      tag: 'Khmer Empire',
      query: 'Cambodia',
    },
    {
      name: 'Vienna Classical Music & Palaces',
      country: 'Austria',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80',
      description: 'Imperial Schönbrunn Palace gardens, golden opera house performances, and historic Sachertorte coffeehouses.',
      tag: 'Imperial Elegance',
      query: 'Vienna',
    },

    // Page 9
    {
      name: 'Kerala Backwaters & Houseboats',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      description: 'Gliding silently on luxury thatched kettuvallam houseboats through tranquil palm-fringed lagoons.',
      tag: 'God’s Own Country',
      query: 'Kerala',
    },
    {
      name: 'Amsterdam Canals & Gabled Mansions',
      country: 'Netherlands',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
      description: 'Historic canal ring boat tours, Van Gogh masterpieces, flower markets, and cycling past brick merchant houses.',
      tag: 'Venice of the North',
      query: 'Amsterdam',
    },
    {
      name: 'Seoul Modern K-Culture & Palaces',
      country: 'South Korea',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80',
      description: 'Gyeongbokgung royal palace gates, Bukchon Hanok heritage village, and bustling midnight Myeongdong markets.',
      tag: 'Dynamic Capital',
      query: 'Seoul',
    },
    {
      name: 'Dubrovnik & Adriatic Coast',
      country: 'Croatia',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      description: 'Centuries-old stone ramparts overlooking crystal-clear sapphire seas, limestone alleyways, and island hopping.',
      tag: 'Pearl of the Adriatic',
      query: 'Croatia',
    },
    {
      name: 'Jaipur Pink City & Amber Fort',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      description: 'Hawa Mahal honeycomb windows, hilltop elephant gates at Amber Palace, and luxury heritage haveli stays.',
      tag: 'Royal Heritage',
      query: 'Jaipur',
    },
    {
      name: 'Lucerne Lake & Chapel Bridge',
      country: 'Switzerland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
      description: 'Medieval covered wooden bridge, Mount Pilatus dragon railway, and paddle steamer cruises on Lake Lucerne.',
      tag: 'Alpine Gem',
      query: 'Lucerne',
    },

    // Page 10
    {
      name: 'Buenos Aires Tango & Culture',
      country: 'Argentina',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
      description: 'Colorful metal tenements of La Boca, authentic tango milongas in San Telmo, and prime steakhouse dining.',
      tag: 'Paris of the South',
      query: 'Argentina',
    },
    {
      name: 'Florence Renaissance & Uffizi',
      country: 'Italy',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80',
      description: 'Michelangelo’s David, Brunelleschi’s terracotta Duomo dome, and sunset strolls over Ponte Vecchio bridge.',
      tag: 'Cradle of Renaissance',
      query: 'Florence',
    },
    {
      name: 'Kashmir Dal Lake & Gulmarg',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
      description: 'Carved cedarwood shikaras on Dal Lake, floating lotus flower bazaars, and world highest gondola in Gulmarg.',
      tag: 'Paradise on Earth',
      query: 'Kashmir',
    },
    {
      name: 'Cusco & Rainbow Mountain',
      country: 'Peru',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
      description: 'Colonial stone plazas built over Incan masonry, multi-colored mineral stripes on Vinicunca mountain.',
      tag: 'High Altitude Marvel',
      query: 'Peru',
    },
    {
      name: 'Marrakech Medina & Atlas Slopes',
      country: 'Morocco',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80',
      description: 'Snake charmers at Jemaa el-Fnaa square, Majorelle cobalt blue botanical gardens, and Berber villages.',
      tag: 'Ochre Oasis',
      query: 'Marrakech',
    },
    {
      name: 'Zanzibar Spice Island & Reefs',
      country: 'Tanzania',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
      description: 'Stone Town carved mahogany doors, clove spice farms, and private sandbanks in turquoise Indian Ocean.',
      tag: 'Swahili Coast',
      query: 'Zanzibar',
    },

    // Page 11
    {
      name: 'Salzburg & Sound of Music',
      country: 'Austria',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80',
      description: 'Mirabell Palace marble gardens, Hohensalzburg fortress panoramas, and Mozart’s birthplace cobblestone streets.',
      tag: 'Baroque Beauty',
      query: 'Salzburg',
    },
    {
      name: 'Istanbul Bosphorus & Bazaars',
      country: 'Turkey',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
      description: 'Hagia Sophia dome grandeur, Blue Mosque minarets, Grand Bazaar spice halls, and continents-crossing cruises.',
      tag: 'Where Continents Meet',
      query: 'Istanbul',
    },
    {
      name: 'Leh Ladakh High Passes',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      description: 'Deep cobalt blue waters of Pangong Tso lake, Buddhist cliffside gompas, and world highest motorable roads.',
      tag: 'Roof of the World',
      query: 'Ladakh',
    },
    {
      name: 'Oahu & North Shore Surf',
      country: 'United States',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      description: 'Diamond Head volcanic crater hikes, Waikiki beach outrigger canoes, and legendary winter surf breaks.',
      tag: 'Aloha Spirit',
      query: 'Hawaii',
    },
    {
      name: 'Brussels Grand Place & Guildhalls',
      country: 'Belgium',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
      description: 'Gilded Baroque townhouses, artisan praline chocolatiers, and fairytale medieval squares.',
      tag: 'Heart of Europe',
      query: 'Belgium',
    },
    {
      name: 'Cartagena Colonial Caribbean',
      country: 'Colombia',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
      description: 'Bougainvillea-draped wooden balconies inside 16th-century fortress walls, salsa clubs, and Rosario Islands.',
      tag: 'Caribbean Jewel',
      query: 'Colombia',
    },

    // Page 12
    {
      name: 'St. Moritz Alpine Glitz',
      country: 'Switzerland',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      description: 'Champagne climate, frozen lake polo matches, 5-star palace hotels, and legendary Engadin valley ski runs.',
      tag: 'Glamour on Ice',
      query: 'Switzerland',
    },
    {
      name: 'Andaman & Havelock Radhanagar',
      country: 'India',
      region: 'asia',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      description: 'Asia best white sand beaches, bioluminescent night kayaking, and pristine coral reef scuba diving.',
      tag: 'Island Serenity',
      query: 'Andaman',
    },
    {
      name: 'Lisbon Tramways & Belém',
      country: 'Portugal',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      description: 'Yellow Tram 28 climbing Alfama hills, pastel de nata bakeries, Fado music taverns, and Sintra fairy castles.',
      tag: 'City of Seven Hills',
      query: 'Portugal',
    },
    {
      name: 'Namib Desert & Sossusvlei Dunes',
      country: 'Namibia',
      region: 'africa',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      description: 'Towering rust-red sand dunes, ghost trees of Deadvlei, and dramatic desert star-gazing sanctuaries.',
      tag: 'Desert Majesty',
      query: 'Namibia',
    },
    {
      name: 'Rotorua Geothermal Springs',
      country: 'New Zealand',
      region: 'americas',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
      description: 'Bubbling mud pools, boiling silica terraces, traditional Maori hangi feasts, and redwood tree walks.',
      tag: 'Geothermal Heart',
      query: 'New Zealand',
    },
    {
      name: 'Rome Colosseum & Vatican',
      country: 'Italy',
      region: 'europe',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      description: 'The Eternal City: private Sistine Chapel access, Trevi Fountain coin tossing, and candlelit Trastevere dining.',
      tag: 'The Eternal City',
      query: 'Rome',
    },
  ];

  // Filter based on selected region
  const filteredList =
    selectedRegion === 'all'
      ? allDestinations
      : allDestinations.filter((d) => d.region === selectedRegion);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  // Ensure current page is valid when switching filters
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const regions = [
    { id: 'all', label: 'All regions', count: allDestinations.length },
    { id: 'asia', label: 'Asia' },
    { id: 'europe', label: 'Europe' },
    { id: 'africa', label: 'Africa' },
    { id: 'middle-east', label: 'Middle East' },
    { id: 'americas', label: 'Americas' },
  ];

  return (
    <div className="overflow-x-clip">
      {/* Header */}
      <section className="border-b border-ink/10 bg-cream-200/40">
        <div className="container-x py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="eyebrow">The world, edited</span>
              <h1 className="display-hero mt-4 max-w-3xl text-[2.9rem] text-ink sm:text-[4rem]">
                Places we know{' '}
                <em className="font-light italic text-clay-500">by heart.</em>
              </h1>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-500">
                A working atlas of regions our specialists have travelled, vetted and returned
                to. Choose a corner of the world and follow it to the right journey.
              </p>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="rounded-2xl border border-ink/10 bg-cream-50 px-5 py-4">
                <p className="font-display text-3xl leading-none text-ink">{allDestinations.length}</p>
                <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  Destinations
                </p>
              </div>
              <div className="hidden rounded-2xl border border-ink/10 bg-cream-50 px-5 py-4 sm:block">
                <p className="font-display text-3xl leading-none text-ink">5</p>
                <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  Continents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-10 sm:py-14">
        {/* Filters */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {regions.map((region) => {
            const isActive = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold transition ${
                  isActive
                    ? 'bg-ink text-cream-50 shadow-soft'
                    : 'border border-ink/10 bg-cream-50 text-ink-500 hover:border-ink/25 hover:text-ink'
                }`}
              >
                {region.label}
                {typeof region.count === 'number' && (
                  <span
                    className={`ml-1.5 text-[9px] ${
                      isActive ? 'text-cream-200/60' : 'text-ink-300'
                    }`}
                  >
                    {region.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-7 grid min-h-[620px] gap-5 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((dest) => (
            <article
              key={dest.name}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-ink/20 hover:shadow-card"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-300">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/5" />
                <span className="absolute left-3.5 top-3.5 rounded-full border border-white/25 bg-white/85 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink backdrop-blur-md">
                  {dest.tag}
                </span>
                <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-cream-50/85">
                  <MapPin className="h-3 w-3 text-clay-300" /> {dest.country}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Link to={`/packages?search=${encodeURIComponent(dest.query)}`}>
                  <h2 className="font-display text-[23px] leading-[1.15] text-ink transition-colors group-hover:text-clay-700">
                    {dest.name}
                  </h2>
                </Link>
                <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-[1.75] text-ink-500">
                  {dest.description}
                </p>
                <Link
                  to={`/packages?search=${encodeURIComponent(dest.query)}`}
                  className="mt-auto flex items-center justify-between border-t border-ink/[0.08] pt-4 text-[11px] font-extrabold text-ink transition hover:text-clay-600"
                >
                  <span>View itineraries</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 transition group-hover:border-clay-500 group-hover:bg-clay-500 group-hover:text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream-50 px-4 py-2.5 text-[11px] font-extrabold text-ink-600 transition hover:border-ink/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`h-9 w-9 shrink-0 rounded-full text-[11px] font-extrabold transition ${
                      isCurrent
                        ? 'bg-ink text-cream-50 shadow-soft'
                        : 'border border-ink/10 bg-cream-50 text-ink-500 hover:border-ink/25 hover:text-ink'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream-50 px-4 py-2.5 text-[11px] font-extrabold text-ink-600 transition hover:border-ink/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
