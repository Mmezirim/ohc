// Content seeded into MySQL by `npm run db:setup`.
// Wording is carried over verbatim from the original WordPress site.
// The API also serves this data read-only when no database is configured, so the site still renders.

export const settings = {
  site_name: 'Oak House Church',
  footer_blurb:
    'A community of faith, hope, and love, Where every soul is welcomed, valued, and empowered to live out God’s purpose.',
  contact_email: 'contact@oakhousechurch.org',
  contact_phone: '+234 800 GRACE',
  giving_email: 'give@oakhousechurch.org',
  ict_email: 'dev@oakhousechurch.org',
  social_facebook: '',
  social_twitter: '',
  social_youtube: 'https://www.youtube.com/channel/UCFA5ZQKPtYYMCzRzOq7rA3g/',
  social_instagram: '',
  youtube_channel_id: 'UCFA5ZQKPtYYMCzRzOq7rA3g',
  youtube_live_channel_id: 'UCu27rtNX51H-aHvH4IFRbVA',
  home_gallery: JSON.stringify([
    '/images/IMG-20260629-WA0076.jpg',
    '/images/IMG-20260629-WA0030.jpg',
    '/images/IMG-20260629-WA0073.jpg',
    '/images/IMG-20260629-WA0044.jpg',
  ]),
  office_address: '112, Commercial Avenue, off Herbert Macaulay Way, Yaba, Lagos',
  pastor_quote_author: 'Rev Oyiks Alfred',
  pastor_quote:
    '“God did not bring you this far to leave you. Your best days are not behind you — they are ahead.”',
};

export const serviceTimes = [
  { title: 'Upper Room Experience (Sunday)', time_label: '7:00 AM — 9:00 AM' },
  { title: 'Sunday Service', time_label: '9:00 PM — 12:00 PM' },
  { title: 'Bible Study (Thursdays)', time_label: '6:00 PM — 8:00 PM' },
  { title: 'Prayer Meeting (Fridays)', time_label: '6pm - 8pm' },
];

const embed = (pb) => `https://www.google.com/maps/embed?pb=${pb}`;

