import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

 
import {
  useBusinessDate,
} from "../context/BusinessDateContext";

import type {
  OnsenDashboardResponse,
  OnsenPackageSummary,
} from "../types/onsen";

import {
  getOnsenDashboard,
  getOnsenPackageSummary,
} from "../api/onsenApi";


export default function OnsenDashboardPage() {


  const [
  packageSummary,
  setPackageSummary,
] = useState<OnsenPackageSummary[]>([]);

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

  let cancelled = false;

  async function loadData() {

    try {

      setLoading(true);
      setError(null);

      const [
        dashboardData,
        packageData,
      ] = await Promise.all([
        getOnsenDashboard(businessDate),
        getOnsenPackageSummary(businessDate),
      ]);

      if (cancelled) {
        return;
      }

      setData(dashboardData);
      setPackageSummary(packageData);

    } catch (error) {

      console.error(
        "Failed to load Onsen dashboard",
        error
      );

      if (!cancelled) {
        setError(
          "Không thể tải dữ liệu Tắm khoáng."
        );
      }

    } finally {

      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    cancelled = true;
  };

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

             <section className="dashboard-card span-8">

  <div className="panel-header">

    <div>
      <div className="panel-title">
        Lượt khách theo gói
      </div>

      <div className="panel-subtitle">
        Cơ cấu sử dụng dịch vụ trong ngày
      </div>
    </div>

    <div className="onsen-package-total">
      {packageSummary.reduce(
        (sum, item) =>
          sum + item.guests,
        0
      )} lượt
    </div>

  </div>

  <PackageSummary
    items={packageSummary}
  />

</section>     

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

function PackageSummary({
  items,
}: {
  items: OnsenPackageSummary[];
}) {

  const maxGuests = Math.max(
    ...items.map((item) => item.guests),
    1
  );

  const totalGuests = items.reduce(
    (sum, item) => sum + item.guests,
    0
  );

  if (items.length === 0) {
    return (
      <div className="onsen-empty-state">
        Không có lượt khách theo gói
        trong ngày này.
      </div>
    );
  }

  return (
    <div className="onsen-package-list">

      {items.map((item) => {

        const barWidth =
          (item.guests / maxGuests) * 100;

        const percentage =
          totalGuests > 0
            ? (item.guests / totalGuests) * 100
            : 0;

        return (
          <div
            key={item.packageCode}
            className="onsen-package-row"
          >

            <div className="onsen-package-header">

              <div>
                <strong>
                  {item.packageCode}
                </strong>

                <span className="onsen-package-name">
                  {item.packageName ??
                    item.packageCode}
                </span>
              </div>

              <div className="onsen-package-value">
                <strong>
                  {item.guests}
                </strong>

                <span>
                  {percentage.toFixed(1)}%
                </span>
              </div>

            </div>

            <div className="onsen-package-bar">

              <div
                className="onsen-package-bar-fill"
                style={{
                  width: `${barWidth}%`,
                }}
              />

            </div>

            <div className="onsen-package-meta">
              <span>
                Check-in: {item.checkIns}
              </span>

              <span>
                Check-out: {item.checkOuts}
              </span>
            </div>

          </div>
        );
      })}

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