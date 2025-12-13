import { api } from "./api";
import type { IncomesListResponse } from "../pages/incomes/types";

export const incomesService = {
  getIncomes: async (month?: number, year?: number): Promise<IncomesListResponse> => {
    let endpoint = "/incomes";
    const params = new URLSearchParams();
    
    if (month !== undefined) {
      params.append("month", month.toString());
    }
    if (year !== undefined) {
      params.append("year", year.toString());
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get(endpoint);
  },
};
