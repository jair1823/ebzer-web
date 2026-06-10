import { api } from "./api";
import type { Income, IncomeFormData } from "../pages/incomes/types";

export const incomesService = {
  createIncome: async (incomeData: IncomeFormData): Promise<Income> => {
    return api.post<Income, IncomeFormData>("/incomes", incomeData);
  },
  getAllIncomes: async (): Promise<Income[]> => {
    return api.get<Income[]>("/incomes");
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
