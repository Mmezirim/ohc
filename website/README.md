# Oak House Church website

React (Vite) front end, Node/Express API and MySQL. This replaces the WordPress/Elementor build at
`red-yak-592043.hostingersite.com`. The wording and images are the same as on that site.

```
website/
├── client/            React app (Vite)
│   ├── public/images/ original site images (+ optimised logo / pray.webp copies)
│   └── src/           pages, components, styles
└── server/            Express API
    ├── db/schema.sql  MySQL schema
    ├── scripts/       setup-db.js (create + seed)
    └── src/           routes, YouTube feed cache, mailer, seed content
```

## Getting started

Requirements: Node 18+ and MySQL 8 (or MariaDB 10.5+).

```bash
cd website
npm install
cp server/.env.example server/.env   # then fill in DB_* (and optionally SMTP_*, ADMIN_TOKEN)
npm run db:setup                     # creates the database, tables and seeds the original content
npm run dev                          # API on :5000, site on http://localhost:5173
```

If MySQL isn't reachable, the API serves the bundled seed content read-only, so pages still
render. The two forms (Plan Your Visit and blog comments) return "temporarily unavailable" until a
database is connected.

`npm run db:reset` drops every table and reseeds it. **This deletes visit requests and comments.**

## Production

```bash
npm run build      # builds client/dist
npm start          # Express serves the API and the built site on PORT
```

On Hostinger (or any Node host), point the app at `server/src/index.js` and set the env vars from
`server/.env.example`. Hashed assets are served with long-lived cache headers. Any unknown path
falls back to `index.html` so client-side routes work.

## Deploying to Render

`render.yaml` (repo root) is a Render Blueprint: Render dashboard → **New → Blueprint** → choose the
GitHub repo → paste the Aiven Service URI as `DATABASE_URL` when asked → **Apply**.

- Plan **Starter** with a 1 GB disk mounted at `/var/data` — uploaded images live in `/var/data/uploads`.
  (Free instances wipe their disk on every deploy/restart and sleep after 15 minutes idle.)
- Build: `npm ci --include=dev && npm run build` · Pre-deploy: `npm run db:setup` (safe to repeat) ·
  Start: `npm start` · Health check: `/api/health`.
- If Aiven has an IP allow-list, add Render's outbound IPs (service → Connect → Outbound).
- Custom domain: service → Settings → Custom Domains, then add the DNS records Render shows (HTTPS is automatic).

## Editing content

All page content lives in MySQL. Edit the rows and the site picks up the change within a minute
(content is cached for 60 s).

| Table | Used for |
|---|---|
| `settings` | contact email/phone, social links, footer blurb, home gallery, pastor quote, YouTube channel IDs |
| `service_times` | HQ service-times strip on the homepage |
| `locations` | homepage carousel + Locations page (`card_name` / `card_address` override the carousel text) |
| `events` | Programs — Home, `/programs` and `/programs/:slug` (`slug`, `category`, `schedule`, `venue`, `audience`, `details`; `active = 0` hides one) |
| `clusters` | Clusters directory on `/clusters` (empty until published; the page shows a "find me a cluster" prompt) |
| `ministries`, `beliefs`, `leaders`, `timeline` | Home and About sections |
| `giving_accounts` | Giving page (`account_group` = `local` or `dom`) |
| `featured_messages` | the three "Latest Messages" cards on the homepage |
| `posts` | blog posts (`youtube_id` embeds a video; `body` is trusted HTML) |

The Sermons page pulls the church YouTube channel's public RSS feed (no API key). The feed is cached
in the `sermons` table and refreshed every `YOUTUBE_CACHE_MINUTES`. If YouTube can't be reached, the
last cached list is served.

## Admin panel

Sign in at **`/admin`**. On a fresh install (no admin accounts yet) that page shows a **Create the first
admin account** form instead; it disappears as soon as one admin exists. More accounts are added under
**Admin users**. You can also create or reset accounts on the server (the password is typed at a hidden prompt):

```bash
npm run admin:create -- --email you@church.org --name "Your Name"            # admin
npm run admin:create -- --email helper@church.org --name "Helper" --role editor
```

Running it again for an existing email resets that password and unlocks the account.

