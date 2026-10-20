-- Oak House Church — MySQL schema
-- Run via `npm run db:setup` (creates the database named in DB_NAME first).

CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(64)  NOT NULL PRIMARY KEY,
  setting_value TEXT         NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_times (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(120) NOT NULL,
  time_label VARCHAR(80)  NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(64)  NOT NULL UNIQUE,
  name            VARCHAR(120) NOT NULL,
  card_name       VARCHAR(120) NULL COMMENT 'Shorter name used on the homepage carousel',
  badge           ENUM('church','campus','intl') NOT NULL DEFAULT 'church',
  area            VARCHAR(120) NOT NULL,
  address         VARCHAR(255) NOT NULL,
  card_address    VARCHAR(255) NULL COMMENT 'Address override for the homepage carousel',
  primary_service VARCHAR(120) NOT NULL COMMENT 'Shown on homepage carousel cards',
  pastors         JSON         NOT NULL,
  schedule        JSON         NOT NULL,
  phone           VARCHAR(120) NULL,
  note            VARCHAR(255) NULL,
  map_embed       TEXT         NULL,
  map_dir         TEXT         NULL,
  sort_order      INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Programs (shown on Home, /programs and /programs/:slug).
CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  title       VARCHAR(160) NOT NULL,
  category    VARCHAR(60)  NOT NULL DEFAULT 'Connection' COMMENT 'Connection | Worship | Serving',
  schedule    VARCHAR(160) NULL COMMENT 'e.g. Weekly, or a date/time label',
  venue       VARCHAR(255) NULL,
  audience    VARCHAR(255) NULL,
  description TEXT         NOT NULL,
  details     TEXT         NULL COMMENT 'Longer about-this-program copy',
  image       VARCHAR(255) NOT NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ministries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  icon        VARCHAR(40)  NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS beliefs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  icon        VARCHAR(40)  NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leaders (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  role       VARCHAR(160) NOT NULL,
  photo      VARCHAR(255) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timeline (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  year_label VARCHAR(20)  NOT NULL DEFAULT '',
  title      VARCHAR(160) NOT NULL,
  body       TEXT         NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS giving_accounts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_group  ENUM('local','dom') NOT NULL,
  purpose        VARCHAR(120) NOT NULL,
  icon           VARCHAR(40)  NOT NULL,
  bank           VARCHAR(120) NOT NULL,
  account_name   VARCHAR(160) NOT NULL,
  account_number VARCHAR(40)  NOT NULL,
  code_label     VARCHAR(60)  NOT NULL,
  code_display   VARCHAR(80)  NOT NULL,
  code_copy      VARCHAR(80)  NOT NULL,
  bank_address   VARCHAR(255) NULL,
  sort_order     INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The three "Latest Messages" cards on the homepage. Set youtube_id to show a playable thumbnail.
CREATE TABLE IF NOT EXISTS featured_messages (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eyebrow      VARCHAR(60)  NOT NULL DEFAULT 'live recording',
  title        VARCHAR(160) NOT NULL,
  preacher     VARCHAR(120) NOT NULL,
  message_date DATE         NOT NULL,
  youtube_id   VARCHAR(20)  NULL,
  sort_order   INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cache of the church YouTube channel feed (refreshed automatically from the public RSS feed).
CREATE TABLE IF NOT EXISTS sermons (
  youtube_id   VARCHAR(20)  NOT NULL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT         NULL,
  thumbnail    VARCHAR(255) NOT NULL,
  published_at DATETIME     NOT NULL,
  fetched_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sermons_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(160) NOT NULL UNIQUE,
  title          VARCHAR(255) NOT NULL,
  category       VARCHAR(80)  NOT NULL DEFAULT 'Uncategorized',
  author         VARCHAR(120) NOT NULL DEFAULT 'Oak House Church',
  featured_image VARCHAR(255) NULL,
  youtube_id     VARCHAR(20)  NULL,
  body           MEDIUMTEXT   NULL COMMENT 'Rendered, sanitised HTML (generated from body_markdown)',
  body_markdown  MEDIUMTEXT   NULL,
  published_at   DATETIME     NOT NULL,
  INDEX idx_posts_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  website    VARCHAR(255) NULL,
  body       TEXT         NOT NULL,
  approved   TINYINT(1)   NOT NULL DEFAULT 0,
  ip         VARCHAR(64)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_comments_post (post_id, approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- "Plan Your Visit" form submissions.
CREATE TABLE IF NOT EXISTS visit_requests (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(120) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(40)  NULL,
  source     VARCHAR(60)  NULL COMMENT 'Page the form was submitted from',
  handled    TINYINT(1)   NOT NULL DEFAULT 0,
  ip         VARCHAR(64)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visits_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clusters (small groups). Empty until the church publishes its directory.
CREATE TABLE IF NOT EXISTS clusters (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(160) NOT NULL,
  chapter    VARCHAR(120) NOT NULL DEFAULT 'Yaba' COMMENT 'Church chapter the cluster belongs to',
  area       VARCHAR(120) NOT NULL,
  leader     VARCHAR(160) NULL,
  email      VARCHAR(190) NULL,
  phone      VARCHAR(60)  NULL,
  meeting_day VARCHAR(20) NULL COMMENT 'Monday..Sunday, used by the Days filter',
  meeting_time VARCHAR(80) NULL,
  contact    VARCHAR(160) NULL,
  notes      TEXT         NULL,
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact page enquiries (general, visit, clusters, prayer, serving, giving, program, accessibility).
CREATE TABLE IF NOT EXISTS enquiries (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(120) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(40)  NULL,
  intent     VARCHAR(30)  NOT NULL DEFAULT 'general',
  subject    VARCHAR(160) NULL COMMENT 'Cluster or program name the enquiry is about',
  message    TEXT         NOT NULL,
  consent    TINYINT(1)   NOT NULL DEFAULT 0,
  handled    TINYINT(1)   NOT NULL DEFAULT 0,
  ip         VARCHAR(64)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enquiries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Admin panel
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(190) NOT NULL UNIQUE,
  name            VARCHAR(120) NOT NULL,
  role            ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  password_hash   VARCHAR(255) NOT NULL,
  totp_secret     VARCHAR(64)  NULL,
  totp_enabled    TINYINT(1)   NOT NULL DEFAULT 0,
  active          TINYINT(1)   NOT NULL DEFAULT 1,
  failed_attempts INT          NOT NULL DEFAULT 0,
  locked_until    DATETIME     NULL,
  last_login_at   DATETIME     NULL,
  password_changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server-side sessions: only a SHA-256 of the session token is stored.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id          CHAR(64)     NOT NULL PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  csrf_token  CHAR(64)     NOT NULL,
  ip          VARCHAR(64)  NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME     NOT NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  user_email VARCHAR(190) NULL,
  action     VARCHAR(60)  NOT NULL,
  entity     VARCHAR(60)  NULL,
  entity_id  VARCHAR(60)  NULL,
  details    TEXT         NULL,
  ip         VARCHAR(64)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media library (uploads + the site's built-in images).
CREATE TABLE IF NOT EXISTS media (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  url         VARCHAR(255) NOT NULL UNIQUE,
  filename    VARCHAR(255) NOT NULL,
  mime        VARCHAR(60)  NOT NULL,
  size_bytes  INT UNSIGNED NOT NULL DEFAULT 0,
  width       INT UNSIGNED NULL,
  height      INT UNSIGNED NULL,
  alt         VARCHAR(255) NULL,
  builtin     TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Shipped with the site; cannot be deleted from the panel',
  uploaded_by INT UNSIGNED NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