export const locations = [
  {
    slug: 'yaba',
    name: 'Yaba HQ',
    badge: 'church',
    area: 'Yaba, Lagos',
    address: '112, Commercial Avenue, off Herbert Macaulay Way, Yaba, Lagos',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Fred Akpu', 'Reverend Oyiks Alfred'],
    schedule: ['Thursday Bible Study — 5pm', 'Friday Prayer Meeting — 6pm', 'Sunday Service — 9am'],
    phone: '07087499909',
    map_embed: embed('!1m18!1m12!1m3!1d3964.134!2d3.3835481!3d6.5040175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8cf4bb3ee2bf%3A0x618a06f3dc6b5a7a!2s112%20Commercial%20Ave%2C%20Oyadiran%20Estate%20101245%2C%20Lagos!5e0!3m2!1sen!2sng!4v1700000001'),
    map_dir: 'https://www.google.com/maps/dir/6.5319092,3.3952586/112+Commercial+Ave,+Oyadiran+Estate+101245,+Lagos/@6.5190799,3.3760417,15z',
  },
  {
    slug: 'ikota',
    name: 'Ikota',
    badge: 'church',
    area: 'Ajah, Lagos',
    address: 'Ikota Housing Estate Road 44, by 2nd Transformer, Ikota, Ajah',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Dolapo Onah', 'Pastor Daniel Akhibor'],
    schedule: ['Wednesday Bible Study — 6pm', 'Sunday Service — 9am'],
    phone: '08035710569',
    map_embed: embed('!1m18!1m12!1m3!1d3964.9!2d3.5547017!3d6.4473443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf70e6aaaaaab%3A0xcdbf4fb27a9e9bbc!2sIkota+Villa+Residential+Estate!5e0!3m2!1sen!2sng!4v1700000002'),
    map_dir: 'https://www.google.com/maps/dir/6.5317293,3.3943749/Ikota+Villa+Residential+Estate,+CHW3%2BWVP,+Rd+3,+Eti-Osa+106104,+Lekki,+Lagos',
  },
  {
    slug: 'igando',
    name: 'Igando',
    badge: 'church',
    area: 'Agege, Lagos',
    address: '10 Lasu-Isheri Rd, Igando 102213, Lagos',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Ebele Onyekwelu'],
    schedule: ['Wednesday Bible Study — 6pm', 'Sunday Service — 9am'],
    phone: '08035618950',
    map_embed: embed('!1m18!1m12!1m3!1d3963.7!2d3.2373379!3d6.5493109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b853f7605aaa9%3A0x21a992106e2c672f!2s10+Lasu-Isheri+Rd%2C+Igando+102213%2C+Lagos!5e0!3m2!1sen!2sng!4v1700000003'),
    map_dir: 'https://www.google.com/maps/dir/6.5317293,3.3943749/10+Lasu-Isheri+Rd,+Igando+102213,+Lagos',
  },
  {
    slug: 'oniru',
    name: 'Oniru',
    badge: 'church',
    area: 'Lekki, Lagos',
    address: 'Coastal Road, off Akiogun Road, behind Rain Oil Petrol Station, Oniru, Lekki',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Antonia Oguntubi', 'Pastor Akachukwu Okafor'],
    schedule: ['Wednesday Bible Study — 6pm', 'Sunday Service — 9am'],
    phone: '08033727892',
    map_embed: embed('!1m18!1m12!1m3!1d3965.2!2d3.4573891!3d6.426611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf5340cf0396d%3A0x48a2eb39ff97d6e3!2sPlot+8+Block+116+Akiogun+Rd+Oniru!5e0!3m2!1sen!2sng!4v1700000004'),
    map_dir: 'https://www.google.com/maps/dir/112+Commercial+Avenue,+Lagos/Plot+8,+Block,+116+Akiogun+Rd,+Oniru,+Lekki+106104,+Lagos',
  },
  {
    slug: 'lekki',
    name: 'Lekki Phase 1',
    badge: 'church',
    area: 'Lekki, Lagos',
    address: 'Plot 22B, Godwin Omeme Street, off Chief Collins Estate, Lekki Phase 1',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Adeola Aworinde', 'Pastor Bukola Aworinde'],
    schedule: ['Monday Bible Study — 6pm', 'Sunday Service — 9am'],
    phone: '08137526038',
    map_embed: embed('!1m18!1m12!1m3!1d3965.4!2d3.4779428!3d6.4414814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf45237f8ced1%3Ae1030e35543edb99!2sGodwin+Omene+St+Lekki+Phase+1!5e0!3m2!1sen!2sng!4v1700000005'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/Chief+Collins+Uchidiuno+Street,+Fola+Osibo+Road,+1+Godwin+Omene+St,+Lekki+Phase+1,+Lagos',
  },
  {
    slug: 'sango',
    name: 'Sango Ota',
    badge: 'church',
    area: 'Ogun State',
    address: '37b, Ojuelegba Street, Arinko Road, off Ijoko Road, Sango Ota, Ogun State',
    primary_service: 'Sunday Service — 9am',
    pastors: ['Pastor Charles Ataghoma'],
    schedule: ['Wednesday Bible Study — 6pm', 'Sunday Service — 9am'],
    phone: '08032332974 / 08137777162',
    map_embed: embed('!1m18!1m12!1m3!1d3962.2!2d3.245377!3d6.713243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9948a933f151%3A0x260c35c2b212f181!2sIjoko+Rd+Ota+Ogun+State!5e0!3m2!1sen!2sng!4v1700000006'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/JUMIA+PICK+UP+STATION+IJOKO+ROAD,+SANGO,+OGUN+STATE',
  },
  {
    slug: 'iwaya',
    name: 'Iwaya',
    badge: 'church',
    area: 'Yaba, Lagos',
    address: 'Youth Development Centre, above Adide Supermarket, 24 Iwaya Road, Yaba',
    primary_service: 'Friday Prayer Meeting — 6pm',
    pastors: ['Pastor Sola Olley', 'Pastor Sandra Olley'],
    schedule: ['Wednesday Bible Study — 6pm', 'Friday Prayer Meeting — 6pm'],
    phone: '0806527690 / 08033883030',
    map_embed: embed('!1m18!1m12!1m3!1d3964.0!2d3.387287!3d6.5079357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8cf22f99c917%3Af2ed4322d10c90a5!2s24+Iwaya+Rd+Yaba!5e0!3m2!1sen!2sng!4v1700000007'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/Addide+Iwaya,+Onike+Rd,+Yaba,+Lagos+100283,+Lagos',
  },
  {
    slug: 'ebute',
    name: 'Ebute Metta',
    badge: 'church',
    area: 'Lagos Mainland',
    address: '79 Ondo Street, Adekunle, Lagos',
    primary_service: 'Wednesday Bible Study — 5:30pm',
    pastors: ['Pastor Adekunle Ojo'],
    schedule: ['Monday Prayer Meeting — 5:30pm', 'Wednesday Bible Study — 5:30pm'],
    phone: '08038221774',
    map_embed: embed('!1m18!1m12!1m3!1d3964.3!2d3.3895748!3d6.4876158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c9b5222f60d%3A0x9f3b973a50b8a041!2s79+Ondo+St+Adekunle+Lagos!5e0!3m2!1sen!2sng!4v1700000008'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/79+Ondo+Street,+Lagos',
  },
  {
    slug: 'herbert',
    name: 'Herbert Macaulay',
    badge: 'church',
    area: 'Yaba, Lagos',
    address: '238 Herbert Macaulay Road, Yaba, Lagos',
    primary_service: 'Wednesday Bible Study — 6pm',
    pastors: ['Pastor Debbie Bryan', 'Pastor Michael Aluko'],
    schedule: ['Wednesday Bible Study — 6pm', 'Friday Prayer Meeting — 6pm'],
    phone: '08069268150',
    map_embed: embed('!1m18!1m12!1m3!1d3964.1!2d3.3783585!3d6.4996285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c61b889ca43%3Ace3295b07946a12a!2s238+Herbert+Macaulay+Way+Alagomeji+Yaba!5e0!3m2!1sen!2sng!4v1700000009'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/238+Herbert+Macaulay+Wy,+Alagomeji-Yaba,+Lagos+101241,+Lagos',
  },
  {
    slug: 'westgate',
    name: 'West Gate (Yoruba)',
    card_name: 'West Gate Yoruba',
    badge: 'church',
    area: 'Yaba, Lagos',
    address: '112, Commercial Avenue, off Herbert Macaulay Way, Yaba, Lagos',
    primary_service: 'Sunday Service — 7am',
    pastors: ['Pastor Akin Afolabi', 'Deaconess Moji Ogundipe'],
    schedule: ['Tuesday Bible Study — 5pm', 'Sunday Service — 7am'],
    phone: '08020772063',
    map_embed: embed('!1m18!1m12!1m3!1d3964.134!2d3.3835481!3d6.5040175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8cf4bb3ee2bf%3A0x618a06f3dc6b5a7a!2s112+Commercial+Ave+Oyadiran+Estate+Lagos!5e0!3m2!1sen!2sng!4v1700000010'),
    map_dir: 'https://www.google.com/maps/dir/6.5319092,3.3952586/112+Commercial+Ave,+Oyadiran+Estate+101245,+Lagos',
  },
  {
    slug: 'eastgate',
    name: 'East Gate (Igbo)',
    card_name: 'East Gate Igbo',
    badge: 'church',
    area: 'Makoko, Yaba',
    address: 'Adekunle Anglican Primary School, 25 Makoko Road, Yandoro, Makoko, Yaba',
    primary_service: 'Wednesday — 5pm to 6:30pm',
    pastors: ['Pastor Yakubu Wuyep'],
    schedule: ['Wednesday — 5pm to 6:30pm'],
    phone: '08023592706',
    map_embed: embed('!1m18!1m12!1m3!1d3964.0!2d3.3852541!3d6.4955135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c8edc8ebce7%3A0x2fa1b67e152ad256!2sMakoko+Road+Yaba+Lagos!5e0!3m2!1sen!2sng!4v1700000011'),
    map_dir: 'https://www.google.com/maps/dir/6.5039925,3.3833513/F9WP%2B642,+Yaba,+Oworonshoki+101245,+Lagos',
  },
  {
    slug: 'unilag',
    name: 'Campus Fellowship (UNILAG)',
    card_name: 'Campus Fellowship UNILAG',
    badge: 'campus',
    area: 'Akoka, Yaba',
    address: 'University of Lagos, University Road, Lagos Mainland, Akoka, Yaba',
    primary_service: 'Wednesday Bible Study — 6pm',
    pastors: ['Olive Alfred', 'Wisdom'],
    schedule: ['Wednesday Bible Study — 6pm', 'Friday Prayer Meeting — 6pm'],
    phone: '09096262981 / 07030733835',
    note: 'Youth Leap Foundation (Unilag)',
    map_embed: embed('!1m18!1m12!1m3!1d3963.9!2d3.3898447!3d6.515759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8d24c04d3e75%3A0x7347f1a6be13e004!2sUniversity+of+Lagos!5e0!3m2!1sen!2sng!4v1700000012'),
    map_dir: 'https://www.google.com/maps/dir/6.5039925,3.3833513/University+of+Lagos,+University+Road+Lagos+Mainland+Akoka,+Yaba,+Lagos',
  },
  {
    slug: 'yabatech',
    name: 'Campus Fellowship (YABATECH)',
    card_name: 'Campus Fellowship YABATECH',
    badge: 'campus',
    area: 'Yaba, Lagos',
    address: 'Elijah Hall, First Floor Alumni Building, Yaba College of Technology',
    primary_service: 'Wednesday Bible Study — 5:30pm',
    pastors: ['Victor Okpara Obinna', 'Nneka Ogbonnia'],
    schedule: ['Wednesday Bible Study — 5:30pm', 'Friday Prayer Meeting — 6pm'],
    phone: '09053106590',
    note: 'Youth Leap Foundation (Yabatech)',
    map_embed: embed('!1m18!1m12!1m3!1d3963.95!2d3.3755055!3d6.5193897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8d38dc272f83%3A0x943d9d32f90bd39c!2sYabatech+Alumni+Building!5e0!3m2!1sen!2sng!4v1700000013'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/Yabatech+Alumni+Building',
  },
  {
    slug: 'lasu',
    name: 'Campus Fellowship (LASU)',
    card_name: 'Campus Fellowship LASU',
    badge: 'campus',
    area: 'Ojo, Lagos',
    address: 'Lagos State University (LASU), Ojo Campus, Iyana-Iba',
    card_address: 'Lagos State University, Ojo Campus, Iyana-Iba',
    primary_service: 'Wednesday Bible Study — 4pm–6pm',
    pastors: ['Pastor Madu Chukwuebuka'],
    schedule: ['Wednesday Bible Study — 4pm–6pm', 'Friday Prayer Meeting — 4pm–6pm'],
    phone: '08025883335',
    map_embed: embed('!1m18!1m12!1m3!1d3965.5!2d3.2003007!3d6.4663553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8696500590b1%3Af27b47e41fad6dab!2sLagos+State+University!5e0!3m2!1sen!2sng!4v1700000014'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/Lagos+State+University,+Lasu+Main+Rd,+Ojo,+Lagos+102101,+Lagos',
  },
  {
    slug: 'accra',
    name: 'Accra, Ghana',
    badge: 'intl',
    area: 'Accra, Ghana',
    address: 'Prime Wood Street GA-091-1500, Abelempke, Accra, Ghana',
    primary_service: 'Sunday Service — 2:30pm',
    pastors: ['Stella Kumah'],
    schedule: ['Wednesday Bible Study — 6pm', 'Sunday Service — 2:30pm'],
    phone: '+233 544 320 061',
    map_embed: embed('!1m18!1m12!1m3!1d3971.0!2d-0.2338729!3d5.6258258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf997274943ae7%3A0x49131716bbc1e7c3!2sAchimota+Ghana!5e0!3m2!1sen!2sgh!4v1700000015'),
    map_dir: 'https://www.google.com/maps/dir/6.5355182,3.3828323/Prime+wood+limited,+JQG8%2BCF2,+Achimota,+Ghana',
  },
];

export const events = [
  {
    slug: 'night-of-power',
    title: 'Night of Power',
    category: 'Worship',
    description:
      'Join us for an extended evening of praise, worship, and corporate prayer as we seek God’s face together.',
    image: '/images/nightofpower.jpeg',
  },
  {
    slug: 'his-and-hers',
    title: 'His & Hers',
    category: 'Connection',
    schedule: 'Weekly',
    audience: 'Youths and young adults',
    description:
      'His & Hers is a weekly gathering for youths and young adults to explore relationships, purpose, and personal growth through open discussions and faith-based guidance, creating a space to learn, connect, and build healthy, God-centered relationships.',
    image: '/images/hishers.jpeg',
  },
  {
    slug: 'night-of-brooding',
    title: 'Night of Brooding',
    category: 'Worship',
    description:
      'A time of deep reflection, prayer, and spiritual alignment — creating space to hear God and grow intentionally.',
    image: '/images/nightofbrooding.jpeg',
  },
];

export const ministries = [
  {
    title: 'Prayer Ministry',
    description: 'Intercede for the church, city, and nations. Join our dedicated team of prayer warriors.',
    icon: 'pray',
  },
  {
    title: 'Worship & Arts',
    description:
      "Singers, musicians, dancers, and creatives - use your gifts to lead others into God's presence.",
    icon: 'music',
  },
  {
    title: 'Media',
    description:
      'The Media Team brings services to life through sound, visuals, and digital coverage, helping share the message beyond the walls.',
    icon: 'video',
  },
  {
    title: 'Outreach & Missions',
    description: 'Taking the love of God beyond our walls - locally and to the nations of the world.',
    icon: 'globe',
  },
];

export const beliefs = [
  {
    title: 'The Bible',
    description: 'We hold Scripture to be the inspired Word of God — our guide for faith, life, and truth in every generation.',
    icon: 'cross',
  },
  {
    title: 'Salvation by Grace',
    description: "Salvation is God's gift, received through faith in Jesus Christ — not by works, but by His grace alone.",
    icon: 'pray',
  },
  {
    title: 'One God, Trinity',
    description: 'We believe in one God — Father, Son, and Holy Spirit — distinct in person yet perfectly one in nature and purpose.',
    icon: 'target',
  },
  {
    title: 'The Holy Spirit',
    description: 'The Spirit dwells in every believer, bringing transformation, spiritual gifts, and the fruit of a life made new.',
    icon: 'spirit',
  },
  {
    title: 'The Church',
    description: 'We are one body — a community called to worship, grow in discipleship, and demonstrate love to the world.',
    icon: 'church',
  },
  {
    title: 'Eternal Hope',
    description: "We live in the certain hope of Christ's return, the resurrection of the dead, and life everlasting with God.",
    icon: 'star',
  },
];

export const leaders = [
  { name: 'PASTOR ALFRED AKPU', role: 'Senior Pastor, Oak House Church', photo: '/images/PST-FRED-500x600-1.jpg' },
  { name: 'Rev Oyiks Alfred', role: 'Lead Pastor, Yaba Chapter', photo: '/images/revoyiks.jpeg' },
  { name: 'Pastor Dolapo Onah', role: 'Lead Pastor, Ikota Chapter', photo: '/images/PST-DOLAPO-500x600-1.jpg' },
  { name: 'Pastor Antonia Oguntubi', role: 'Lead Pastor, Oniru Chapter', photo: '/images/PST-ANTONIA-500x600-1.jpg' },
  { name: 'Pastor Akachuwky Okafor', role: 'Asst. Pastor, Oniru Chapter', photo: '/images/PST-AKACHUKWU-500x600-1.jpg' },
  { name: 'Pastor Ebele Onyekwelu', role: 'Lead Pastor, Igando Chapter', photo: '/images/PST-EBELLE-500x600-1.jpg' },
  { name: 'Pastor Munachimso Ukamah', role: 'Asst. Pastor, Igando Chapter', photo: '/images/PST-MUNACHISOM-500x600-1.jpg' },
  { name: 'Pastor Charles Ataghoma', role: 'Lead Pastor, Sango-Ota Chapter', photo: '/images/PST-CHARLES-500x600-1.jpg' },
  { name: 'Pastor Amarachi Ataghoma', role: 'Asst. Pastor, Sango-Ota Chapter', photo: '/images/PST-AMARA-500x600-1.jpg' },
];

// NOTE: kept verbatim from the live site, which still contains template copy here
// ("Grace Community Church", out-of-order years). Edit in the `timeline` table.
export const timeline = [
  {
    year_label: '2017',
    title: 'Founded in faith',
    body: 'A small group of 12 families gathered in a home to pray and plant what would become Grace Community Church.',
  },
  {
    year_label: '',
    title: 'First sanctuary dedicated',
    body: 'At the time, it seemed small and insignificant,  just a seed planted in faith, yet hidden within that seed was a divine purpose that would touch lives, transform destinies and spread across nations.',
  },
  {
    year_label: '2020',
    title: 'Community',
    body: 'Like the tiny arcorn that eventually becomes a mighty oak tree, the dream began to grow.',
  },
  {
    year_label: '2008',
    title: 'New sanctuary built',
    body: 'As our congregation grew past 1,200 members, we built a larger worship space designed for the next century of ministry.',
  },
  {
    year_label: '2019',
    title: 'Global missions launched',
    body: 'We sent our first long-term missionaries to East Africa, beginning a partnership that continues to this day.',
  },
  {
    year_label: 'Today',
    title: 'Still growing, still serving',
    body: 'Today our church family spans generations, cultures, and backgrounds — united by one hope and one calling.',
  },
];

export const givingAccounts = [
  {
    account_group: 'local', purpose: 'Tithe & General Offering', icon: 'wallet',
    bank: 'First Bank Nigeria', account_name: 'Oak House Church', account_number: '3012345678',
    code_label: 'Sort Code / Bank', code_display: 'First Bank — 011', code_copy: '011',
  },
  {
    account_group: 'local', purpose: 'Building Fund', icon: 'home',
    bank: 'Zenith Bank', account_name: 'Oak House Church Building Fund', account_number: '2098765432',
    code_label: 'Sort Code / Bank', code_display: 'Zenith Bank — 057', code_copy: '057',
  },
  {
    account_group: 'local', purpose: 'Missions & Outreach', icon: 'globe',
    bank: 'GT Bank', account_name: 'Oak House Church Missions', account_number: '0123456789',
    code_label: 'Sort Code / Bank', code_display: 'GT Bank — 058', code_copy: '058',
  },
  {
    account_group: 'dom', purpose: 'US Dollar (USD)', icon: 'dollar',
    bank: 'First Bank Nigeria', account_name: 'Oak House Church — USD Dom.', account_number: '3087654321',
    code_label: 'SWIFT / BIC Code', code_display: 'FBNINGLA', code_copy: 'FBNINGLA',
    bank_address: 'Samuel Asabia House, 35 Marina, Lagos',
  },
  {
    account_group: 'dom', purpose: 'British Pound (GBP)', icon: 'pound',
    bank: 'Zenith Bank', account_name: 'Oak House Church — GBP Dom.', account_number: '2056789012',
    code_label: 'SWIFT / BIC Code', code_display: 'ZENBNILA', code_copy: 'ZENBNILA',
    bank_address: 'Plot 84, Ajose Adeogun St, Victoria Island, Lagos',
  },
];

export const featuredMessages = [
  { title: 'Sunday Service', preacher: 'Pastor Fred', message_date: '2026-03-22' },
  { title: 'Bible Study and Communion Service', preacher: 'Rev Oyiks Alfred', message_date: '2026-03-19' },
  { title: 'How To Add Virtue To Faith', preacher: 'Pastor Akin Afolabi', message_date: '2026-03-18' },
];

export const posts = [
  {
    slug: 'understanding-the-conscience-rev-oyiks-alfred',
    title: 'Understanding The Conscience Rev Oyiks Alfred',
    featured_image: '/images/rev3.jpg',
    youtube_id: 'dkANbYZcnW0',
    published_at: '2026-03-19 21:40:54',
  },
  {
    slug: 'how-to-build-faith-pastor-john-ndubuisi',
    title: 'How To Build Faith Pastor John Ndubuisi',
    featured_image: '/images/pst1.jpg',
    youtube_id: 'Z2LVTpVQ3L8',
    published_at: '2026-03-19 21:36:41',
  },
  {
    slug: 'overcoming-ungodliness-through-faith-pastor-akin-afolabi',
    title: 'Overcoming Ungodliness Through Faith – Pastor Akin Afolabi',
    featured_image: '/images/pastakin2.jpg',
    youtube_id: 'QyfiLaNm11Q',
    published_at: '2026-03-19 21:33:30',
  },
];

// Clusters (small groups) — supplied by the church, October 2026.
export const clusters = [
  { name: 'Akoka cluster', chapter: 'Yaba', area: 'Akoka', leader: 'Samuel Moses', email: 'jerusalemsamuel5@gmail.com', phone: '09072734824' },
  { name: 'Apapa cluster', chapter: 'Yaba', area: 'Apapa', leader: 'Idris Yusuf', email: 'idrisyusuf258@gmail.com', phone: '08058263692' },
  { name: 'Bariga cluster', chapter: 'Yaba', area: 'Bariga', leader: 'Mercy Oludasa', email: 'phebeanmercy@gmail.com', phone: '07081687804' },
  { name: 'Fadeyi cluster', chapter: 'Yaba', area: 'Fadeyi', leader: 'Precious Ehiri', email: 'preciousokechukwu@gmail.com', phone: '07033481921' },
  { name: 'Herbert Macaulay Fellowship cluster', chapter: 'Yaba', area: 'Herbert Macaulay', leader: 'Aluko Michael', email: 'michaelaluko437@gmail.com', phone: '08106605692' },
  { name: 'Ifako/Ikeja cluster', chapter: 'Yaba', area: 'Ifako/Ikeja', leader: 'Peace Okpanachi', email: 'peaceokpanachi@gmail.com', phone: '08039546208' },
  { name: 'Ikorodu cluster', chapter: 'Yaba', area: 'Ikorodu', leader: 'Naomi Enuagwuna', email: 'onyekanaomi68@gmail.com', phone: '08162069345' },
  { name: 'Iwaya cluster 1', chapter: 'Yaba', area: 'Iwaya', leader: 'Yeda Budaye', email: 'yedabudaye6@gmail.com', phone: '07038893978' },
  { name: 'Iwaya cluster 2', chapter: 'Yaba', area: 'Iwaya', leader: 'Efezino Ogige', email: 'zizino33@gmail.com', phone: '09065562624' },
  { name: 'Iwaya Fellowship cluster', chapter: 'Yaba', area: 'Iwaya', leader: 'Sandra Olley', email: 'aziegbesandra@gmail.com', phone: '08065276907' },
  { name: 'Ketu cluster', chapter: 'Yaba', area: 'Ketu', leader: 'Linda Abada', email: 'lin4luv2000@yahoo.com', phone: '09056988462' },
  { name: 'Kosofe/Ojodu cluster', chapter: 'Yaba', area: 'Kosofe/Ojodu', leader: 'Ibukunoluwa Bajomo', email: 'ibkbaj@yahoo.com', phone: '08164754039' },
  { name: 'Makoko cluster 1', chapter: 'Yaba', area: 'Makoko', leader: 'Chioma Adelaja', email: 'jaynesparks20@gmail.com', phone: '08029256693' },
  { name: 'Makoko cluster 2', chapter: 'Yaba', area: 'Makoko', leader: 'Celine Udenna Chiezugom', email: 'celineudenna@gmail.com', phone: '08139581259' },
  { name: 'Makoko cluster 3', chapter: 'Yaba', area: 'Makoko', leader: 'Chidinma Iwola', email: 'chidinmaiwola@gmail.com', phone: '09119072037' },
  { name: 'Makoko cluster 5', chapter: 'Yaba', area: 'Makoko', leader: 'Chinwe Emmanuel', email: 'chinwecynthia83@gmail.com', phone: '08024068312' },
  { name: 'Makoko cluster 6', chapter: 'Yaba', area: 'Makoko', leader: 'Alice Robert Shidoo', email: 'iortimalice1992@gmail.com', phone: '08071889674' },
  { name: 'Makoko cluster 7', chapter: 'Yaba', area: 'Makoko', leader: 'John Charles', email: 'johncharlesotoo57@gmail.com', phone: '09055876905' },
  { name: 'Makoko cluster 8', chapter: 'Yaba', area: 'Makoko', leader: 'Gifted Otu', email: 'otugifted007@gmail.com', phone: '08104286370' },
  { name: 'Mushin', chapter: 'Yaba', area: 'Mushin', leader: 'Nzube Nlemedim', email: 'nzubenlemedim@gmail.com', phone: '08140644048' },
  { name: 'Onipanu cluster', chapter: 'Yaba', area: 'Onipanu', leader: 'Febechukwu Nnajiofor', email: 'nnajioforfebechukwu@gmail.com', phone: '09026292746' },
  { name: 'Oshodi cluster', chapter: 'Yaba', area: 'Oshodi', leader: 'Elvis Godson', email: 'elvixg@gmail.com', phone: '08167707448' },
  { name: 'Sabo cluster 2', chapter: 'Yaba', area: 'Sabo', leader: 'Ndifreke John', email: 'johnlarry4real2012@gmial.cm', phone: '08155994253' },
  { name: 'Shomolu cluster 2', chapter: 'Yaba', area: 'Shomolu', leader: 'Oore Akinsika', email: 'phayvhor@gmail.com', phone: '08159945608' },
  { name: 'Surulere cluster 1', chapter: 'Yaba', area: 'Surulere', leader: 'Omolayo Jinadu', email: 'valeriejinadu19@gmail.com', phone: '07089763108' },
  { name: 'Surulere cluster 2', chapter: 'Yaba', area: 'Surulere', leader: 'Bryan Egeni', email: 'acezbryan@gmail.com', phone: '08032469077' },
  { name: 'Surulere cluster 3', chapter: 'Yaba', area: 'Surulere', leader: 'Nneka Jen Olise', email: 'olisejen@gmail.com', phone: '07064409477' },
  { name: 'Surulere cluster 4', chapter: 'Yaba', area: 'Surulere', leader: 'Azuka Ude', email: 'azuka.ugwo@gmail.com', phone: '08034231138' },
  { name: 'Surulere cluster 5', chapter: 'Yaba', area: 'Surulere', leader: 'Oluwaseun Omirin', email: 'seun.omirin@yahoo.com', phone: '08055419359' },
  { name: 'Yaba', chapter: 'Yaba', area: 'Yaba', leader: 'Kella Adesida', email: 'queenkella@gmail.com', phone: '08034889352' },
  { name: 'Yaba Tech', chapter: 'Yaba', area: 'Yaba Tech', leader: 'Victor Okpara', email: 'victorokpara42@gmail.com', phone: '09053106590' },
];
