import {expect, test, type Page} from '@playwright/test';

const password = process.env.E2E_PASSWORD;
const ADMIN = 'e2e-admin@dreamscape.test';
const AGENT = 'e2e-agent@dreamscape.test';

test.skip(!password, 'Set E2E_PASSWORD (and run `manage.py seed_crm_e2e`) to run the CRM browser tests.');

test.beforeEach(async ({page}, testInfo) => {
  // The Next dev "Issues" badge sits on top of the sidebar's Sign out button.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'nextjs-portal{display:none!important}';
      document.head.append(style);
    });
  });
  // Surface browser errors in the report instead of only in the dev overlay.
  page.on('pageerror', error => testInfo.annotations.push({type: 'page error', description: error.message}));
  page.on('console', message => {
    if (message.type() === 'error') testInfo.annotations.push({type: 'console error', description: message.text().slice(0, 500)});
  });
});

async function login(page: Page, email: string) {
  await page.goto('/admin');
  await expect(page.getByRole('heading', {name: 'Login to continue'})).toBeVisible();
  await page.getByPlaceholder('Email address').fill(email);
  await page.getByPlaceholder('Password').fill(password!);
  await page.getByRole('button', {name: 'Login', exact: true}).click();
  // The full staff dashboard, not the short-lived inquiries-only replacement.
  await expect(page.getByRole('navigation', {name: 'Admin navigation'})).toBeVisible();
}

test('a website inquiry can be worked from intake to closed in the staff CRM', async ({page, baseURL}) => {
  const stamp = Date.now();
  const traveller = `E2E Traveller ${stamp}`;
  const email = `e2e-${stamp}@example.com`;

  // 1. Public intake through the website's own proxy.
  const intake = await page.request.post('/api/inquiries', {
    headers: {origin: baseURL!},
    data: {full_name: traveller, email, message: 'We would love to trek in the spring.'},
  });
  expect(intake.status()).toBe(201);
  const {reference} = await intake.json();
  expect(reference).toMatch(/^[\w-]+$/);

  // 2. Staff login.
  await login(page, ADMIN);

  // 3. Find and open the lead.
  const nav = page.getByRole('navigation', {name: 'Admin navigation'});
  await nav.getByRole('button', {name: 'Inquiries'}).click();
  await page.getByPlaceholder('Search traveler, email, or reference').fill(email);
  await page.getByRole('button', {name: `Open inquiry from ${traveller}`}).click();
  const drawer = page.getByRole('complementary', {name: 'Inquiry details'});
  await expect(drawer.getByText(reference)).toBeVisible();
  await expect(drawer.getByText('We would love to trek in the spring.')).toBeVisible();

  // 4. Internal note.
  await drawer.getByPlaceholder('Add an internal note').fill('Prefers a small group in April.');
  await drawer.getByRole('button', {name: 'Add note'}).click();
  await expect(drawer.getByText('Prefers a small group in April.')).toBeVisible();

  // 5. Closing requires a lost reason.
  await drawer.locator('dd select').first().selectOption('CLOSED');
  const confirm = drawer.getByRole('button', {name: 'Confirm close'});
  await expect(confirm).toBeDisabled();
  await drawer.locator('dd select').nth(1).selectOption('PRICE');
  await confirm.click();
  await expect.poll(async () => {
    const res = await page.request.get(`/api/admin/inquiries/${reference}`);
    const body = await res.json();
    return [body.data?.status, body.data?.lost_reason];
  }).toEqual(['CLOSED', 'PRICE']);
  // The drawer keeps the full lead after a status change.
  await expect(drawer.getByText('We would love to trek in the spring.')).toBeVisible();

  // 6. Pipeline analytics load for staff.
  await nav.getByRole('button', {name: 'CRM'}).click();
  for (const path of ['/api/admin/crm/pipeline-summary', '/api/admin/crm/funnel', '/api/admin/crm/treks']) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }

  // 7. Signing out locks the workspace again.
  await page.getByRole('button', {name: 'Sign out'}).click();
  await expect(page.getByRole('heading', {name: 'Login to continue'})).toBeVisible();
});

test('revenue grows only when a trek is completed, plus manual entries', async ({page, baseURL}) => {
  const stamp = Date.now();
  await login(page, ADMIN);
  const thisMonth = async () => {
    const res = await page.request.get('/api/admin/crm/revenue?months=6');
    expect(res.status()).toBe(200);
    return (await res.json()).data.totals.this_month as number;
  };
  const before = await thisMonth();

  // A departure with room for two travellers.
  const departures = (await (await page.request.get('/api/admin/departures')).json()).data.results as {id: string; price_usd: string; available_seats: number; status: string}[];
  const departure = departures.find(d => d.available_seats >= 2 && d.status !== 'CANCELLED');
  test.skip(!departure, 'Needs a departure with at least two free seats.');

  const intake = await page.request.post('/api/inquiries', {
    headers: {origin: baseURL!},
    data: {full_name: `E2E Revenue ${stamp}`, email: `e2e-rev-${stamp}@example.com`, message: 'Revenue check.'},
  });
  const {reference} = await intake.json();
  const patch = (data: Record<string, unknown>) => page.request.patch(`/api/admin/inquiries/${reference}`, {headers: {origin: baseURL!}, data});

  // Booking takes seats but earns nothing yet.
  expect((await patch({status: 'BOOKED', departure_id: departure!.id, travelers_count: 2})).status()).toBe(200);
  expect(await thisMonth()).toBe(before);

  // Completing the trek counts price x travellers.
  expect((await patch({status: 'COMPLETED'})).status()).toBe(200);
  const earned = Math.round(Number(departure!.price_usd) * 2 * 100) / 100;
  expect(await thisMonth()).toBeCloseTo(before + earned, 2);

  // The Revenue page shows it, and a manual entry adds on top.
  await page.getByRole('navigation', {name: 'Admin navigation'}).getByRole('button', {name: 'Revenue'}).click();
  await expect(page.getByText(`E2E Revenue ${stamp} completed`)).toBeVisible();
  await page.getByLabel('Amount (USD)').fill('125');
  await page.getByLabel('Description').fill(`E2E manual ${stamp}`);
  await page.getByRole('button', {name: 'Add revenue'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Revenue added.'})).toBeVisible();
  expect(await thisMonth()).toBeCloseTo(before + earned + 125, 2);

  // Removing the manual entry takes it back out.
  page.once('dialog', dialog => void dialog.accept());
  await page.getByRole('button', {name: `Remove E2E manual ${stamp}`}).click();
  await expect(page.getByRole('button', {name: `Remove E2E manual ${stamp}`})).toHaveCount(0);
  expect(await thisMonth()).toBeCloseTo(before + earned, 2);
});

test('a sales agent can work leads', async ({page}) => {
  await login(page, AGENT);
  expect((await page.request.get('/api/admin/crm/funnel')).status()).toBe(200);
  expect((await page.request.get('/api/admin/inquiries')).status()).toBe(200);
});

test('wrong credentials stay on the login screen with an error', async ({page}) => {
  await page.goto('/admin');
  await page.getByPlaceholder('Email address').fill(ADMIN);
  await page.getByPlaceholder('Password').fill('definitely-not-the-password');
  await page.getByRole('button', {name: 'Login', exact: true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Admin navigation'})).toHaveCount(0);
});
