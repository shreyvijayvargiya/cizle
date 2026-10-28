# URL Shortening Service — Full-Stack Application

By @alejandro.garcia.garay@gmail.com · general
Language: en · Domains: data, history, engineering · Source: P01

Source page: https://prompts.chat

```
## 🚀 URL Shortening Service — Full-Stack Application

### 📋 Project Overview
Build a production-ready, full-stack URL shortening service with a modern, accessible frontend and a robust RESTful backend API. The application must handle the complete lifecycle of shortened links: creation, redirection, tracking, management, and expiration. Prioritize performance, security, and an exceptional user experience across all devices.

---

### 🛠️ Tech Stack

**Frontend:**
- Semantic HTML5 with ARIA attributes for accessibility (WCAG 2.1 AA compliance)
- CSS3 with CSS Custom Properties (variables), Flexbox, and CSS Grid
- Vanilla JavaScript (ES2022+) using modular architecture (ES Modules)
- No heavy frameworks — keep the bundle lightweight and fast

**Backend API:**
- RESTful API design following OpenAPI 3.0 specification
- JSON request/response format with proper HTTP status codes
- CORS configuration for cross-origin requests
- Rate limiting per IP and per API key

**Libraries (CDN or bundled):**
- QR Code generation (e.g., `qrcode.js` or `qr-creator`)
- Charting library for analytics (e.g., Chart.js or lightweight alternative)
- Date picker for expiration (e.g., `flatpickr`)
- Toast notification system (custom-built, no dependency)

---

### 🎨 Frontend — UI/UX Requirements

**Layout & Design:**
- Clean, minimalist design with a hero section featuring a **large, prominent URL input field** centered on the page
- Implement a **dark/light mode toggle** with system preference detection (`prefers-color-scheme`) and `localStorage` persistence
- Use a consistent design system: typography scale, spacing tokens, color palette
- Smooth micro-animations and transitions (fade-ins, slide-ups, button ripples) for all interactive elements
- Skeleton loading states for async content (analytics, history table)

**Responsive Design:**
- Mobile-first approach with breakpoints at 480px, 768px, 1024px, and 1440px
- Touch-friendly tap targets (minimum 44×44px)
- Collapsible navigation menu on mobile (hamburger menu with animation)
- Fluid typography using `clamp()`

**Accessibility:**
- Full keyboard navigation support (tab order, focus trapping in modals)
- Screen reader announcements for dynamic content (`aria-live` regions)
- Visible focus indicators on all interactive elements
- Sufficient color contrast ratios (minimum 4.5:1 for text)
- Reduced motion support (`prefers-reduced-motion`)

---

### ⚙️ Core Features

#### 1. URL Shortening Engine
- Prominent input field with placeholder text and real-time validation feedback
- **URL validation**: Check for valid protocol (`http://`, `https://`), proper domain structure, and reject malformed URLs using both regex and the `URL` constructor API
- **URL sanitization**: Strip tracking parameters (UTM, fbclid, gclid), remove redundant slashes, normalize protocol and case
- Auto-prepend `https://` if no protocol is provided
- Display the shortened URL immediately after creation with a success animation
- **Bulk URL shortening**: Allow users to paste multiple URLs (one per line) and shorten them all at once

#### 2. Custom Alias Support
- Optional custom alias field (e.g., `short.ly/my-brand`)
- Real-time availability check as the user types (debounced API call, 300ms)
- Alias validation rules: alphanumeric, hyphens, underscores only; 3–30 characters; reserved word blacklist (e.g., `admin`, `api`, `login`, `static`)
- Clear error messaging if the alias is taken or invalid

#### 3. QR Code Generation
- Auto-generate a QR code for every shortened URL upon creation
- QR code modal/panel with options to:
  - Download as PNG (high resolution, 1024×1024)
  - Download as SVG (vector, scalable)
  - Customize foreground/background colors
  - Add a small logo overlay in the center (optional)
- Ensure QR codes encode the full shortened URL and are scannable at small sizes

#### 4. Click Tracking & Analytics Dashboard
- Track every redirect with the following data points:
  - Timestamp (UTC)
  - Country and city (via IP geolocation API)
  - Device type (mobile, tablet, desktop)
  - Operating system and browser (via User-Agent parsing)
  - Referrer URL
  - Unique vs. returning visitor (via cookie/fingerprint)