| Area | What it manages |
|---|---|
| Dashboard | New enquiries / visit requests / comments, content counts, "Refresh sermons" |
| Inbox | Contact enquiries (filter by type), visit requests, blog comments (approve / hide) |
| Website content | Locations, Programs, Clusters, Pastors & leaders, HQ service times, Ministries, Beliefs, Giving accounts, Featured messages, Blog posts — add, edit, reorder, delete |
| Page headers | Heading, introduction and scripture at the top of every page |
| Media library | Upload (drag & drop), describe (alt text), copy links, delete unused images |
| Site settings *(admins)* | Contact details, emails, social links, YouTube channel IDs, homepage quote |
| Admin users *(admins)* | Invite, change role, disable, unlock, reset password / 2FA |
| Activity log *(admins)* | Every sign-in, failed attempt and change, with IP |
| My account | Change password, two-factor authentication, signed-in devices |

**Roles:** *editors* manage content, page headers, media and the inbox; *admins* can also change site
settings, manage users and read the activity log. There is always at least one active admin.

### Security

- Passwords hashed with scrypt (per-user salt); 8+ characters, common/obvious passwords rejected.
- Server-side sessions stored in MySQL (only a SHA-256 of the token), sent as an `HttpOnly`,
  `SameSite=Strict` cookie (`__Host-` prefixed and `Secure` in production). 60-minute idle timeout,
  12-hour absolute limit (`ADMIN_IDLE_MINUTES`, `ADMIN_SESSION_HOURS`). Changing a password, role or 2FA
  signs out other sessions.
- CSRF: every state-changing request needs the per-session token header **and** a same-origin `Origin`.
- Brute force: 20 sign-in attempts / 15 min per IP, and an account locks for 15 minutes after 5 failures.
  Unknown emails take as long to reject as wrong passwords, with the same message.
- Optional TOTP two-factor (any authenticator app), verified to RFC 6238.
- Input is validated against a whitelist of fields per content type; blog bodies use a safe formatting
  syntax that is HTML-escaped on save.
- Uploads: identified by file content (JPEG/PNG/WebP/GIF only — no SVG), random file names, 8 MB limit
  (`MAX_UPLOAD_MB`), served with `nosniff` and a sandboxing CSP. Stored in `server/uploads/`
  (`UPLOAD_DIR`) — back this folder up, and make sure your host keeps it between deploys.
- Admin pages and API responses are `no-store` and `noindex`; the site sends `frame-ancestors 'none'`.

**Production checklist:** set `NODE_ENV=production`, serve over HTTPS, and turn on two-factor for every
admin.

## Design

The interface follows the Figma file "Warmth, with intention" (Manrope + DM Serif Display, logo-derived plum
palette, 6px buttons / 12px cards / 16px media). Pages: Home, About, Locations, Clusters, Sermons, Programs,
Program details, Giving, Contact, Blog. Copy comes from the church's approved write-ups (Dcn Adeolu,
requirements 3 and 11) and the original site.

> Upgrading an existing database: the `events` table gained columns and `clusters` / `enquiries` were added.
> Run `npm run db:reset` on a fresh install, or add the columns manually to keep existing data.

## What changed from the WordPress site

- Full-bleed heroes with a header that turns solid on scroll, a mobile menu, scroll-in animations
  (switched off for visitors who prefer reduced motion), and consistent Jost / Cormorant Garamond type.
- Event flyers are shown in full, with the text below them.
- The homepage locations carousel links to the matching location on the Locations page.
- Sermons: a click-to-play player, a "See More" button, and a live-stream modal with a fallback note.
- Giving: copy-to-clipboard with a toast. The duplicated "Missions & Outreach" card was removed.
- Forms validate input, have spam protection (honeypot + rate limit) and are stored in MySQL.
- Performance: the 14 MB `pray.gif` hero is now served as a 650 KB animated WebP (same frames), and
  the 1.3 MB logo PNG is served as small WebP/PNG versions. Pages are code-split and the YouTube
  iframe only loads when someone presses play.
- Blog post bylines show "Oak House Church" instead of the WordPress account email.
- Old WordPress URLs (`/how-to-build-faith-…`, `/donation-*`, `/donor-dashboard`) redirect to the
  new pages.
