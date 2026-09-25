export type AlertMetric =
  | "DIRTY_ROOMS"
  | "PENDING_ARRIVALS"
  | "DUE_OUT_DEPARTURES"
  | "OCCUPANCY_PERCENT";

export type AlertOperator =
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "EQ";

export type AlertPriority =
  | "P1"
  | "P2"
  | "P3"
  | "P4";

export interface AlertRule {
  id: number;
  ruleCode: string;
  ruleName: string;
  module: string;
  metric: AlertMetric;
  operator: AlertOperator;
  thresholdValue: number;
  priority: AlertPriority;
  messageTemplate: string | null;
  actionUrl: string | null;
  activeFrom: string | null;
  activeUntil: string | null;
  enabled: boolean;
}

export interface AlertRuleRequest {
  ruleCode: string;
  ruleName: string;
  module: string;
  metric: AlertMetric;
  operator: AlertOperator;
  thresholdValue: number;
  priority: AlertPriority;
  messageTemplate: string | null;
  actionUrl: string | null;
  activeFrom: string | null;
  activeUntil: string | null;
  enabled: boolean;
}

export interface OperationAlert {
  stateId: number;
  ruleId: number;
  ruleCode: string;
  metric: AlertMetric;
  priority: AlertPriority;
  category: string;
  title: string;
  message: string;
  actualValue: number;
  thresholdValue: number;
  actionUrl: string | null;
  live: boolean;
}

export interface OperationAlertsResponse {
  businessDate: string;
  total: number;
  alerts: OperationAlert[];
}

export interface AlertHistoryItem {
  stateId: number;
  ruleCode: string;
  ruleName: string;
  module: string;
  priority: "P1" | "P2" | "P3" | "P4";
  businessDate: string | null;
  status: "UNREAD" | "READ";
  firstSeenAt: string;
  lastSeenAt: string;
  readAt: string | null;
  readBy: string | null;
}

export interface AlertHistoryResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  alerts: AlertHistoryItem[];
}