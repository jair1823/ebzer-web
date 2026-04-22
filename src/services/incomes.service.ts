import { api } from "./api";

export const incomesService = {
  createIncome: async (incomeData: any) => {
    return api.post("/incomes", incomeData);
  },
  getAllIncomes: async () => {
    return api.get("/incomes");
  },
  getIncomeById: async (incomeId: string) => {
    return api.get(`/incomes/${incomeId}`);
  },
  updateIncome: async (incomeId: string, incomeData: any) => {
    return api.put(`/incomes/${incomeId}`, incomeData);
  },
  deleteIncome: async (incomeId: string) => {
    return api.delete(`/incomes/${incomeId}`);
  },
};
