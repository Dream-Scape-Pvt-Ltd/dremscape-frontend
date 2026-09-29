"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SupportedCurrency, UnitSystem } from "@/types/common";
export type { SupportedCurrency, UnitSystem };

interface PreferencesState {
  currency: SupportedCurrency;
  exchangeRates: Record<SupportedCurrency, number>;
  unitSystem: UnitSystem;
  setCurrency: (currency: SupportedCurrency) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  setExchangeRates: (rates: Record<SupportedCurrency, number>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: "USD",
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        AUD: 1.52,
        NPR: 133.5,
      },
      unitSystem: "metric",
      setCurrency: (currency) => set({ currency }),
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setExchangeRates: (exchangeRates) => set({ exchangeRates }),
    }),
    {
      name: "dreamscape-preferences",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (null as any))),
    }
  )
);
