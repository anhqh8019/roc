import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

import {
  getOnsenDashboard,
} from "../api/onsenApi";

import type {
  OnsenDashboardResponse,
} from "../types/onsen";

import {
  useBusinessDate,
} from "../context/BusinessDateContext";


export default function OnsenDashboardPage() {

  const {
    businessDate,
  } = useBusinessDate();

  const [data, setData] =
    useState<OnsenDashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);
        setError(null);

        const result =
          await getOnsenDashboard(
            businessDate
          );

        setData(result);

      } catch (error) {

        console.error(
          "Load Onsen dashboard error:",
          error
        );

        setError(
          "Không tải được dữ liệu tắm khoáng"
        );

      } finally {

        setLoading(false);

      }
    }

    void loadDashboard();

  }, [businessDate]);


  return (
    <AppLayout>

      {loading && !data && (
        <div className="dashboard-loading">
          Đang tải dữ liệu tắm khoáng...
        </div>
      )}


      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {data && (
        <>
          {/* HEADER */}

          <div className="onsen-page-header">

            <div>
              <h2>
                Tắm khoáng / Onsen
              </h2>

              <p>
                Theo dõi hoạt động khu khoáng nóng
              </p>
            </div>

            {data.live && (
              <div className="onsen-live-badge">
                <span className="live-pulse-dot" />
                LIVE
              </div>
            )}

          </div>


          {/* KPI */}

          <div className="dashboard-kpi-grid">

            <OnsenKpiCard
              title="Khách hiện tại"
              value={data.currentGuests}
              subtitle={
                data.live
                  ? "Đang sử dụng Onsen"
                  : "Chưa checkout trong ngày"
              }
              live={data.live}
            />

            <OnsenKpiCard
              title="Check-in"
              value={data.checkIns}
              subtitle="Tổng khách vào trong ngày"
            />

            <OnsenKpiCard
              title="Check-out"
              value={data.checkOuts}
              subtitle="Tổng khách ra trong ngày"
            />

          </div>


          {/* MAIN CONTENT */}

          <div className="dashboard-section-grid">

            <div className="dashboard-card span-8">

              <div className="onsen-panel-header">

                <div>
                  <h3 className="panel-title">
                    Onsen Operations
                  </h3>

                  <span>
                    Business Date:{" "}
                    {formatBusinessDate(
                      data.businessDate
                    )}
                  </span>
                </div>

                {data.live && (
                  <div className="onsen-live-status">
                    <span className="live-pulse-dot" />
                    LIVE STATUS
                  </div>
                )}

              </div>


              <div className="onsen-operation-grid">

                <OperationItem
                  label="Khách hiện tại"
                  value={data.currentGuests}
                  detail="Đang sử dụng Onsen"
                  live={data.live}
                />

                <OperationItem
                  label="Check-in"
                  value={data.checkIns}
                  detail="Business Date"
                />

                <OperationItem
                  label="Check-out"
                  value={data.checkOuts}
                  detail="Business Date"
                />

              </div>

            </div>


            <div className="dashboard-card span-4">

              <h3 className="panel-title">
                Trạng thái hệ thống
              </h3>

              <div className="onsen-status-panel">

                <StatusRow
                  label="Nguồn dữ liệu"
                  value="SMILE_ONSEN"
                />

                <StatusRow
                  label="Business Date"
                  value={formatBusinessDate(
                    data.businessDate
                  )}
                />

                <StatusRow
                  label="Dữ liệu"
                  value={
                    data.live
                      ? "LIVE"
                      : "HISTORICAL"
                  }
                  live={data.live}
                />

              </div>

            </div>


            {/* LIVE MAP PLACEHOLDER */}

            <div className="dashboard-card span-12">

              <div className="onsen-panel-header">

                <div>
                  <h3 className="panel-title">
                    Sơ đồ khu tắm khoáng
                  </h3>

                  <span>
                    Zone / Pool Operations
                  </span>
                </div>

              </div>

              <div className="onsen-map-placeholder">

                <strong>
                  Onsen Live Map
                </strong>

                <span>
                  Chưa có dữ liệu vị trí khách
                  theo từng khu / bể.
                </span>

                <small>
                  Tổng khách hiện tại:{" "}
                  {data.currentGuests}
                </small>

              </div>

            </div>

          </div>
        </>
      )}

    </AppLayout>
  );
}


function OnsenKpiCard({
  title,
  value,
  subtitle,
  live = false,
}: {
  title: string;
  value: number;
  subtitle: string;
  live?: boolean;
}) {

  return (
    <div className="dashboard-card kpi-card">

      <div className="dashboard-card-title">
        {title}

        {live && (
          <span className="onsen-kpi-live">
            <span className="live-pulse-dot" />
            LIVE
          </span>
        )}
      </div>

      <div className="dashboard-card-value">
        {value}
      </div>

      <div className="dashboard-card-subtitle">
        {subtitle}
      </div>

    </div>
  );
}


function OperationItem({
  label,
  value,
  detail,
  live = false,
}: {
  label: string;
  value: number;
  detail: string;
  live?: boolean;
}) {

  return (
    <div className="onsen-operation-item">

      <div className="onsen-operation-label">
        {label}

        {live && (
          <span className="onsen-operation-live">
            <span className="live-pulse-dot" />
            LIVE
          </span>
        )}

      </div>

      <strong>
        {value}
      </strong>

      <span>
        {detail}
      </span>

    </div>
  );
}


function StatusRow({
  label,
  value,
  live = false,
}: {
  label: string;
  value: string;
  live?: boolean;
}) {

  return (
    <div className="onsen-status-row">

      <span>
        {label}
      </span>

      <strong
        className={
          live
            ? "onsen-status-live"
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}


function formatBusinessDate(
  value: string
) {

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}