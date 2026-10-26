// About Us page content. Counts come from the knowledge base in app/knowledge-base
// (zone tables in each country file) and are updated by hand when a market changes.

export interface Market {
  name: string;
  /** Knowledge-base country id, for its flag (lib/flags.tsx). */
  country: string;
  structure: string;
  zones: string[];
}

export const STATS: Array<{ value: string; label: string }> = [
  { value: '~1,800', label: 'pages of cultural research' },
  { value: '41', label: 'Markdown files in the knowledge base' },
  { value: '20', label: 'markets' },
  { value: '120+', label: 'regions and zones' },
  { value: '104', label: 'venue profiles' },
  { value: '158', label: 'documented celebrations' },
  { value: '12', label: 'lighting presets' },
];

export const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'You write the brief',
    body: 'Choose the country and region, the product, the hero dish, a side and the occasion. The brief decides the product. The region never does.',
  },
  {
    title: 'A regional expert reads the files',
    body: 'A cultural agent acting as a regional food stylist reads the knowledge base for your market: the country file first, then the regional file, then the brand and tableware references. Country files run up to 190,000 characters, so each step gets a focused excerpt of the sections that matter for your dish, with their headings kept so every suggestion can name its source.',
  },
  {
    title: 'You shape the scene',
    body: 'Time and place, preparation, plating, sides and camera. At each step the agent offers options grounded in the files and says which section it relied on. If something isn’t covered, it says so rather than guessing. Any “never stage” rule in a file is respected.',
  },
  {
    title: 'The table is laid out in 3D',
    body: 'A layout solver places every item to real-world scale, following the tableware reference and the product guidelines. It checks the hard rules (the hero zone, the depth hierarchy, clearance around the bottle), builds up to three compliant tablescapes and ranks them by house style.',
  },
  {
    title: 'You approve a sketch',
    body: 'The chosen layout becomes a detailed black-and-white pencil sketch, seen through the photo’s camera. Mark each item Working or Change, add notes, and redraw as often as you need. Nothing moves to the photo until you approve.',
  },
  {
    title: 'The story is written',
    body: 'The agent writes the scene as a food stylist’s brief, broken into segments: the main dish, each side, the product, the environment, plating and tableware, how the drink is served, and the camera. A list of cultural do’s and don’ts travels with it.',
  },
  {
    title: 'The photo is made',
    body: 'The approved 3D layout, photos of the real product and its poured glass, and the story segments go to the image model together, so the composition you signed off on is the one you get. Lighting is chosen from the scene, by venue and time of day, never picked by hand.',
  },
  {
    title: 'Every rating teaches the system',
    body: 'The image is checked against the story. You rate each item from 1 to 5 on six qualities: matches the brief, culturally authentic, looks appealing, photoreal, placement and scale, and lighting. A learning agent reads the pattern, works out whether a miss came from a gap in the knowledge base or from the prompt, and drafts a fix. Edits to the knowledge base go live only after a person approves them.',
  },
];

export const ANATOMY: Array<{ term: string; body: string }> = [
  { term: 'Trusted content', body: 'Table-setting, bread, condiment and plating norms that hold across the country.' },
  { term: 'Visual and plating norms', body: 'Doneness, char, colour palette and plating style, written for the camera.' },
  {
    term: 'Environment and staging scenes',
    body: 'The same eight scenarios in every market, from lunch at home for one to dinner out for three, so markets can be compared.',
  },
  {
    term: 'Venue profiles',
    body: 'What the soft-focus background must show: the building, the light, the furniture, how the table is set, what image models wrongly add, and a ready-to-use prompt line.',
  },
  {
    term: 'Celebrations and large gatherings',
    body: 'The big shared table as a snapshot, with only a few place settings in frame.',
  },
  { term: 'Game night', body: 'Watch parties and social game nights, with nothing legible on screen and no team crests or kits.' },
  {
    term: 'Dish catalog',
    body: 'Every dish with its vessel, sides, utensils and eating customs, the dishes it could be confused with, and a composition and proportions block: what dominates the plate, piece sizes, counts, arrangement and how full the vessel is.',
  },
  {
    term: 'Gap log, candidate queue and research log',
    body: 'What is still unconfirmed, what the next pass should tackle, and every source consulted. Unconfirmed facts are flagged, never guessed.',
  },
];

