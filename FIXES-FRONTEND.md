# Frontend fix list (for Codex)

Audit date: 2026-10-04. Audited locally at desktop (1440×900) and mobile (390×844) across 24 routes.

## Ground rules — read first

1. **The UI must look the same.** Do not change layout, fonts, colours, spacing, images or copy unless the task explicitly says so. Tasks marked **[VISUAL: minimal]** allow only the small change described.
2. **Before you start:** run `git pull` (local `main` is 4 commits behind `origin/main` and 1 ahead). Re-check each task still applies after pulling.
3. **Prove nothing moved:** before changing anything, take full-page screenshots of every route below at 1440px and 390px wide. After each task, re-take them and compare. Any unexpected pixel difference → fix or revert.
   Routes: `/ /treks /destinations /destinations/nepal /destinations/beyond-nepal /activities /departures /tailor-made /about /contact /faq /blog /gallery /guides /reviews /search /login /register /partners /privacy-policy /terms-conditions` and a 404 URL.
4. Run `npm run lint`, `npm run typecheck`, `npm test` after each task. One commit per task.
5. Do not touch the admin area (`src/app/admin/**`) unless a task names it.

---

## P0 — Critical

### F1. Cache backend reads (site breaks under traffic)
**Problem:** `src/lib/backend.ts:16` forces `cache: 'no-store'` for every backend call except site settings. Every page view sends several fresh requests to Django from the Next.js server's single IP. Django limits anonymous traffic to 200 requests/day per IP, so all visitors share 200 requests/day. During the audit (~48 page loads) the backend started returning `429 Too Many Requests` for `/api/trips` and `/api/departures` for ~24 hours.

**Do:**
- Allow callers of `backend()` to opt into caching: public, unauthenticated `GET` requests should use `next: { revalidate: 60 }` (with tags so the admin can invalidate), instead of `no-store`.
- Apply it to public catalogue reads: trips/journeys, departures, destinations, categories, guides, reviews, homepage content. Look in `src/lib/journeys.ts`, `src/lib/destination-content.ts`, `src/lib/guides.ts`, `src/lib/homepage-content.ts` and friends.
- Keep `no-store` for anything with an `Authorization` header, any non-GET request, bookings, accounts, payments, admin and partner portal.
- Where the admin saves content, call `revalidateTag(...)` for the matching tag (pattern already exists in `src/app/api/admin/site-settings/route.ts`).
- Send the internal key header agreed with the backend (see backend task **B1**): if `process.env.FRONTEND_INTERNAL_KEY` is set, add header `X-Frontend-Key: <value>` to server-side backend requests. Never expose it to the browser (no `NEXT_PUBLIC_`). Add it to `.env.example` with an empty value.

**Done when:** loading `/` 300 times locally produces far fewer than 300 backend requests (check Django log), and no `429` appears. UI unchanged.

### F2. Render homepage "Featured journeys" on the server
**Problem:** `src/components/home.tsx` is a client component and fetches `/api/trips` in the browser after load. Search engines see an empty section; users see "Finding your next adventure…" first; it fails whenever the API is throttled.

**Do:** fetch the trip catalogue in `src/app/page.tsx` (server, cached per F1) and pass it into `<Home>` as a prop (e.g. `initialCatalog` + `demo`). Keep the client-side filter/search behaviour exactly as it is. Keep the "Try again" path for errors.

**Done when:** `curl http://127.0.0.1:3000/` HTML contains the featured trip titles (when trips exist). Same look.

---

## P1 — Performance (no visual change)

### F3. Compress oversized images
Replace these with properly sized versions at the same display size and appearance (WebP or optimised JPG/PNG):

| File | Size now | Notes |
|---|---|---|
| `public/images/organizations/department-of-tourism-emblem.png` | 877 KB | Displayed ~40px tall on homepage. Target < 30 KB |
| `public/images/team/amar-jung-lama.png` | 2.1 MB | Portrait photo saved as PNG |
| `public/images/team/saput-man-tama.png` | 1.8 MB | Portrait photo saved as PNG |
| `public/images/treks/dhakmar-village.jpg` | 1.9 MB | |
| `public/images/blog/cho-la-pass-flags.jpg` | 1.1 MB | |
| `public/images/blog/milkyway-everest-peaks.jpg` | 1.0 MB | |
| `public/images/treks/lo-manthang-panorama.jpg` | 0.9 MB | |
| `public/images/blog/khumbu-dawn-ridge.jpg`, `khumbu-cover.jpg`, `teahouse-hearth.jpg` | 0.8–0.9 MB each | |

Max width 2000px for full-bleed photos, ~800px for cards/portraits. Update references if the extension changes. `public/` is 30 MB with 70 JPG/PNG and only 2 WebP.

