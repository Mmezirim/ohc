// Every content table the admin panel can edit. The server validates and whitelists columns from
// this registry, and the panel builds its forms from it (GET /api/admin/schema), so there is one
// source of truth for field names, types and rules.

const ICONS = ['pray', 'music', 'video', 'globe', 'cross', 'target', 'spirit', 'church', 'star', 'heart', 'chat', 'hand', 'giftHeart', 'calendar', 'wallet', 'home', 'dollar', 'pound'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const sort = { name: 'sort_order', label: 'Display order', type: 'int', help: 'Lower numbers appear first.' };

export const RESOURCES = {
  locations: {
    label: 'Locations',
    singular: 'location',
    group: 'Content',
    table: 'locations',
    orderBy: 'sort_order, id',
    titleField: 'name',
    subtitleField: 'area',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'slug', label: 'URL slug', type: 'slug', required: true, max: 64, help: 'Lowercase, used in links like /locations?l=yaba' },
      { name: 'badge', label: 'Type', type: 'select', required: true, options: [['church', 'Church'], ['campus', 'Campus fellowship'], ['intl', 'International']] },
      { name: 'area', label: 'Area', type: 'text', required: true, max: 120 },
      { name: 'address', label: 'Address', type: 'textarea', required: true, max: 255 },
      { name: 'primary_service', label: 'Main service', type: 'text', required: true, max: 120, help: 'e.g. Sunday Service — 9am' },
      { name: 'schedule', label: 'Service schedule', type: 'list', help: 'One line per gathering.' },
      { name: 'pastors', label: 'Leadership', type: 'list', help: 'One name per line.' },
      { name: 'phone', label: 'Phone', type: 'text', max: 120, help: 'Separate several numbers with “ / ”.' },
      { name: 'note', label: 'Note', type: 'text', max: 255 },
      { name: 'map_embed', label: 'Google Maps embed URL', type: 'url', max: 2000, help: 'Google Maps → Share → Embed a map → copy the src="…" link.' },
      { name: 'map_dir', label: 'Directions link', type: 'url', max: 2000 },
      { name: 'card_name', label: 'Short name (optional)', type: 'text', max: 120 },
      { name: 'card_address', label: 'Short address (optional)', type: 'text', max: 255 },
      sort,
    ],
  },
  events: {
    label: 'Programs',
    singular: 'program',
    group: 'Content',
    table: 'events',
    orderBy: 'sort_order, id',
    titleField: 'title',
    subtitleField: 'category',
    imageField: 'image',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'slug', label: 'URL slug', type: 'slug', required: true, max: 120, help: 'Used in /programs/your-slug' },
      { name: 'category', label: 'Category', type: 'select', required: true, options: [['Connection', 'Connection'], ['Worship', 'Worship'], ['Serving', 'Serving']] },
      { name: 'image', label: 'Flyer / image', type: 'image', required: true },
      { name: 'description', label: 'Short description', type: 'textarea', required: true, max: 2000 },
      { name: 'details', label: 'About this program', type: 'textarea', max: 5000 },
      { name: 'schedule', label: 'When', type: 'text', max: 160, help: 'e.g. Weekly, or Friday 7 November · 9pm' },
      { name: 'venue', label: 'Venue', type: 'text', max: 255 },
      { name: 'audience', label: 'Who it’s for', type: 'text', max: 255 },
      { name: 'active', label: 'Published', type: 'bool', default: true },
      sort,
    ],
  },
  clusters: {
    label: 'Clusters',
    singular: 'cluster',
    group: 'Content',
    table: 'clusters',
    orderBy: 'chapter, sort_order, name',
    titleField: 'name',
    subtitleField: 'leader',
    fields: [
      { name: 'name', label: 'Cluster name', type: 'text', required: true, max: 160 },
      { name: 'chapter', label: 'Church chapter', type: 'text', required: true, max: 120, default: 'Yaba', help: 'e.g. Yaba, Ikota, Oniru' },
      { name: 'area', label: 'Area', type: 'text', required: true, max: 120, help: 'Used by the Areas filter, e.g. Surulere' },
      { name: 'leader', label: 'Cluster leader', type: 'text', max: 160 },
      { name: 'phone', label: 'Leader phone', type: 'text', max: 60 },
      { name: 'email', label: 'Leader email', type: 'email', max: 190 },
      { name: 'meeting_day', label: 'Meeting day', type: 'select', options: [['', '—'], ...DAYS.map((d) => [d, d])] },
      { name: 'meeting_time', label: 'Meeting time', type: 'text', max: 80 },
      { name: 'notes', label: 'Notes', type: 'textarea', max: 2000 },
      { name: 'active', label: 'Published', type: 'bool', default: true },
      sort,
    ],
  },
  leaders: {
    label: 'Pastors & leaders',
    singular: 'leader',
    group: 'Content',
    table: 'leaders',
    orderBy: 'sort_order, id',
    titleField: 'name',
    subtitleField: 'role',
    imageField: 'photo',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'role', label: 'Role', type: 'text', required: true, max: 160 },
      { name: 'photo', label: 'Portrait', type: 'image', required: true, help: 'Portrait orientation (5:6) works best.' },
      sort,
    ],
  },
  service_times: {
    label: 'HQ service times',
    singular: 'service time',
    group: 'Content',
    table: 'service_times',
    orderBy: 'sort_order, id',
    titleField: 'title',
    subtitleField: 'time_label',
    fields: [
      { name: 'title', label: 'Gathering', type: 'text', required: true, max: 120 },
      { name: 'time_label', label: 'Time', type: 'text', required: true, max: 80 },
      sort,
    ],
  },
  ministries: {
    label: 'Ministries / serving teams',
    singular: 'ministry',
    group: 'Content',
    table: 'ministries',
    orderBy: 'sort_order, id',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 120 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, max: 2000 },
      { name: 'icon', label: 'Icon', type: 'select', required: true, options: ICONS.map((i) => [i, i]) },
      sort,
    ],
  },
  beliefs: {
    label: 'Beliefs',
    singular: 'belief',
    group: 'Content',
    table: 'beliefs',
    orderBy: 'sort_order, id',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 120 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, max: 2000 },
      { name: 'icon', label: 'Icon', type: 'select', required: true, options: ICONS.map((i) => [i, i]) },
      sort,
    ],
  },
  giving_accounts: {
    label: 'Giving accounts',
    singular: 'account',
    group: 'Content',
    table: 'giving_accounts',
    orderBy: 'account_group, sort_order, id',
    titleField: 'purpose',
    subtitleField: 'bank',
    fields: [
      { name: 'account_group', label: 'Currency tab', type: 'select', required: true, options: [['local', '₦ Nigerian Naira'], ['dom', 'Domiciliary (USD/GBP)']] },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true, max: 120, help: 'e.g. Tithe & General Offering' },
      { name: 'icon', label: 'Icon', type: 'select', required: true, options: ICONS.map((i) => [i, i]) },
      { name: 'bank', label: 'Bank', type: 'text', required: true, max: 120 },
      { name: 'account_name', label: 'Account name', type: 'text', required: true, max: 160 },
      { name: 'account_number', label: 'Account number', type: 'text', required: true, max: 40 },
      { name: 'code_label', label: 'Code label', type: 'text', required: true, max: 60, help: 'e.g. Sort Code / Bank, or SWIFT / BIC Code' },
      { name: 'code_display', label: 'Code (as shown)', type: 'text', required: true, max: 80 },
      { name: 'code_copy', label: 'Code (copied)', type: 'text', required: true, max: 80 },
      { name: 'bank_address', label: 'Bank address', type: 'text', max: 255 },
      sort,
    ],
  },
  featured_messages: {
    label: 'Featured messages',
    singular: 'message',
    group: 'Content',
    table: 'featured_messages',
    orderBy: 'sort_order, id',
    titleField: 'title',
    subtitleField: 'preacher',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'preacher', label: 'Preacher', type: 'text', required: true, max: 120 },
      { name: 'message_date', label: 'Date', type: 'date', required: true },
      { name: 'youtube_id', label: 'YouTube video ID', type: 'text', max: 20, help: 'The part after watch?v= in the YouTube link.' },
      { name: 'eyebrow', label: 'Label', type: 'text', max: 60, default: 'live recording' },
      sort,
    ],
  },
  posts: {
    label: 'Blog posts',
    singular: 'post',
    group: 'Content',
    table: 'posts',
    orderBy: 'published_at DESC, id DESC',
    titleField: 'title',
    subtitleField: 'published_at',
    imageField: 'featured_image',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 255 },
      { name: 'slug', label: 'URL slug', type: 'slug', required: true, max: 160, help: 'Used in /blog/your-slug' },
      { name: 'featured_image', label: 'Featured image', type: 'image' },
      { name: 'youtube_id', label: 'YouTube video ID', type: 'text', max: 20 },
      { name: 'body_markdown', label: 'Body', type: 'markdown', max: 100000, help: 'Leave a blank line between paragraphs. **bold**, *italic*, [link](https://…), ## Heading, - list item, > quote.' },
      { name: 'category', label: 'Category', type: 'text', max: 80, default: 'Uncategorized' },
      { name: 'author', label: 'Author', type: 'text', max: 120, default: 'Oak House Church' },
      { name: 'published_at', label: 'Publish date', type: 'datetime', required: true },
    ],
  },
};

