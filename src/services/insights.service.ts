import { api } from "./api";
import type { InsightsSummary } from "../pages/insights/types";

export const insightsService = {
  getSummary: async (params?: { from?: string; to?: string }): Promise<InsightsSummary> => {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return api.get<InsightsSummary>(`/insights/summary${suffix}`);
  },
};
