/**
 * A trek category as admin manages it. Categories with a `menu` (a header menu's
 * slug) are that menu's items, and a trek's category decides where it appears.
 */
export type MenuItem = { id?: string; slug: string; name: string; description: string; menu: string | null; sort_order: number; is_active?: boolean };

/**
 * Treks still on an old, non-menu category are placed by the keyword rules that
 * the hard-coded menus used. Only the originally seeded items have such a rule.
 */
export const legacyMatch: Record<string, { region?: string; tour?: string }> = {
  everest: { region: 'everest' }, langtang: { region: 'langtang' }, annapurna: { region: 'annapurna' },
  manaslu: { region: 'manaslu' }, mustang: { region: 'mustang' }, 'off-the-beaten-path': { region: 'off-the-beaten' },
  'wildlife-tours': { tour: 'wildlife' }, 'luxury-tours': { tour: 'luxury' }, 'culture-sightseeing': { tour: 'culture' },
  'day-tours': { tour: 'day' }, 'heli-tours': { tour: 'heli' },
  'everest-climbing': { region: 'everest' }, 'annapurna-climbing': { region: 'annapurna' },
};

export function sortMenuItems<T extends { sort_order: number; name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}
