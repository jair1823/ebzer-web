export interface Income {
  id: number;
  client_name: string;
  amount: number;
  date: string;
}

export interface IncomesListResponse {
  incomes: Income[];
  total_income: number;
}
