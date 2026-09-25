# CRM browser tests

Playwright tests for the staff CRM at `/admin`. They drive the real app in your
installed Chrome, against dev servers you have already started.

## Run

1. Start Django on port 8001 and Next on port 3000:
   ```
   cd backend  && python manage.py runserver 8001
   cd frontend && npm run dev
   ```
2. Create the two test staff accounts (DEBUG only; re-run any time to reset them):
   ```
   cd backend && python manage.py seed_crm_e2e --password "<at least 12 chars>"
   ```
   This creates `e2e-admin@dreamscape.test` (ADMIN) and `e2e-agent@dreamscape.test` (SALES_AGENT).
3. Run the tests with the same password:
   ```
   cd frontend
   E2E_PASSWORD="<same password>" npx playwright test          # bash
   $env:E2E_PASSWORD="<same password>"; npx playwright test     # PowerShell
   ```

Each run submits one real inquiry (`E2E Traveller <timestamp>`) and a tag
(`e2e-<timestamp>`) into your dev database and closes that inquiry.

## Notes

- The API throttles by IP: 10 logins per hour and 10 inquiry submissions per hour.
  Each run uses 3 logins and 1 submission. Throttle counts are held in memory,
  so restarting `runserver` resets them.
- The first run after starting `next dev` can be slow while routes compile.
  If a step times out on "Saving…", run it again.
- On failure, open the trace: `npx playwright show-trace test-results/<test>/trace.zip`.
  Browser console errors are listed as annotations in `test-results/e2e-report.json`.