- **Analytics Dashboard** per link including:
  - Total clicks and unique clicks counters
  - Clicks over time line chart (filterable: last 24h, 7d, 30d, 90d, all time)
  - Geographic distribution map or bar chart (top 10 countries)
  - Device/OS/Browser breakdown (donut or pie charts)
  - Top referrers table
  - Click heatmap by day of week and hour of day
- Aggregate analytics overview on the main dashboard (total links, total clicks, most popular link)

#### 5. Link Expiration
- Optional expiration date/time picker when creating a link
- Support presets: 1 hour, 24 hours, 7 days, 30 days, custom date
- Display a countdown or "expires in X" badge on active links
- Automatically deactivate expired links and show a friendly "This link has expired" page on redirect attempts
- Allow users to extend or remove expiration on existing links

#### 6. Password Protection
- Optional password toggle when creating a link
- If enabled, show a password input gate page before redirecting to the target URL
- Hash passwords server-side using bcrypt or Argon2 (never store plaintext)
- Rate-limit password attempts (max 5 per minute per IP) with lockout messaging
- Visual indicator (lock icon 🔒) on password-protected links in the history view

#### 7. Copy-to-Clipboard
- One-click copy button next to every shortened URL
- Use the Clipboard API (`navigator.clipboard.writeText()`) with fallback to `document.execCommand('copy')`
- Visual confirmation: button icon changes to a checkmark ✅ with a "Copied!" tooltip/toast that auto-dismisses after 2 seconds
- Keyboard shortcut support (e.g., `Ctrl+Shift+C` to copy the most recently created link)

#### 8. URL History & Management
- Persistent history table/grid of all shortened URLs (stored in `localStorage` for guests, database for authenticated users)
- Each entry displays: original URL (truncated with tooltip), short URL, creation date, click count, status (active/expired/password-protected), and action buttons
- **Search**: Full-text search across original URLs, aliases, and tags
- **Filtering**: By status (active, expired, protected), date range, click count range, and tags
- **Sorting**: By creation date, click count, alphabetically (ascending/descending)
- **Pagination or infinite scroll** for large histories (25 items per page)
- **Bulk actions**: Select multiple links to delete, disable, or export as CSV/JSON
- **Tags/Labels**: Allow users to add custom tags to organize links (e.g., "marketing", "social", "campaign-q4")

---

### 🔒 Security Requirements
- Input sanitization on both client and server to prevent XSS attacks
- CSRF protection on all state-changing API endpoints
- Validate and sanitize redirect targets to prevent open redirect vulnerabilities (whitelist allowed protocols, block `javascript:`, `data:`, `file:` schemes)
- Implement Content Security Policy (CSP) headers
- Rate limiting: max 20 link creations per minute per IP; max 100 API requests per minute
- Secure HTTP headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- Never expose internal IDs; use nanoid or UUID for public link identifiers

---

### ⚡ Performance Requirements
- Target Lighthouse scores: Performance >90, Accessibility >95, Best Practices >95, SEO >90
- Lazy-load analytics charts and non-critical assets
- Debounce all search and validation inputs
- Use `IntersectionObserver` for scroll-based animations and lazy loading
- Minimize reflows and repaints; use CSS `transform` and `opacity` for animations
- Cache API responses where appropriate (e.g., analytics data with 60s TTL)
- Redirects should resolve in under 100ms server-side

---

### 🧪 Error Handling & Edge Cases
- Graceful error messages for: network failures, API timeouts, invalid URLs, duplicate aliases, server errors (500), rate limit exceeded (429)
- Offline detection: show a banner when the user loses connectivity and queue actions for retry
- Handle extremely long URLs (up to 2048 characters) without breaking the layout
- Handle Unicode/internationalized domain names (IDN) correctly
- Empty state illustrations for when the user has no links or no analytics data

---

### 📁 Deliverables
1. Complete, well-commented source code with a clear folder structure
2. `README.md` with setup instructions, API documentation, and feature list
3. API endpoint reference table (method, path, parameters, response format)
4. A `demo` mode with sample data pre-loaded for immediate preview
5. Responsive across Chrome, Firefox, Safari, and Edge (latest 2 versions)

---

> **Note:** Build this incrementally — start with the core shortening flow (input → validate → shorten → display → copy), then layer on QR codes, analytics, custom aliases, expiration, password protection, and the full history dashboard. Ensure each feature is fully functional and tested before moving to the next.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
