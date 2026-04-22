import { useState, useEffect, useCallback } from "react";
import { incomesService } from "../services";
import type { Income, IncomeFormData } from "../pages/incomes/types";

export const useIncomes = () => {
  const [loading, setLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const createIncome = async (incomeData: IncomeFormData) => {
    const response = await incomesService.createIncome(incomeData);
    await getAllIncomes();
    return response;
  };

  const getAllIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await incomesService.getAllIncomes();
      setIncomes(response);
      return response;
    } catch (error) {
      console.error("Error fetching incomes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncome = async (incomeId: number, incomeData: any) => {
    const response = await incomesService.updateIncome(incomeId.toString(), incomeData);
    await getAllIncomes();
    setSelectedIncome(incomes.find((income) => income.id === incomeId) || null);
    return response;
  };

  const deleteIncome = async (incomeId: number) => {
    const response = await incomesService.deleteIncome(incomeId.toString());
    await getAllIncomes();
    return response;
  };

  useEffect(() => {
    getAllIncomes();
  }, [getAllIncomes]);

  return { 
    createIncome, 
    getAllIncomes, 
    updateIncome, 
    deleteIncome, 
    incomes, 
    loading, 
    selectedIncome, 
    setSelectedIncome 
  };
};
