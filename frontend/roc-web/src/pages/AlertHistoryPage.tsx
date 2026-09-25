import { useEffect, useState } from "react";
import { getAlertHistory } from "../api/alertApi";
import type { AlertHistoryItem } from "../types/alert";

import AppLayout from "../layout/AppLayout";
import AlertNavigation from "../components/alert/AlertNavigation";

import "./AlertHistoryPage.css";

const DEFAULT_PAGE_SIZE = 20;

export default function AlertHistoryPage() {
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [module, setModule] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    void loadHistory(0);
    // Initial load only. Filter/page changes are triggered explicitly below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory(targetPage: number) {
    try {
      setLoading(true);
      setError(null);

      const response = await getAlertHistory({
        from,
        to,
        module,
        priority,
        status,
        page: targetPage,
        size,
      });

      setAlerts(response.alerts);
      setPage(response.page);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử cảnh báo.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoryWithEmptyFilter() {
    try {
      setLoading(true);
      setError(null);

      const response = await getAlertHistory({
        page: 0,
        size,
      });

      setAlerts(response.alerts);
      setPage(response.page);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử cảnh báo.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    void loadHistory(0);
  }

  function handleClearFilter() {
    setFrom("");
    setTo("");
    setModule("");
    setPriority("");
    setStatus("");
    setPage(0);

    void loadHistoryWithEmptyFilter();
  }

  function handlePreviousPage() {
    if (page <= 0) return;
    void loadHistory(page - 1);
  }

  function handleNextPage() {
    if (page + 1 >= totalPages) return;
    void loadHistory(page + 1);
  }

  const firstItem = totalElements === 0 ? 0 : page * size + 1;
  const lastItem = Math.min((page + 1) * size, totalElements);

  if (loading && alerts.length === 0) {
    return (
      <AppLayout>
        <div className="alerts-page">
          <AlertNavigation />
          <div className="alerts-content">
            <div className="alerts-state">
              Đang tải lịch sử cảnh báo...
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <AppLayout>
        <div className="alerts-page">
          <AlertNavigation />
          <div className="alerts-content">
            <div className="alerts-state error">{error}</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="alerts-page">
        <AlertNavigation />

        <div className="alerts-content">
          <div className="alert-history-header">
            <div>
              <h2>Lịch sử cảnh báo</h2>
              <p>Theo dõi các cảnh báo đã phát sinh trong hệ thống.</p>
            </div>

            <div className="alert-history-total">
              {totalElements} cảnh báo
            </div>
          </div>

          <div className="alert-history-table-wrap">
            <div className="alert-history-filters">
              <div className="history-filter-field">
                <label>Từ ngày</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="history-filter-field">
                <label>Đến ngày</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <div className="history-filter-field">
                <label>Module</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                </select>
              </div>

              <div className="history-filter-field">
                <label>Ưu tiên</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
              </div>

              <div className="history-filter-field">
                <label>Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="UNREAD">Chưa đọc</option>
                  <option value="READ">Đã đọc</option>
                </select>
              </div>

              <div className="history-filter-actions">
                <button
                  type="button"
                  className="history-filter-button primary"
                  onClick={handleFilter}
                  disabled={loading}
                >
                  {loading ? "Đang lọc..." : "Lọc"}
                </button>

                <button
                  type="button"
                  className="history-filter-button"
                  onClick={handleClearFilter}
                  disabled={loading}
                >
                  Xóa lọc
                </button>
              </div>
            </div>

            {error && (
              <div className="alerts-state error">{error}</div>
            )}

            <table className="alert-history-table">
              <thead>
                <tr>
                  <th>Ưu tiên</th>
                  <th>Cảnh báo</th>
                  <th>Module</th>
                  <th>Business Date</th>
                  <th>Trạng thái</th>
                  <th>Phát hiện</th>
                  <th>Đọc lúc</th>
                  <th>Người đọc</th>
                </tr>
              </thead>

              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                      Không có cảnh báo phù hợp.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <HistoryRow key={alert.stateId} alert={alert} />
                  ))
                )}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 16px",
                borderTop: "1px solid rgba(56, 189, 248, 0.18)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Hiển thị {firstItem}–{lastItem} / {totalElements} cảnh báo
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className="history-filter-button"
                  onClick={handlePreviousPage}
                  disabled={loading || page <= 0}
                >
                  ‹ Trước
                </button>

                <span style={{ fontSize: 12, minWidth: 72, textAlign: "center" }}>
                  {totalPages === 0 ? "0 / 0" : `${page + 1} / ${totalPages}`}
                </span>

                <button
                  type="button"
                  className="history-filter-button"
                  onClick={handleNextPage}
                  disabled={loading || totalPages === 0 || page + 1 >= totalPages}
                >
                  Sau ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function HistoryRow({
  alert,
}: {
  alert: AlertHistoryItem;
}) {
  return (
    <tr>
      <td>
        <span
          className={`history-priority priority-${alert.priority.toLowerCase()}`}
        >
          {alert.priority}
        </span>
      </td>

      <td>
        <div className="history-rule-name">{alert.ruleName}</div>
        <div className="history-rule-code">{alert.ruleCode}</div>
      </td>

      <td>{alert.module}</td>
      <td>{alert.businessDate ?? "LIVE"}</td>

      <td>
        <span
          className={
            alert.status === "UNREAD"
              ? "history-status unread"
              : "history-status read"
          }
        >
          {alert.status === "UNREAD" ? "Chưa đọc" : "Đã đọc"}
        </span>
      </td>

      <td>{formatDateTime(alert.firstSeenAt)}</td>
      <td>{alert.readAt ? formatDateTime(alert.readAt) : "—"}</td>
      <td>{alert.readBy ?? "—"}</td>
    </tr>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN");
}