// Site-wide settings (key/value), grouped for the Settings screen.
export const SETTINGS = [
  {
    group: 'Contact & church details',
    fields: [
      { name: 'contact_email', label: 'Contact email', type: 'email' },
      { name: 'contact_phone', label: 'Contact phone', type: 'text' },
      { name: 'giving_email', label: 'Giving email', type: 'email' },
      { name: 'office_address', label: 'HQ / office address', type: 'textarea' },
      { name: 'ict_email', label: 'Website support email', type: 'email' },
      { name: 'footer_blurb', label: 'Footer description', type: 'textarea' },
    ],
  },
  {
    group: 'Social & media channels',
    fields: [
      { name: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { name: 'social_instagram', label: 'Instagram URL', type: 'url' },
      { name: 'social_youtube', label: 'YouTube URL', type: 'url' },
      { name: 'social_twitter', label: 'X / Twitter URL', type: 'url' },
      { name: 'youtube_channel_id', label: 'Sermons YouTube channel ID', type: 'text', help: 'Starts with UC…' },
      { name: 'youtube_live_channel_id', label: 'Live stream YouTube channel ID', type: 'text' },
    ],
  },
  {
    group: 'Homepage',
    fields: [
      { name: 'pastor_quote', label: 'Pastor’s quote', type: 'textarea' },
      { name: 'pastor_quote_author', label: 'Quote author', type: 'text' },
    ],
  },
];

export const SETTING_KEYS = new Set(SETTINGS.flatMap((g) => g.fields.map((f) => f.name)));

// Page headers — editable intro copy for each public page (falls back to the built-in text when blank).
export const PAGES = [
  ['home', 'Home'],
  ['about', 'About'],
  ['locations', 'Locations'],
  ['clusters', 'Clusters'],
  ['sermons', 'Sermons'],
  ['programs', 'Programs'],
  ['giving', 'Giving'],
  ['contact', 'Contact'],
];
export const PAGE_FIELDS = [
  ['eyebrow', 'Eyebrow (small label)', 'text'],
  ['title', 'Heading', 'text'],
  ['lead', 'Introduction', 'textarea'],
  ['quote_text', 'Scripture / quote', 'textarea'],
  ['quote_ref', 'Scripture reference', 'text'],
];
for (const [page] of PAGES) for (const [field] of PAGE_FIELDS) SETTING_KEYS.add(`page.${page}.${field}`);
