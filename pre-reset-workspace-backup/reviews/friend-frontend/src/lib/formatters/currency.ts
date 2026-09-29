import type { SupportedCurrency } from "@/types/common";

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  NPR: "रू",
};

export function formatCurrency(
  amountInUSD: number,
  currency: SupportedCurrency = "USD",
  exchangeRates: Record<SupportedCurrency, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.52,
    NPR: 133.5,
  }
): string {
  const rate = exchangeRates[currency] || 1;
  const converted = Math.round(amountInUSD * rate);
  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  return `${symbol}${converted.toLocaleString()}`;
}
