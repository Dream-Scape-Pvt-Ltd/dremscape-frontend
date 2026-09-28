/** Only site-owned trip references can become receipt navigation. */
export function receiptTripHref(slug:unknown):string {
  return typeof slug==='string'&&/^[\w-]{1,200}$/.test(slug)?`/treks/${encodeURIComponent(slug)}`:'/treks';
}
