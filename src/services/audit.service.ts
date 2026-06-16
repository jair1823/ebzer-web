import { api } from "./api";

export interface AuditEvent {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  actor_user_id: number | null;
  actor_username: string | null;
  summary: string | null;
  before_json: string | null;
  after_json: string | null;
  created_at: string;
}

export const auditService = {
  getEvents: async (params: {
    entity_type?: string;
    entity_id?: number;
    from?: string;
    to?: string;
  }): Promise<AuditEvent[]> => {
    const query = new URLSearchParams();
    if (params.entity_type) query.set("entity_type", params.entity_type);
    if (params.entity_id) query.set("entity_id", String(params.entity_id));
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return api.get<AuditEvent[]>(`/audit-events${suffix}`);
  },
};
