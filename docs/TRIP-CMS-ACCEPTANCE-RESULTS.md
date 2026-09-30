# Trip CMS acceptance status — 30 September 2026

Scope: trip and tour facts, not a general website-copy CMS. Privacy policy updates can remain reviewed code/content releases.

| Check | Result | Evidence / next step |
| --- | --- | --- |
| Save trip facts, reload, confirm public page | **Partly prepared; live persistence unverified** | After each admin save, the frontend now makes a fresh CMS read and names any submitted fields that did not persist. The current backend/test environment was not available for a live authenticated save-and-reload check. Run this with a disposable draft once the backend teammate has a local test database. |
| Empty or unavailable CMS never becomes a live sample catalogue | **Frontend pass** | Tests cover unconfigured, empty and unavailable production CMS states. Local previews remain labeled and non-bookable. |
| Inactive trip in catalogue, detail, departures and search | **Frontend pass; backend fix needed** | Frontend filters inactive list records and rejects direct inactive detail records. Departures and search use that list. Backend direct detail and per-trip departure endpoints still need anonymous 404 behavior. |
| Inactive trip in sitemap | **Code path reviewed; production crawl pending** | Sitemap trip URLs come from the same filtered `listJourneys` source. Recheck against the deployed domain and final CMS records. |
| Region/category after assignment changes | **Frontend pass** | Tests move a trip from Eastern to Far-Western and recategorize a tour; the old region/style links stop matching. Retest with saved CMS records after integration. |
| Secondary trek themes | **Preview/read support; CMS persistence pending** | Eleven stable tags from the supplied classification image can be searched and filtered. The current trip model does not store them, so admin editing is explicitly unavailable. |
| Image location, credit, permission and alt | **Warning added; CMS validation pending** | Trip editor labels cover and gallery photos unverified and marks provenance incomplete before publication. The current backend stores only image URLs; per-image fields and upload validation still need backend support. |

Frontend verification: 63 tests, TypeScript check, static link check and production build passed. A backend test run using an in-memory database could not start because the local virtual-environment Python executable was denied by Windows; no backend data was changed.
