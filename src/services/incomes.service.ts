import { api } from "./api";
import type { Income, IncomeFormData } from "../pages/incomes/types";

interface IncomeFilters {
  from?: string;
  to?: string;
}

export const incomesService = {
  createIncome: async (incomeData: IncomeFormData): Promise<Income> => {
    return api.post<Income, IncomeFormData>("/incomes", incomeData);
  },
  getAllIncomes: async (filters: IncomeFilters = {}): Promise<Income[]> => {
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    const query = params.toString();
    return api.get<Income[]>(query ? `/incomes?${query}` : "/incomes");
  },
  getIncomeById: async (incomeId: string): Promise<Income> => {
    return api.get<Income>(`/incomes/${incomeId}`);
  },
  updateIncome: async (
    incomeId: string,
    incomeData: IncomeFormData
  ): Promise<Income> => {
    return api.put<Income, IncomeFormData>(`/incomes/${incomeId}`, incomeData);
  },
  deleteIncome: async (incomeId: string) => {
    return api.delete(`/incomes/${incomeId}`);
  },
};
