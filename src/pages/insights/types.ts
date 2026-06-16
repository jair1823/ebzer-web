export interface PlatformSales {
  platform: string;
  count: number;
  total: number;
}

export interface MerchantExpense {
  comercio_id: number;
  name: string;
  total: number;
}

export interface InsightsSummary {
  income_total: number;
  expense_total: number;
  profit: number;
  pending_collection: number;
  active_orders: number;
  paid_completed_orders: number;
  overdue_orders: number;
  sales_by_platform: PlatformSales[];
  top_expense_merchants: MerchantExpense[];
}
