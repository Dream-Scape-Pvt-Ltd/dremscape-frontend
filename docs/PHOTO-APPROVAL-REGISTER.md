# Photo approval register

Only mark an image **approved** after the company confirms its subject/location and its right to publish it. A descriptive filename or an image already in the repository is not proof of either.

| Placement | Current image | Location confirmed? | Permission / credit confirmed? | Publish status |
| --- | --- | --- | --- | --- |
| Eastern Nepal region | See `src/lib/nepal-zones.ts` | Pending | Pending | Illustrative |
| Central Nepal region | See `src/lib/nepal-zones.ts` | Pending | Pending | Illustrative |
| Western Nepal region | See `src/lib/nepal-zones.ts` | Pending | Pending | Illustrative |
| Mid-Western Nepal region | See `src/lib/nepal-zones.ts` | Pending | Pending | Illustrative |
| Far-Western Nepal region | See `src/lib/nepal-zones.ts` | Pending | Pending | Illustrative |
| Chairman & CEO portrait | `public/images/team/amar-jung-lama.webp` | Identity to confirm | Company publication consent pending | Preview |
| Co-founder & Director portrait | `public/images/team/saput-man-tama.webp` | Identity to confirm | Company publication consent pending | Preview |
| Gallery collection | `src/lib/editorial-content.ts` | Pending per photo | Pending per photo | Design inspiration |
| Preview tour and trek cards | `src/lib/catalog.ts` | Pending per photo | Pending per photo | Clearly labelled illustration |

Four Upper Mustang photographs already have author, source and Creative Commons license details in `src/components/journey-detail.tsx`. Recheck their source pages, attribution display and whether the pictured location matches each route before publication. Do not copy photos or prose from another travel company's website without permission.

For every approved CMS photo, record: `image`, `location`, `description/alt`, `photographer`, `source`, `license or signed permission`, `required on-page credit`, `approval date`, and `approved by`. The CMS handoff describes corresponding fields for region records.
