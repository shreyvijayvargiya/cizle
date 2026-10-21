# cizle skills: the marketplace site

A static-first library of video skills and prompts for Claude Code. The home page **is** the library: every skill on one page, shadcn filters and search, and a single skill opens as a modal over the list (`/skills/<slug>`, with ← → to walk the list). 20 skills are free; the 36 premium skills (ads, engineering formats, film styles) are $10 a month via Dodo Payments.

It lives next to the studio (the local dashboard in `../web`) and does not touch it.

```
site/
  content/            catalog.json (which prompt is a skill, free or premium), faq.json, blog/*.md, pages/*.md, site.json
  scripts/            build-content (public JSON + SKILL.md), prerender (static HTML, sitemap, llms.txt), seed-premium (Firestore)
  src/                Vite + React + TanStack Router/Query, shadcn-style UI, Firebase client, Fuse.js search
  api/dodo-webhook.ts the only server code: Dodo calls it, it marks users/{uid} as Premium
  firestore.rules     users/{uid}: read your own, nobody writes. premium/{slug}: subscribers only
```

## Run it

```bash
cd site
npm install
cp .env.example .env     # fill in later; the site runs without keys
npm run dev              # http://localhost:5174
VITE_DEV_UNLOCK=1 npm run dev   # pretend to be a Premium subscriber to see unlocked skills and the post-payment flow
npm run build            # content → typecheck → vite build → prerender every route to dist/
npm test                 # webhook signature and subscription logic
```

Skills are generated from `../prompts` (the same library the studio uses). `content/catalog.json` decides which are free and which are premium.

## How the paywall works (no per-request server)

1. **Public, static:** every skill's summary and scene names, and the full prompt + `SKILL.md` for free skills (`/skills/<slug>/SKILL.md` is a plain file, so the install command is a `curl`).
2. **Premium prompts are not in the build.** `npm run seed:premium` writes them to Firestore (`premium/{slug}`). Firestore rules only let a signed-in user with an active subscription read them.
3. **Subscribing:** the pricing page sends a signed-in user to a Dodo checkout link with their uid in the metadata. Dodo calls `/api/dodo-webhook`; it verifies the signature and writes `users/{uid} = { plan: "pro", proUntil }`. The browser is subscribed to that document, so Premium unlocks live, with confetti, when the webhook lands.
4. **Cancelling** keeps access until `proUntil`. Expiry or a failed renewal ends it.

## Set up for launch

1. **Domain.** Set `VITE_SITE_URL` and `content/site.json` (`url`, `email`). Everything else (canonical links, sitemap, install commands, llms.txt) follows.
2. **Firebase.** Create a project, add a web app, enable Google and Email/Password sign-in, create Firestore, paste the web keys into `.env`, deploy `firestore.rules`. Add your domain to Authentication > Authorized domains.
3. **Dodo Payments.** Create a monthly subscription product in USD ($10) and one in INR (set `VITE_PRICE_INR` to match), enable payment links, paste both product ids. Add a webhook to `https://YOUR-DOMAIN/api/dodo-webhook` for subscription and payment events and copy its secret to `DODO_WEBHOOK_SECRET`. Copy the customer portal URL to `VITE_DODO_PORTAL_URL`. Test with `VITE_DODO_CHECKOUT_BASE=https://test.checkout.dodopayments.com/buy`.
4. **Premium content.** Put a Firebase service account in `service-account.json` (git-ignored) and run `npm run seed:premium`.
5. **Deploy to Vercel** with the project root set to `site/`. Set the env vars above (plus `DODO_WEBHOOK_SECRET` and `FIREBASE_SERVICE_ACCOUNT` as server-only). The static site is free to serve; the one function runs only when Dodo calls it.

## SEO, AEO and GEO

- Every route is prerendered to semantic HTML (one `h1`, ordered headings, lists, definition lists) so crawlers and AI assistants get content without running JavaScript. React replaces it on load.
- JSON-LD per page: `Organization`, `WebSite` + `SearchAction`, `ItemList`, `HowTo`, `FAQPage`, `BreadcrumbList`, `CreativeWork` (premium pages mark the locked section with `isAccessibleForFree: false`), `Product` + `Offer` (USD and INR), `Article`, `VideoObject`.
- `sitemap.xml`, `robots.txt` (AI crawlers allowed), `llms.txt` and `llms-full.txt` (free skills in full) are generated at build.
- Each skill page answers three questions in plain text (what it is, how long, how to use it), which is what answer engines quote.

## Before you launch

- Replace the terms, privacy and refund text in `content/pages/` with versions you have reviewed. They are sensible defaults, not legal advice.
- `premium` prompts live in the public `../prompts` folder of this repository. They are kept out of the website and its build, but anyone can read them on GitHub. Move the premium prompts to a private repository or folder before launch if the paywall matters to you.
- The Firestore rules and the Dodo checkout and webhook were written to the documented formats but could not be run against live services while building. Test one payment end to end in Dodo's test mode first.
