import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../layout/AppLayout";
import AlertNavigation from "../components/alert/AlertNavigation";

import { useBusinessDate } from "../context/BusinessDateContext";
import { getOperationAlerts } from "../api/alertApi";

import type {
  AlertMetric,
  OperationAlert,
  OperationAlertsResponse,
} from "../types/alert";

import "./AlertsPage.css";



import { useAlert } from "../context/AlertContext";

export default function AlertsPage() {
  const { businessDate } = useBusinessDate();
  const navigate = useNavigate();
  const { markAlertRead } = useAlert();
  const [readingStateId, setReadingStateId] =
  useState<number | null>(null);

  const [data, setData] =
    useState<OperationAlertsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "[ALERT] loading businessDate:",
          businessDate
        );

        const result =
          await getOperationAlerts(businessDate);

        console.log(
          "[ALERT] API result:",
          result
        );

        setData(result);
      } catch (err) {
        console.error(
          "[ALERT] load error:",
          err
        );

        setError(
          "Không thể tải danh sách cảnh báo."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [businessDate]);

  async function handleAlertClick(
  alert: OperationAlert
) {
  try {
    setReadingStateId(alert.stateId);

    await markAlertRead(alert.stateId);

    if (alert.actionUrl) {
      navigate(alert.actionUrl);
    }

  } catch (error) {
    console.error(
      "Mark alert as read error:",
      error
    );

  } finally {
    setReadingStateId(null);
  }
}

  return (
    <AppLayout>
      <div className="alerts-page">

        <AlertNavigation />

        <div className="alerts-content">

          <div className="alerts-content-header">

            <div>
              <h2>
                Cảnh báo hiện tại
              </h2>

              <p>
                Business Date: {businessDate}
              </p>
            </div>

            {!loading && data && (
              <div className="alerts-count">
                {data.total} cảnh báo
              </div>
            )}

          </div>

          {loading && (
            <div className="alerts-state">
              Đang tải cảnh báo...
            </div>
          )}

          {!loading && error && (
            <div className="alerts-state error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            data &&
            data.alerts.length === 0 && (
              <div className="alerts-empty-state">

                <div className="alerts-empty-icon">
                  ✓
                </div>

                <h3>
                  Không có cảnh báo
                </h3>

                <p>
                  Không có rule nào đang thỏa
                  điều kiện cảnh báo.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            data &&
            data.alerts.length > 0 && (
              <div className="operation-alert-list">

              {data.alerts.map((alert) => (
                <AlertCard
                  key={alert.stateId}
                  alert={alert}
                  reading={
                    readingStateId === alert.stateId
                  }
                  onOpen={() =>
                    handleAlertClick(alert)
                  }
                />
              ))}

              </div>
            )}

        </div>

      </div>
    </AppLayout>
  );
}

function formatMetricValue(
  metric: AlertMetric,
  value: number
): string {
  switch (metric) {
    case "OCCUPANCY_PERCENT":
      return `${value}%`;

    case "DIRTY_ROOMS":
      return `${value} phòng`;

    case "PENDING_ARRIVALS":
      return `${value} khách/phòng`;

    case "DUE_OUT_DEPARTURES":
      return `${value} phòng`;

    default:
      return String(value);
  }
}

function AlertCard({
  alert,
  onOpen,
  reading,
}: {
  alert: OperationAlert;
  onOpen: () => void;
  reading: boolean;
}) {
  return (
    <div
      className={
        `operation-alert-card ${alert.priority.toLowerCase()}`
      }
    >

      <div className="operation-alert-priority">
        {alert.priority}
      </div>

      <div className="operation-alert-body">

        <div className="operation-alert-title-row">

          <h3>
            {alert.title}
          </h3>

          {alert.live && (
            <span className="operation-alert-live">
              <span className="live-pulse-dot" />
              LIVE
            </span>
          )}

        </div>

        <p className="operation-alert-message">
          {alert.message}
        </p>

        <div className="operation-alert-meta">

          <span>
            {alert.category}
          </span>

<span>
  Giá trị:{" "}
  {formatMetricValue(
    alert.metric,
    alert.actualValue
  )}
</span>

<span>
  Ngưỡng:{" "}
  {formatMetricValue(
    alert.metric,
    alert.thresholdValue
  )}
</span>

        </div>

      </div>

      {alert.actionUrl && (
        <button
          type="button"
          className="alert-action"
          disabled={reading}
          onClick={onOpen}
        >
          {reading
            ? "Đang mở..."
            : "Xem chi tiết →"}
        </button>
      )}

    </div>
  );  
}