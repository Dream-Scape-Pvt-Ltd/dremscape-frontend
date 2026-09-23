# Editing the location

With the backend connected, open `/admin` → Settings. Edit city, neighbourhood, office address, map query, zoom and arrival directions. The Contact and Our Story maps read this shared record on each page request.

`src/content/company-location.json` is a fallback only. Editing that file does not override a saved CMS location. The current map marks a Hotel Avalon landmark; confirm the exact entrance before launch.

See `LAUNCH-HANDOFF.md` for the complete editing and deployment guide.