export const FILES: Array<{ title: string; file?: string; body: string }> = [
  {
    title: 'Country file schema',
    file: 'country-file-schema.md',
    body: 'The rulebook every market follows: how to test whether a country needs regional files, which sections a file must hold and in what order, the fields every dish carries, how sources are ranked and tagged for confidence, and the audit a file must pass before it is called done. Uruguay was the pilot it was built from; the United States, the most complex market, stress-tested it.',
  },
  {
    title: 'Product guidelines',
    body: 'How the product sits on the table: the hero zone, the depth hierarchy, the real can and bottle dimensions sold in each market, clearance around shared bottles, and how the product is chosen. Pack sizes differ more than you’d expect, from 355 mL cans in Mexico to 350 mL in Japan and 250 mL in Pakistan.',
  },
  {
    title: 'Tableware and composition reference',
    file: 'tableware-composition-reference.md',
    body: 'Plate, bowl and platter sizes, place-setting structure, spacing, vessel shape and orientation, and a validation checklist. It is the scale anchor that keeps a side dish from looking like a main.',
  },
  {
    title: 'Image generation pipeline',
    file: 'image-generation-pipeline.md',
    body: 'The end-to-end architecture from brief to validated image, including the checks before and after generation and the scoring criteria for brand, creative quality and cultural authenticity.',
  },
  {
    title: 'Market roadmap and readiness checklist',
    file: 'market-roadmap.md',
    body: 'Live trackers of where each market stands, what was verified, and what is still open across the knowledge base and the pipeline.',
  },
  {
    title: 'Rule sets',
    file: 'rules/*.json',
    body: 'Seven rule files sit alongside the Markdown: camera options, lighting presets, glassware, food styling, plate sizes, tableware style and layout preferences.',
  },
];

