import { useState, useEffect, useCallback } from "react";
import { incomesService } from "../services";
import type { Income } from "../pages/incomes/types";

export const useIncomes = () => {
  const [loading, setLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await incomesService.getIncomes(month, year);
      setIncomes(response.incomes);
      setTotalIncome(response.total_income);
      return response;
    } catch (error) {
      //todo handle error properly
      console.error("Error fetching incomes:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return { 
    incomes, 
    totalIncome, 
    loading, 
    month, 
    year, 
    setMonth, 
    setYear, 
    fetchIncomes 
  };
};
