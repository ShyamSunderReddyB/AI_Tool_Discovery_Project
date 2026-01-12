import { create } from "zustand";
import { PricingModel, ToolFilters } from "@/types";

interface FilterState {
  filters: ToolFilters;
  setCategory: (category: string | undefined) => void;
  setPricingModels: (models: PricingModel[]) => void;
  setMinRating: (rating: number | undefined) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

const defaultFilters: ToolFilters = {
  page: 1,
  pageSize: 12,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,

  setCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, category, page: 1 },
    })),

  setPricingModels: (pricingModel) =>
    set((state) => ({
      filters: { ...state.filters, pricingModel, page: 1 },
    })),

  setMinRating: (minRating) =>
    set((state) => ({
      filters: { ...state.filters, minRating, page: 1 },
    })),

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search: search || undefined, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  clearFilters: () => set({ filters: defaultFilters }),
}));