### F4. Remove unused assets
`public/images/dreamscape-bottom.png` (8 MB) appears unused (footer uses `dreamscape-landscape-vector.svg`). Search the whole repo, including CMS defaults and `src/content`, before deleting. Do the same check for other files in `public/images` with zero references.

### F5. Image dimensions & lazy loading
On every page ~5–13 `<img>` elements have no `width`/`height` (layout shift while loading). Add intrinsic `width`/`height` attributes (CSS still controls display size, so the look does not change). Below-the-fold images get `loading="lazy"`; the hero image gets `fetchpriority="high"`. Shared components (header, footer, logo strip) cause most of these.

### F6. `transition: all` → explicit properties
46 occurrences in `src/app/refined-ui.css`, `src/app/ui-polish.css` (and `src/app/admin/admin.module.css`, optional). Replace each with only the properties that actually change (e.g. `transform, opacity, background-color, color, box-shadow`). Same durations and easing.

---

## P1 — SEO / accessibility (no visual change)

### F7. Page titles
| Route | Current title | Should be (suggestion) |
|---|---|---|
| `/destinations/nepal` | Dreamscape Treks — Beyond the Horizon (default) | Trekking regions of Nepal \| Dreamscape Treks |
| `/destinations/beyond-nepal` | default | Bhutan, Tibet & India journeys \| Dreamscape Treks |
| 404 page (`src/app/not-found.tsx`) | default | Page not found \| Dreamscape Treks |
| `/company/guide-of-the-year` | "Our guides \| Dreamscape Treks" (duplicate of `/guides`) | Guide of the Year \| Dreamscape Treks |

Also add a unique `description` for each. Make title suffixes consistent (some pages use "| Dreamscape — Beyond the Horizon", others "| Dreamscape Treks").

### F8. Heading order
`/treks` (and `/booking`, which redirects there) and `/departures` go from `<h1>` straight to `<h3>` (e.g. empty-state headings in `src/components/trek-catalog.tsx`). Change the tag to `<h2>` and keep the existing class so it looks identical (add a class if the CSS targets `h3` directly).

### F9. Keyboard focus outlines
`outline: none` / `outline: 0` appears in `src/app/apple-navigation.css`, `brand-correction.css`, `journeys.css`, `refined-ui.css`, `refinements.css`, `site-updates.css`, `trek-page.css`, `src/components/route-profile.module.css`, `src/components/admin-login.css`. Wherever it removes the focus indicator without a replacement, add a `:focus-visible` style (e.g. `outline: 2px solid <brand green>; outline-offset: 2px`). **[VISUAL: minimal]**: only appears for keyboard (Tab) users; mouse/touch users see no change.

---

## P2 — Small fixes

### F10. Wrong empty-state message
`src/components/home.tsx`: when the catalogue is empty and the user has not searched, the section says "No journeys match these filters yet." Show the filter message only when `searched` is true; otherwise use neutral copy such as "New journeys are on their way. Ask us to plan one for you." Same styling.

### F11. Text contrast **[VISUAL: minimal]**
Small grey text is ~3.8:1 contrast (needs 4.5:1). Examples: "(optional)" and helper text on `/contact` and `/partners`, "EXPLORE A REGION" on `/treks`, "EXAMPLE DATE · UNCONFIRMED" / "No confirmed price" on `/departures`, "9 moments" on `/gallery`, "Kathmandu, Nepal" on `/partners`. Darken only those grey colour values just enough to reach 4.5:1. Nothing else changes.

### F12. Mobile footer tap targets **[VISUAL: minimal]**
At 390px, footer links (Treks, Tours, Departures, Journal, Bhutan, Tibet, India, About us, email address…) and some inline links ("Forgot your password?", "Back to sign in", "Choose your own dates →") are under 24px tall. On mobile only, increase the tap area to at least 24px (ideally 44px) using padding / `min-height` with equal negative margin where needed so the visual spacing barely changes. Desktop unchanged.

### F13. Cookie banner on mobile **[VISUAL: minimal]**
`src/app/cookie-consent.css`: on phones the banner covers the hero's "Find My Trek" button. On ≤ 600px only, make it more compact (smaller padding, buttons side by side, text 1–2 lines) and keep it pinned to the bottom. Same colours and style. Desktop unchanged.

### F14. Footer tagline: ask the owner, don't change it yourself
Footer shows "View in the Horizon." This may be a typo for "Beyond the Horizon." **Do not change it without confirmation from the owner.**

---

## Out of scope (do NOT do in this pass)
- Merging/refactoring the 43 global CSS files (~500 KB, 386 `!important`). Planned as a separate project with screenshot-diff verification.
- Removing the "Example only" sample departures on the homepage (business decision).
- Any redesign.
