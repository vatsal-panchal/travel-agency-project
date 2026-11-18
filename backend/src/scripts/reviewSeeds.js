// Authentic-sounding seed reviews written for the demo catalogue.
// These are created against real reviewer accounts so the public review feed,
// package averages and review counts all stay consistent with the database.

export const reviewerProfiles = [
  { name: 'Ananya Mehta', email: 'ananya.mehta@example.com', password: 'Reviewer@123' },
  { name: 'Rohan Kapoor', email: 'rohan.kapoor@example.com', password: 'Reviewer@123' },
  { name: 'Sofia Almeida', email: 'sofia.almeida@example.com', password: 'Reviewer@123' },
  { name: 'Daniel Whitfield', email: 'daniel.whitfield@example.com', password: 'Reviewer@123' },
  { name: 'Aisha Rahman', email: 'aisha.rahman@example.com', password: 'Reviewer@123' },
  { name: 'Kenji Sato', email: 'kenji.sato@example.com', password: 'Reviewer@123' },
  { name: 'Priya Nair', email: 'priya.nair@example.com', password: 'Reviewer@123' },
  { name: 'Marcus Lee', email: 'marcus.lee@example.com', password: 'Reviewer@123' },
  { name: 'Elena Rossi', email: 'elena.rossi@example.com', password: 'Reviewer@123' },
  { name: 'Hannah Brooks', email: 'hannah.brooks@example.com', password: 'Reviewer@123' },
  { name: 'Kabir Singh', email: 'kabir.singh@example.com', password: 'Reviewer@123' },
  { name: 'Maya Fernandes', email: 'maya.fernandes@example.com', password: 'Reviewer@123' },
];

const r = (email, rating, daysAgo, comment) => ({ email, rating, daysAgo, comment });

