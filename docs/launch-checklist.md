# Launch checklist (image and video prompts, skills, creators)

Done and checked: production build passes (`cd site && npm run build`), 65 MB / 3,992 files, no horizontal overflow at 375 px on home, gallery, creators, saved, rights and the prompt modal.

## Before you press deploy

1. **Environment on the host** (Vercel project settings): every `VITE_FIREBASE_*`, `VITE_DODO_*`, `VITE_SITE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `DODO_WEBHOOK_SECRET` from `site/.env`. Set `VITE_DEV_UNLOCK` to 0 or leave it out (it only works in `npm run dev` anyway).
2. **Firestore rules**: the subscribe form and sign-in use the rules you already have. Only the new counters need `site/firestore.rules` deployed. Run `site/tests/rules/README.md` on a machine with Java first, then `firebase deploy --only firestore:rules`. Until then likes, bookmarks and views are saved on the device only and no counts show.
3. **Email**: hello@cizle.dev must receive mail (removal requests go there; the rights page promises one working day).
4. **Hosting limits**: output is `site/dist` (65 MB). Check your plan's deployment size and bandwidth limits.
5. **Smoke test on the live URL**: home, a video prompt, an image prompt, a Chinese skill, /creators, /rights, sign-in, subscribe.

## Rights switches (no code change)

- `site/content/takedown.json`: add a handle, id, source or repo, rebuild, redeploy.
- `site/content/rights.json`: `restrictUnlicensed` true shows only a preview of anything without an open licence (all v4 prompts, 256 unlicensed skills). Set it to false only after the creators agree.
- The 2,184 classic prompts (public X posts) are shown in full with credit and a link, as before.

## Known risks

- **Pictures are hotlinked** from `r2.qqsrc.com` (the image prompts) and videos from `video.twimg.com` / `cdn.emaki.ai`. They can be slow, refuse us or disappear. A missing picture falls back to a text card. The proper fix is to mirror the pictures to your own storage (needs the creator's agreement).
- **Tweet video proxy** (`/api/vid`) is only used when a browser cannot load a video directly. It is cached at the CDN for a day, but heavy traffic through it costs function time and bandwidth.
- **First load** sends about 1.9 MB gzipped of gallery data (classic 0.57 MB, v4 1.29 MB), cached at the CDN for an hour.
- v4 pages are not prerendered (client-rendered, not in the sitemap); the 2,184 classic prompt pages are.
