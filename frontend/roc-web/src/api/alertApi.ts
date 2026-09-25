import { api } from "./hotelApi";

import type {
  AlertRule,
  AlertRuleRequest,
  OperationAlertsResponse,
  AlertHistoryResponse,
} from "../types/alert";

 

export async function getAlertRules(): Promise<AlertRule[]> {
  const response =
    await api.get<AlertRule[]>(
      "/admin/alert-rules"
    );

  return response.data;
}

export async function createAlertRule(
  request: AlertRuleRequest
): Promise<{ id: number }> {

  const response =
    await api.post<{ id: number }>(
      "/admin/alert-rules",
      request
    );

  return response.data;
}

export async function updateAlertRule(
  id: number,
  request: AlertRuleRequest
): Promise<void> {

  await api.put(
    `/admin/alert-rules/${id}`,
    request
  );
}

export async function setAlertRuleEnabled(
  id: number,
  enabled: boolean
): Promise<void> {

  await api.patch(
    `/admin/alert-rules/${id}/enabled`,
    {
      enabled,
    }
  );
}

export async function deleteAlertRule(
  id: number
): Promise<void> {

  await api.delete(
    `/admin/alert-rules/${id}`
  );
}

export async function getOperationAlerts(
  businessDate: string
): Promise<OperationAlertsResponse> {

  const response =
    await api.get<OperationAlertsResponse>(
      "/alerts/operations",
      {
        params: {
          date: businessDate,
        },
      }
    );

  return response.data;
}

export interface AlertUnreadCountResponse {
  count: number;
}

export async function getAlertUnreadCount(): Promise<number> {
  const response =
    await api.get<AlertUnreadCountResponse>(
      "/alerts/unread-count"
    );

  return response.data.count;
}
 

export interface AlertHistoryFilter {
  from?: string;
  to?: string;
  module?: string;
  priority?: string;
  status?: string;
  page?: number;
  size?: number;
}

export async function getAlertHistory(
  filter: AlertHistoryFilter = {}
): Promise<AlertHistoryResponse> {

  const response =
    await api.get<AlertHistoryResponse>(
      "/alerts/history",
      {
        params: {
          from: filter.from || undefined,
          to: filter.to || undefined,
          module: filter.module || undefined,
          priority: filter.priority || undefined,
          status: filter.status || undefined,
          page: filter.page ?? 0,
          size: filter.size ?? 20,
        },
      }
    );

  return response.data;
}

export async function markAlertRead(
  stateId: number
): Promise<void> {
  await api.patch(
    `/alerts/${stateId}/read`
  );
}