export const reviewSeeds = {
  'bali-tropical-paradise-and-ubud-culture': [
    r(
      'ananya.mehta@example.com',
      5,
      12,
      'The Ubud villa was even better than the photos. Our guide Wayan picked us up at 2am for the Batur trek and somehow made it feel easy. The Nusa Penida boat day is long but absolutely worth it — pack a proper hat.'
    ),
    r(
      'daniel.whitfield@example.com',
      4,
      34,
      'Bali itself was magic and the itinerary got the balance right: two busy days, then enough free time to actually sit by the pool. Only note is that the Jimbaran seafood dinner felt a little rushed. Everything else was seamless.'
    ),
    r(
      'priya.nair@example.com',
      5,
      58,
      'Booked this for our honeymoon and the team upgraded us to a private pool villa without us even asking. Airport pickup, all transfers and the spa afternoon were handled perfectly. Would book with Wanderlust again in a heartbeat.'
    ),
  ],
  'maldives-luxury-overwater-villa-retreat': [
    r(
      'aisha.rahman@example.com',
      5,
      9,
      'The seaplane transfer alone is worth the trip. We stayed in villa 42 and could step straight off the deck into the reef. Housekeeping twice a day, and the sandbank picnic was completely private. A once-in-a-lifetime stay.'
    ),
    r(
      'marcus.lee@example.com',
      5,
      41,
      'Staff remembered our names from day one. The marine biologist snorkel at Hanifaru was the highlight — we swam with three mantas within the first twenty minutes. Pricey, but I never once felt nickel-and-dimed on the island.'
    ),
    r(
      'elena.rossi@example.com',
      4,
      75,
      'Beautiful villa and exceptional food. The only thing I would change is the sunset cruise timing — we left too early to see the actual sunset. Everything else, from arrival to departure, was first class.'
    ),
  ],
  'santorini-sunset-and-aegean-island-odyssey': [
    r(
      'sofia.almeida@example.com',
      5,
      21,
      'The cave hotel in Fira had a caldera view that made us cancel our dinner reservations just to sit on the terrace. The catamaran sunset sail was relaxed rather than crowded. Mykonos transfer was punctual to the minute.'
    ),
    r(
      'hannah.brooks@example.com',
      4,
      55,
      'Santorini is obviously stunning, but the wine tasting day surprised me most — small family vineyard, no tourist crush. Only downside: the ferry to Mykonos was very busy in August. Bring motion sickness tablets.'
    ),
    r(
      'rohan.kapoor@example.com',
      5,
      96,
      'We travelled with my parents and the pace was perfect. Our local host rearranged the Delos excursion when the wind picked up and got us on an earlier boat. That kind of flexibility is why I book with people, not algorithms.'
    ),
  ],
  'goa-coastal-serenity-and-heritage-villas': [
    r(
      'kabir.singh@example.com',
      5,
      7,
      'South Goa was exactly the quiet escape we needed. The heritage walk in Fontainhas was led by someone whose family had lived there for generations — easily the best two hours of the trip. The yacht cruise at sunset was a lovely surprise.'
    ),
    r(
      'maya.fernandes@example.com',
      4,
      29,
      'Great value for a five-star beachfront stay. Breakfast could be busier than expected, and the spice plantation tour is a little touristy, but the resort, transfers and team support were excellent. Would recommend for couples.'
    ),
    r(
      'arjun.desai@example.com',
      5,
      63,
      'Booked four days before departure and everything was still confirmed within an hour. Our driver was patient with two kids and the resort upgraded us to a sea-facing room. Smooth from start to finish.'
    ),
  ],
  'swiss-alps-hiking-and-glacier-express': [
    r(
      'daniel.whitfield@example.com',
      5,
      16,
      'The Glacier Express in first class was worth every rupee. Jungfraujoch is busy, but our guide got us up before the big tour groups. Zermatt at dusk with the Matterhorn turning pink is something I will not forget.'
    ),
    r(
      'elena.rossi@example.com',
      5,
      47,
      'Excellent hotels, all within a short walk of the stations. We added an extra day in Zermatt and the team adjusted our rail pass without a fuss. The trail notes were clear and the picnic lunch on Lake Brienz was a nice touch.'
    ),
    r(
      'marcus.lee@example.com',
      4,
      88,
      'A very well organised trip. My only caution is that the hikes are gentler than the itinerary makes them sound — great for us, but experienced hikers may want to add the longer Gornergrat route. Food and transfers were faultless.'
    ),
  ],
  'manali-and-solang-valley-snow-expedition': [
    r(
      'priya.nair@example.com',
      5,
      11,
      'The riverside cabin was cosy and the staff lit a bonfire for us without being asked. Atal Tunnel and Sissu were the highlight — proper snow, far fewer crowds than Solang. Our driver deserves a special mention for the mountain roads.'
    ),
    r(
      'kabir.singh@example.com',
      4,
      38,
      'Really good value and a well-paced itinerary. Solang gets crowded by midday, so go early. The cafe recommendations in Old Manali were spot on. Would have liked one more free afternoon, but no complaints otherwise.'
    ),
    r(
      'ananya.mehta@example.com',
      5,
      72,
      'We went in late January and the team called ahead to check road conditions every morning. That level of care made travelling with my parents stress-free. The apple orchard walk on the last day was a quiet, lovely finish.'
    ),
  ],
  'banff-and-canadian-rockies-alpine-explorer': [
    r(
      'hannah.brooks@example.com',
      5,
      19,
      'Moraine Lake at 6am before the shuttle crowds arrive is the single most beautiful thing I have seen in Canada. The Ice Explorer on Athabasca Glacier was genuinely surreal. Our guide knew every wildlife pull-out along the parkway.'
    ),
    r(
      'sofia.almeida@example.com',
      5,
      52,
      'Seven days, three national parks, zero wasted hours. The lodges were comfortable rather than flashy, which suited us perfectly. We saw a grizzly with two cubs from a safe distance on day five. Still can’t quite believe it.'
    ),
    r(
      'rohan.kapoor@example.com',
      4,
      101,
      'Excellent trip overall. The Icefields Parkway drive is long, so be ready for a full day in the van. Lake Louise canoeing was the highlight and the team handled the permit booking for us. Breakfasts could be more varied.'
    ),
  ],
  'serengeti-great-migration-and-ngorongoro-safari': [
    r(
      'aisha.rahman@example.com',
      5,
      14,
      'We saw the Big Five in the first 48 hours. Our tracker spotted a leopard in a sausage tree from what felt like a kilometre away. The tented camp was far more comfortable than expected, with hot showers and a proper bed.'
    ),
    r(
      'daniel.whitfield@example.com',
      5,
      44,
      'The balloon safari at dawn is expensive but I would do it again tomorrow. Floating over herds of wildebeest with no engine noise, then landing for a bush breakfast — it recalibrates what you think a good morning is.'
    ),
    r(
      'maya.fernandes@example.com',
      4,
      83,
      'Life-changing wildlife, and the guide was outstanding. The drives between parks are bumpy and long, so bring a good neck pillow. The Maasai village visit felt respectful rather than performative, which I appreciated.'
    ),
  ],
  'queenstown-extreme-sports-and-milford-sound': [
    r(
      'marcus.lee@example.com',
      5,
      6,
      'Jumped off the Kawarau bridge at 8am and it set the tone for the whole week. The Shotover jet was ridiculous in the best way. Milford Sound the next day was a complete change of pace — misty, quiet and enormous.'
    ),
    r(
      'hannah.brooks@example.com',
      4,
      31,
      'Very well organised adrenaline week. My partner skipped the skydive and the team arranged a winery tour for her instead at short notice. Only note: weather can move adventure slots, so keep a buffer day if you can.'
    ),
    r(
      'elena.rossi@example.com',
      5,
      67,
      'I was nervous about the bungy and the crew were calm, clear and never pushy. The photos package is worth buying. Milford Sound cruise was the calm counterweight to all the adrenaline. A brilliant five days.'
    ),
  ],
  'rishikesh-river-rafting-and-bungee-adventure': [
    r(
      'arjun.desai@example.com',
      5,
      4,
      'The 26km raft run had proper rapids without feeling unsafe. Our safety kayaker was switched on the whole way. Swiss tents were clean, the bonfire dinner was great, and the 83m jump is every bit as terrifying as it looks.'
    ),
    r(
      'priya.nair@example.com',
      4,
      26,
      'Fantastic short break from Delhi. The camp is basic but comfortable and the river is right there. Cliff jumping is optional and the team never pressured anyone. Bungee slots can run late, so don’t book a tight return train.'
    ),
    r(
      'kabir.singh@example.com',
      5,
      59,
      'Went with three friends and we are still talking about it. Guides were funny, careful and genuinely good at what they do. Breakfast by the river before rafting was unexpectedly lovely. Excellent value.'
    ),
  ],
  'tokyo-and-kyoto-cultural-wonders': [
    r(
      'kenji.sato@example.com',
      5,
      17,
      'Even as someone who grew up in Japan, the early morning Fushimi Inari walk showed me a side of Kyoto I had never seen. The Kaiseki dinner in Gion was beautifully chosen — intimate, seasonal and not at all touristy.'
    ),
    r(
      'sofia.almeida@example.com',
      5,
      39,
      'Eight days felt generous rather than rushed. The rail passes were already activated and seat reservations sorted, which saved so much time. Mount Fuji stayed hidden by cloud, but our guide rerouted us to a wonderful tea house.'
    ),
    r(
      'marcus.lee@example.com',
      4,
      70,
      'Superb itinerary and hotels. Tokyo days are packed, so bring comfortable shoes. The Nara deer park was more fun than expected. Only small issue: the Shinjuku food tour started later than listed, which pushed dinner back.'
    ),
  ],
  'paris-art-architecture-and-seine-river-romance': [
    r(
      'elena.rossi@example.com',
      5,
      13,
      'The Louvre with an art historian rather than a scripted guide changed the entire experience. We spent twenty minutes on four paintings and learned more than in a week of audio guides. The Seine dinner cruise was genuinely good food, too.'
    ),
    r(
      'hannah.brooks@example.com',
      5,
      48,
      'Versailles gardens in the morning before the crowds was the right call. Our hotel in Saint-Germain was small, stylish and perfectly placed. The team booked a last-minute Montmartre walking tour for us and it was excellent.'
    ),
    r(
      'rohan.kapoor@example.com',
      4,
      91,
      'A lovely introduction to Paris. Eiffel Tower summit is spectacular but expect airport-style security queues. The bistro recommendation near our hotel was the best meal of the trip. Would have liked clearer meeting-point instructions on day one.'
    ),
  ],
  'dubai-futuristic-wonders-and-desert-glamping': [
    r(
      'aisha.rahman@example.com',
      5,
      8,
      'Level 148 at sunset is worth the ticket. The desert camp was the surprise highlight — dune bashing, then a quiet dinner under the stars with no light pollution. Our guide was a brilliant storyteller.'
    ),
    r(
      'arjun.desai@example.com',
      4,
      33,
      'Very smooth five days. Museum of the Future needs to be booked well in advance and the team handled it. The old Dubai souk walk was a nice contrast to the skyscrapers. Hotel breakfast was excellent.'
    ),
    r(
      'maya.fernandes@example.com',
      5,
      61,
      'Travelled solo and felt completely looked after. Transfers were always early, and the concierge answered WhatsApp questions within minutes. The abra ride across the creek at dusk was a small, perfect moment.'
    ),
  ],
  'varanasi-and-rishikesh-spiritual-journey': [
    r(
      'kabir.singh@example.com',
      5,
      10,
      'The private boat for Ganga Aarti was the right way to experience it — close enough to feel the drums, far enough from the crush. Our guide in Varanasi grew up near the ghats and told stories you will not find in a book.'
    ),
    r(
      'ananya.mehta@example.com',
      5,
      36,
      'Rishikesh was the reset I needed. The ashram was simple and peaceful, the morning pranayama session was excellent, and there was no pressure to join anything. The transition from Varanasi’s intensity to Himalayan quiet was well planned.'
    ),
    r(
      'priya.nair@example.com',
      4,
      78,
      'Deeply moving trip. Be prepared for early starts and a lot of walking in Varanasi. The Sarnath visit was thoughtfully timed. Food was pure vegetarian and genuinely delicious. I would return with my mother.'
    ),
  ],
  'amritsar-golden-temple-and-heritage-trail': [
    r(
      'kabir.singh@example.com',
      5,
      5,
      'Seeing the Golden Temple at night, then again at dawn, was worth the whole trip. The langar service was humbling and our host explained the history with real care. Wagah was loud and theatrical — go for the atmosphere, not the politics.'
    ),
    r(
      'maya.fernandes@example.com',
      5,
      27,
      'Short trip, huge impact. The heritage hotel was beautiful and the food walk around Lawrence Road was a highlight. Everything ran on time, including a very early airport transfer. I only wish I had booked an extra day.'
    ),
    r(
      'rohan.kapoor@example.com',
      4,
      64,
      'A well-judged three days. Jallianwala Bagh is sobering and handled respectfully. Wagah seating involves a lot of waiting in the sun, so carry water. The team were responsive and the hotel was excellent value.'
    ),
  ],
};
