// Inline SVG icon set (stroke icons follow currentColor).
const paths = {
  pray: (
    <>
      <path d="M11.2 3.2c-.7-.3-1.5.1-1.7.8L7.6 10.4l-2.9 3.5a2 2 0 0 0-.4 1.9l1 3.4L3 20.5" />
      <path d="M12.8 3.2c.7-.3 1.5.1 1.7.8l1.9 6.4 2.9 3.5c.5.5.6 1.2.4 1.9l-1 3.4 2.3 1.3" />
      <path d="M11.2 3.2 12 9.5l.8-6.3M12 9.5v8.8" />
      <path d="M9.6 12.4 12 18.3l2.4-5.9" />
    </>
  ),
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /><path d="M9 9l11-2" /></>,
  video: <><circle cx="7" cy="5.5" r="2.5" /><circle cx="13" cy="5.5" r="2.5" /><rect x="3" y="9" width="12" height="7" rx="1.5" /><path d="m15 11.5 5-2.5v7l-5-2.5M7 16l-2 5M11 16l2 5M9 16v5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  cross: <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2Z" fill="currentColor" stroke="none" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>,
  spirit: <path d="M12 21c3.6 0 6-2.5 6-5.8 0-3.6-2.7-5.6-3.6-8.9-.2-.8-1.2-1-1.6-.3-.9 1.6-1.1 3.2-.8 4.6-1.2-.6-2.1-1.7-2.5-2.9-.3-.8-1.3-.9-1.7-.2C6.6 9.9 6 11.9 6 13.5 6 18 8.4 21 12 21Zm0 0c-1.7 0-2.8-1.2-2.8-2.8 0-1.6 1.3-2.6 1.9-4 .9 1.3 3.7 2.1 3.7 4 0 1.6-1.1 2.8-2.8 2.8Z" />,
  church: (
    <path d="M11 1.5h2V4h2v2h-2v2.3l4 3.2V14l4 2v6.5h-6.5v-4a2.5 2.5 0 0 0-5 0v4H3V16l4-2v-2.5l4-3.2V6H9V4h2V1.5Z" fill="currentColor" stroke="none" />
  ),
  star: <path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2L12 17.1 6.4 20l1-6.2L3 9.4l6.3-.9L12 2.8Z" />,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M3 12h18" /></>,
  home: <><path d="M3 21h18M5 21V10l7-6 7 6v11" /><path d="M9.5 21v-5h5v5" /></>,
  dollar: <><circle cx="12" cy="12" r="9" /><path d="M12 6v12M15 8.5h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9" /></>,
  pound: <><circle cx="12" cy="12" r="9" /><path d="M15 8.2A3 3 0 0 0 9.8 10V16H15M8.5 12.5h5" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V5a1 1 0 0 1 1-1h11" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6 8.5 7 8.5-7" /></>,
  phone: <path d="M6.6 3h2.6l1.6 4.2-2 1.4a11 11 0 0 0 6.6 6.6l1.4-2 4.2 1.6v2.6a2 2 0 0 1-2.1 2A17 17 0 0 1 4.6 5.1 2 2 0 0 1 6.6 3Z" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  arrowRight: <path d="M4 12h15m-5-5 5 5-5 5" />,
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" />,
  chat: <path d="M20 11.5a7.5 7.5 0 0 1-11.1 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5Z" />,
  hand: <><path d="M3 15h3l4.5 2.5c.8.4 1.7.4 2.5 0L20 14a1.5 1.5 0 0 0-1.5-2.6L14 13.5" /><path d="M6 15v5H3v-5M10 13.5h4a1.5 1.5 0 0 0 0-3h-2.5L9 9H6v6" /><path d="M15.5 4.5a1.8 1.8 0 0 1 3 1.8L16.5 8.5l-2-2.2a1.8 1.8 0 0 1 3-1.8" /></>,
  giftHeart: <><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" /><path d="M9 12.5l2 2 4-4" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m4 17 5-4.5 4 3.5 2.5-2 4.5 3.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  refresh: <><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16m0 4v-4h-4" /></>,
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  inbox: <><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2.5-8Z" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  file: <><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8l-5-5Z" /><path d="M14 3v5h5M8.5 13h7M8.5 17h5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  arrowLeft: <path d="M20 12H5m5-5-5 5 5 5" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />,
  quote: (
    <path d="M4 11.5C4 7.4 6.2 4.6 10 3.5l.8 1.6C8.4 6.1 7.3 7.8 7.2 10H10v8H4v-6.5Zm10 0c0-4.1 2.2-6.9 6-8l.8 1.6c-2.4 1-3.5 2.7-3.6 4.9H20v8h-6v-6.5Z" fill="currentColor" stroke="none" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" fill="currentColor" stroke="none" />,
  twitter: (
    <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" fill="currentColor" stroke="none" />
  ),
  youtube: (
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" fill="currentColor" stroke="none" />
  ),
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></>,
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.7, title }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name] || paths.star}
    </svg>
  );
}