export const MARKETS: Market[] = [
  {
    name: 'United States',
    country: 'united_states',
    structure: 'National file + 13 regional files',
    zones: ['Northeast', 'Mid-Atlantic', 'South', 'Appalachia', 'Florida', 'Gulf South', 'Midwest', 'Texas', 'New Mexico', 'Arizona', 'West Coast', 'Pacific Northwest', 'Hawaii'],
  },
  {
    name: 'United Kingdom',
    country: 'united_kingdom',
    structure: 'National file + Scotland file',
    zones: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  },
  {
    name: 'Germany',
    country: 'germany',
    structure: '8 regions',
    zones: ['Bavaria', 'Baden-Württemberg', 'Rhineland & NRW', 'Hesse & Frankfurt', 'The Palatinate', 'The North', 'Berlin & Brandenburg', 'Saxony, Thuringia & the East'],
  },
  {
    name: 'Spain',
    country: 'spain',
    structure: '6 zones + Canary Islands',
    zones: ['Atlantic Northwest', 'North', 'Catalonia & Balearics', 'Valencia & Murcia', 'Andalusia', 'Centre', 'Canary Islands'],
  },
  {
    name: 'Mexico',
    country: 'mexico',
    structure: '7 zones',
    zones: ['North', 'Northwest Pacific', 'West & Bajío', 'Centre', 'Gulf', 'South', 'Yucatán Peninsula'],
  },
  {
    name: 'Argentina',
    country: 'argentina',
    structure: '7 zones',
    zones: ['Buenos Aires', 'Pampa & southern Litoral', 'Córdoba & centre', 'Northwest', 'Northeast & Litoral', 'Cuyo', 'Patagonia'],
  },
  {
    name: 'Brazil',
    country: 'brazil',
    structure: '7 zones',
    zones: ['São Paulo', 'Rio de Janeiro & Espírito Santo', 'Minas Gerais & Centre-West', 'South', 'Bahia', 'Northeast', 'North & Amazon'],
  },
  {
    name: 'Uruguay',
    country: 'uruguay',
    structure: 'National file, the pilot market',
    zones: ['Montevideo & the coast', 'The interior'],
  },
  {
    name: 'Turkey',
    country: 'turkey',
    structure: '7 zones',
    zones: ['Istanbul & Marmara', 'Aegean', 'Mediterranean', 'Central Anatolia', 'Black Sea', 'Southeast Anatolia', 'Eastern Anatolia'],
  },
  {
    name: 'South Africa',
    country: 'south_africa',
    structure: '5 zones',
    zones: ['Western Cape', 'KwaZulu-Natal', 'Gauteng & Highveld', 'Eastern Cape', 'Interior & North'],
  },
  {
    name: 'Nigeria',
    country: 'nigeria',
    structure: '6 zones',
    zones: ['Lagos & Southwest', 'Southeast', 'Niger Delta', 'Cross River & Akwa Ibom', 'Middle Belt & Abuja', 'North'],
  },
  {
    name: 'Iraq',
    country: 'iraq',
    structure: '5 zones',
    zones: ['Baghdad & Central', 'South & Basra', 'North & Mosul', 'Kurdistan', 'West & Anbar'],
  },
  {
    name: 'United Arab Emirates',
    country: 'united_arab_emirates',
    structure: '5 zones',
    zones: ['Dubai', 'Abu Dhabi', 'Al Ain & interior', 'Sharjah & Northern Emirates', 'East Coast'],
  },
  {
    name: 'China',
    country: 'china',
    structure: '8 zones',
    zones: ['North & Beijing', 'Shanghai & Jiangnan', 'Guangdong', 'Sichuan & Chongqing', 'Hunan', 'Northeast', 'Northwest & Xinjiang', 'Yunnan & the Southwest'],
  },
  {
    name: 'Japan',
    country: 'japan',
    structure: '8 zones',
    zones: ['Kantō', 'Kansai', 'Chūbu & Tōkai', 'Chūgoku & Shikoku', 'Kyūshū', 'Okinawa', 'Hokkaidō', 'Tōhoku'],
  },
  {
    name: 'India',
    country: 'india',
    structure: '9 zones',
    zones: ['Punjab & Delhi', 'Heartland', 'Mumbai, Maharashtra & Goa', 'Gujarat & Rajasthan', 'Tamil Nadu & Karnataka', 'Kerala', 'Hyderabad & Andhra', 'Bengal & Odisha', 'Northeast'],
  },
  {
    name: 'Pakistan',
    country: 'pakistan',
    structure: '6 zones',
    zones: ['Punjab & Lahore', 'Islamabad & Potohar', 'Sindh & Karachi', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan & the North'],
  },
  {
    name: 'Bangladesh',
    country: 'bangladesh',
    structure: '6 zones',
    zones: ['Dhaka', 'Old Dhaka', 'Chattogram & the coast', 'Sylhet', 'Rajshahi & the North', 'Khulna & Barishal'],
  },
  {
    name: 'Thailand',
    country: 'thailand',
    structure: '5 zones',
    zones: ['Bangkok & Central Plains', 'North (Lanna)', 'Northeast (Isan)', 'South & Andaman', 'Deep South'],
  },
  {
    name: 'Philippines',
    country: 'philippines',
    structure: '7 zones',
    zones: ['Metro Manila & Luzon', 'Ilocos & Cordillera', 'Bicol', 'Western Visayas', 'Cebu & Bohol', 'Davao & Mindanao', 'Bangsamoro'],
  },
  {
    name: 'Indonesia',
    country: 'indonesia',
    structure: '6 zones',
    zones: ['Jakarta & West Java', 'Central Java & Yogyakarta', 'East Java & Madura', 'Sumatra', 'Bali', 'Sulawesi & the east'],
  },
];
