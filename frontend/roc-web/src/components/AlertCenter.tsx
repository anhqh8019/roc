// src/components/AlertCenter.tsx

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getOperationAlerts,
} from "../api/alertApi";

import {
  useAlert,
} from "../context/AlertContext";

import type {
  OperationAlert,
  OperationAlertsResponse,
} from "../types/alert";

interface AlertCenterProps {
  businessDate: string;
}

export default function AlertCenter({
  businessDate,
}: AlertCenterProps) {
  const navigate = useNavigate();
  const { markAlertRead } = useAlert();

  const [data, setData] =
    useState<OperationAlertsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [readingStateId, setReadingStateId] =
    useState<number | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getOperationAlerts(businessDate);

        setData(result);
      } catch (err) {
        console.error(
          "Load dashboard alerts error:",
          err
        );

        setError(
          "Không tải được cảnh báo."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAlerts();
  }, [businessDate]);

  async function handleAlertClick(
    alert: OperationAlert
  ) {
    if (!alert.actionUrl) {
      return;
    }

    try {
      setReadingStateId(alert.stateId);

      await markAlertRead(
        alert.stateId
      );

      navigate(alert.actionUrl);
    } catch (err) {
      console.error(
        "Mark dashboard alert as read error:",
        err
      );
    } finally {
      setReadingStateId(null);
    }
  }

  const alerts = data?.alerts ?? [];

  return (
    <div className="alert-center">

      <div className="alert-center-header">
        <div>
          <h3>Cảnh báo vận hành</h3>

          <span>
            Rule Engine · Business Date {businessDate}
          </span>
        </div>

        <div className="alert-count">
          {loading ? "…" : data?.total ?? 0}
        </div>
      </div>

      <div className="alert-list">

        {loading && (
          <div className="alert-center-state">
            Đang tải cảnh báo...
          </div>
        )}

        {!loading && error && (
          <div className="alert-center-state">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          alerts.length === 0 && (
            <div className="alert-center-state">
              Không có cảnh báo đang kích hoạt.
            </div>
          )}

        {!loading &&
          !error &&
          alerts.map((alert) => (
            <button
              type="button"
              key={alert.stateId}
              className={
                `alert-item ${priorityClass(
                  alert.priority
                )}`
              }
              onClick={() =>
                void handleAlertClick(alert)
              }
              disabled={
                !alert.actionUrl ||
                readingStateId === alert.stateId
              }
            >
              <div
                className="alert-status-dot"
              />

              <div className="alert-content">

                <div className="alert-item-header">
                  <strong>
                    {alert.title}
                  </strong>

                  <span>
                    {alert.live
                      ? "LIVE"
                      : businessDate}
                  </span>
                </div>

                <p>
                  {alert.message}
                </p>

              </div>
            </button>
          ))}

      </div>

    </div>
  );
}

function priorityClass(
  priority: OperationAlert["priority"]
) {
  switch (priority) {
    case "P1":
      return "alert-critical";

    case "P2":
    case "P3":
      return "alert-warning";

    case "P4":
    default:
      return "alert-info";
  }
}
