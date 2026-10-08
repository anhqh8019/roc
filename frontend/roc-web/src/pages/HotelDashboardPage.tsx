import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

import HotelTrendSection from
  "../components/HotelTrendSection";

import RevenueMixChart from
  "../components/RevenueMixChart";

 import {
  useNavigate,
} from "react-router-dom";

import AlertCenter from
  "../components/AlertCenter";

import {
  getHotelDashboard,
   getRooms,
} from "../api/hotelApi";

import {
  getOnsenDashboard,
  getOnsenPackageSummary,
   getOnsenTrend,
} from "../api/onsenApi";

import type {
  OnsenDashboardResponse,
  OnsenPackageSummary, 
    OnsenTrendItem,
  OnsenTrendPeriod,

} from "../types/onsen";

import type {
  HotelDashboardResponse,
  RoomStatusResponse,
} from "../types/hotel";

import {
  useBusinessDate,
} from "../context/BusinessDateContext";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatMoney(value: number) {
  return new Intl.NumberFormat(
    "vi-VN",
    {
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export default function HotelDashboardPage() {
  /*
   * Business Date dùng chung toàn ROC.
   *
   * Không tạo state date riêng ở Dashboard nữa.
   */
  const {
    businessDate,
  } = useBusinessDate();

  const navigate = useNavigate();

  const [data, setData] =
    useState<HotelDashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [rooms, setRooms] =
  useState<RoomStatusResponse[]>([]);

  const [onsenTrendPeriod, setOnsenTrendPeriod] =
  useState<OnsenTrendPeriod>("WEEK");

const [onsenTrend, setOnsenTrend] =
  useState<OnsenTrendItem[]>([]);

const [onsenTrendLoading, setOnsenTrendLoading] =
  useState(false);

  const [onsenData, setOnsenData] =
  useState<OnsenDashboardResponse | null>(
    null
  );

const [
  onsenPackages,
  setOnsenPackages,
] = useState<OnsenPackageSummary[]>([]);

const [onsenLoading, setOnsenLoading] =
  useState(false);

  /*
   * Khi Business Date trên TopHeader thay đổi,
   * effect này sẽ tự chạy lại.
   */
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getHotelDashboard(
            businessDate
          );

        setData(result);
      } catch (error) {
        console.error(
          "Load dashboard error:",
          error
        );

        setError(
          "Không tải được dữ liệu dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [businessDate]);

  /**Onsen**/
useEffect(() => {

  let cancelled = false;

  async function loadOnsenTrend() {

    try {

      setOnsenTrendLoading(true);

      const result =
        await getOnsenTrend(
          businessDate,
          onsenTrendPeriod
        );

      if (!cancelled) {
        setOnsenTrend(result);
      }

    } catch (error) {

      console.error(
        "Load Onsen trend error:",
        error
      );

      if (!cancelled) {
        setOnsenTrend([]);
      }

    } finally {

      if (!cancelled) {
        setOnsenTrendLoading(false);
      }
    }
  }

  loadOnsenTrend();

  return () => {
    cancelled = true;
  };

}, [
  businessDate,
  onsenTrendPeriod,
]);


  /*
 * Room Operations là dữ liệu LIVE.
 * Không phụ thuộc Business Date.
 */
useEffect(() => {
  async function loadRooms() {
    try {
      const result = await getRooms();
      setRooms(result);
    } catch (error) {
      console.error(
        "Load live rooms error:",
        error
      );
    }
  }

  loadRooms();
}, []);

useEffect(() => {

  let cancelled = false;

  async function loadOnsen() {

    try {

      setOnsenLoading(true);

      const [
        dashboardResult,
        packageResult,
      ] = await Promise.all([
        getOnsenDashboard(businessDate),
        getOnsenPackageSummary(businessDate),
      ]);

      if (cancelled) {
        return;
      }

      setOnsenData(dashboardResult);
      setOnsenPackages(packageResult);

    } catch (error) {

      console.error(
        "Load Onsen CEO snapshot error:",
        error
      );

      if (!cancelled) {
        setOnsenData(null);
        setOnsenPackages([]);
      }

    } finally {

      if (!cancelled) {
        setOnsenLoading(false);
      }
    }
  }

  loadOnsen();

  return () => {
    cancelled = true;
  };

}, [businessDate]);

const totalLiveRooms = rooms.length;

const occupiedLiveRooms =
  rooms.filter(
    (room) =>
      room.occupancyStatus === "OCCUPIED"
  ).length;

const availableLiveRooms =
  rooms.filter(
    (room) =>
      room.occupancyStatus === "VACANT"
  ).length;

const dirtyLiveRooms =
  rooms.filter(
    (room) =>
      room.housekeepingStatus === "DIRTY"
  ).length;

const totalOnsenPackageVisits =
  onsenPackages.reduce(
    (sum, item) =>
      sum + item.guests,
    0
  );

  return (
    <AppLayout>
      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && !data && (
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =====================================================
          DASHBOARD
          ===================================================== */}

      {data && (
        <>
          {/* =================================================
              KPI ROW
              ================================================= */}

          <div className="dashboard-kpi-grid">
            <KpiCard
              title="Doanh thu hôm nay"
              value={`${formatMoney(
                data.revenue.totalNetRevenue
              )} đ`}
              subtitle="Net revenue"
            />

            <KpiCard
              title="Công suất phòng"
              value={`${data.inventory.occupancyPercent}%`}
              subtitle={`${data.inventory.occupiedRooms}/${data.inventory.totalRooms} rooms`}
            />

            <KpiCard
              title="Khách đang lưu trú"
              value={
                data.guestFlow.inHouse
              }
              subtitle={`${data.guestFlow.adults} người lớn`}
            />
          <KpiCard
            title="Doanh thu phòng"
            value={`${formatMoney(
              data.revenue.roomNetRevenue
            )} đ`}
            subtitle="Room net revenue"
          />
            <KpiCard
              title="Doanh thu nhà hàng"
              value={`${formatMoney(
                data.revenue
                  .foodBeverageRevenue
              )} đ`}
            />

            <KpiCard
              title="Doanh thu Onsen"
              value={`${formatMoney(
                data.revenue.onsenRevenue
              )} đ`}
            />

            <KpiCard
              title="ADR"
              value={`${formatMoney(
                data.revenue.adr
              )} đ`}
            />

            <KpiCard
              title="RevPAR"
              value={`${formatMoney(
                data.revenue.revPar
              )} đ`}
            />

 

          </div>

          {/* =================================================
              MAIN DASHBOARD GRID
              ================================================= */}

          <div className="dashboard-section-grid">
            {/* =============================================
                HOTEL PERFORMANCE
                ============================================= */}

            <div className="dashboard-card span-8">
              <HotelTrendSection
                selectedDate={
                  businessDate
                }
              />
            </div>

            {/* =============================================
                REVENUE MIX + ALERT CENTER
                ============================================= */}

            <div className="dashboard-card span-4 revenue-alert-card">
              <div className="revenue-section">
                <h3 className="panel-title">
                  Cơ cấu doanh thu
                </h3>

                <RevenueMixChart
                  data={data}
                />
              </div>

              <div className="revenue-alert-divider" />

              <AlertCenter businessDate={businessDate} />
            </div>

            {/* =============================================
                ROOM MAP
                ============================================= */}

              {/* =============================================
    HOTEL OPERATIONS
    ============================================= */}

<div className="dashboard-card span-8">
  <div className="hotel-operations-header">
    <div>
      <h3 className="panel-title">
        Hotel Operations
      </h3>

      <div className="hotel-operations-date">
        Business Date: {formatBusinessDate(businessDate)}
      </div>
    </div>

    <button
      type="button"
      className="hotel-operations-link"
      onClick={() =>
        navigate("/hotel")
      }
    >
      Xem Room Operations →
    </button>
  </div>

  <div className="hotel-operations-grid">
<OperationItem
  label="Occupied"
  value={`${occupiedLiveRooms}/${totalLiveRooms}`}
  detail="LIVE"
  live
  onClick={() =>
    navigate("/hotel")
  }
/>

<OperationItem
  label="Available"
  value={availableLiveRooms}
  detail="LIVE"
  live
  onClick={() =>
    navigate("/hotel")
  }
/>

<OperationItem
  label="Arrivals"
  value={data.guestFlow.arrivals}
  detail="Business Date"
  onClick={() =>
    navigate("/hotel/arrivals")
  }
/>

<OperationItem
  label="Departures"
  value={data.guestFlow.departures}
  detail="Business Date"
  onClick={() =>
    navigate("/hotel/departures")
  }
/>

<OperationItem
  label="In-house"
  value={data.guestFlow.inHouse}
  detail={`${data.guestFlow.adults} NL + ${data.guestFlow.children} TE`}
  onClick={() =>
    navigate("/hotel/in-house")
  }
/>

<OperationItem
  label="Dirty Rooms"
  value={dirtyLiveRooms}
  detail="LIVE"
  live
  onClick={() =>
    navigate("/hotel")
  }
/>
  </div>
</div>  

            {/* =============================================
                HOUSEKEEPING
                ============================================= */}

            <div className="dashboard-card span-4">
              <h3 className="panel-title">
                Housekeeping
              </h3>

              <HousekeepingPanel
                data={data}
              />
            </div>

            {/* =============================================
                ONSEN PLACEHOLDER
                ============================================= */}
<div className="dashboard-card span-6">

<div className="ceo-onsen-header">

  <div>
    <h3 className="panel-title">
      Khu tắm khoáng
    </h3>

    <div className="ceo-onsen-date">
      Business Date:{" "}
      {formatBusinessDate(businessDate)}
    </div>
  </div>


  <div className="ceo-onsen-header-actions">

    <select
      className="ceo-onsen-period-select"
      value={onsenTrendPeriod}
      onChange={(event) =>
        setOnsenTrendPeriod(
          event.target.value as OnsenTrendPeriod
        )
      }
    >
      <option value="WEEK">
        1 tuần
      </option>

      <option value="MONTH">
        1 tháng
      </option>

      <option value="THREE_MONTHS">
        3 tháng
      </option>
    </select>


    <button
      type="button"
      className="hotel-operations-link"
      onClick={() =>
        navigate("/onsen")
      }
    >
      Xem chi tiết →
    </button>

  </div>

</div>

<div className="ceo-onsen-trend">

  {onsenTrendLoading ? (

    <div className="ceo-onsen-trend-state">
      Đang tải xu hướng...
    </div>

  ) : onsenTrend.length === 0 ? (

    <div className="ceo-onsen-trend-state">
      Không có dữ liệu xu hướng
    </div>

  ) : (

    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <LineChart
        data={onsenTrend}
        margin={{
          top: 12,
          right: 8,
          left: -18,
          bottom: 0,
        }}
      >

        <CartesianGrid
          stroke="rgba(148,163,184,0.10)"
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tickFormatter={(value) =>
            formatOnsenTrendDate(value)
          }
          tick={{
            fill: "#64748b",
            fontSize: 8,
          }}
          axisLine={false}
          tickLine={false}
          minTickGap={
            onsenTrendPeriod === "WEEK"
              ? 10
              : onsenTrendPeriod === "MONTH"
              ? 25
              : 45
          }
        />

        <YAxis
          allowDecimals={false}
          tick={{
            fill: "#64748b",
            fontSize: 8,
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          content={
            <OnsenTrendTooltip />
          }
        />

        <Line
          type="monotone"
          dataKey="guests"
          stroke="#22c7ff"
          strokeWidth={2.5}
          dot={
            onsenTrendPeriod === "WEEK"
              ? {
                  r: 3,
                  fill: "#071827",
                  stroke: "#22c7ff",
                  strokeWidth: 2,
                }
              : false
          }
          activeDot={{
            r: 4,
            fill: "#22c7ff",
          }}
        />

      </LineChart>
    </ResponsiveContainer>

  )}

</div>


  {onsenLoading && (
    <div className="ceo-onsen-loading">
      Đang tải dữ liệu Onsen...
    </div>
  )}


  {!onsenLoading && onsenData && (
    <>

      <div className="ceo-onsen-kpis">

        <CeoOnsenKpi
          label="Đang sử dụng"
          value={onsenData.currentGuests}
          live={onsenData.live}
        />

        <CeoOnsenKpi
          label="Check-in"
          value={onsenData.checkIns}
        />

        <CeoOnsenKpi
          label="Check-out"
          value={onsenData.checkOuts}
        />

      </div>


      <div className="ceo-onsen-package-header">

        <span>
          Lượt theo gói
        </span>

        <strong>
          {totalOnsenPackageVisits} lượt
        </strong>

      </div>


      <CeoOnsenPackageList
        items={onsenPackages}
      />

    </>
  )}


  {!onsenLoading &&
    !onsenData && (
      <div className="ceo-onsen-empty">
        Không có dữ liệu Onsen
      </div>
    )}

</div>

            {/* =============================================
                FUTURE PANEL
                ============================================= */}

            <div className="dashboard-card span-6">
              <h3 className="panel-title">
                Vận hành
              </h3>

              <div className="placeholder-panel">
                Operation Overview -
                Coming soon
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

/* =========================================================
   KPI CARD
   ========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="dashboard-card kpi-card">
      <div className="dashboard-card-title">
        {title}
      </div>

      <div className="dashboard-card-value">
        {value}
      </div>

      {subtitle && (
        <div className="dashboard-card-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HOUSEKEEPING PANEL
   ========================================================= */

function HousekeepingPanel({
  data,
}: {
  data: HotelDashboardResponse;
}) {
  const total =
    data.housekeeping.clean +
    data.housekeeping.dirty +
    data.housekeeping.inspected;

  return (
    <div className="housekeeping-panel">
      <HousekeepingItem
        label="Clean"
        value={
          data.housekeeping.clean
        }
      />

      <HousekeepingItem
        label="Dirty"
        value={
          data.housekeeping.dirty
        }
      />

      <HousekeepingItem
        label="Inspected"
        value={
          data.housekeeping.inspected
        }
      />

      <div className="housekeeping-divider" />

      <HousekeepingItem
        label="Total Rooms"
        value={total}
      />

      {data.housekeeping.live && (
        <div className="housekeeping-live">
          <span className="live-pulse-dot" />

          LIVE STATUS
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HOUSEKEEPING ITEM
   ========================================================= */

function HousekeepingItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="housekeeping-row">
      <span>
        {label}
      </span>

      <strong>
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

function OperationItem({
  label,
  value,
  detail,
  live = false,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  live?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="hotel-operation-item"
      onClick={onClick}
    >
      <div className="hotel-operation-label">
        {label}

 {live && (
  <span className="hotel-operation-live">
    <span className="live-pulse-dot" />
    LIVE
  </span>
)}

      </div>

      <strong className="hotel-operation-value">
        {value}
      </strong>

      <span className="hotel-operation-detail">
        {detail}
      </span>
    </button>
  );
}

function CeoOnsenKpi({
  label,
  value,
  live = false,
}: {
  label: string;
  value: number;
  live?: boolean;
}) {

  return (
    <div className="ceo-onsen-kpi">

      <div className="ceo-onsen-kpi-label">
        {label}

        {live && (
          <span className="ceo-onsen-live">
            <span className="live-pulse-dot" />
            LIVE
          </span>
        )}
      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function CeoOnsenPackageList({
  items,
}: {
  items: OnsenPackageSummary[];
}) {

  if (items.length === 0) {
    return (
      <div className="ceo-onsen-no-package">
        Không có lượt sử dụng
        trong ngày này.
      </div>
    );
  }

  const topItems =
    items.slice(0, 5);

  const maxGuests =
    Math.max(
      ...topItems.map(
        (item) => item.guests
      ),
      1
    );

  const total =
    items.reduce(
      (sum, item) =>
        sum + item.guests,
      0
    );

  return (
    <div className="ceo-onsen-package-list">

      {topItems.map((item) => {

        const width =
          (item.guests /
            maxGuests) *
          100;

        const percent =
          total > 0
            ? (item.guests /
                total) *
              100
            : 0;

        return (
          <div
            key={item.packageCode}
            className="ceo-onsen-package-row"
          >

            <div className="ceo-onsen-package-info">

              <div className="ceo-onsen-package-name">

                <strong>
                  {item.packageCode}
                </strong>

                <span>
                  {item.packageName ??
                    item.packageCode}
                </span>

              </div>

              <div className="ceo-onsen-package-value">

                <strong>
                  {item.guests}
                </strong>

                <span>
                  {percent.toFixed(1)}%
                </span>

              </div>

            </div>


            <div className="ceo-onsen-package-track">

              <div
                className="ceo-onsen-package-fill"
                style={{
                  width: `${width}%`,
                }}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}

function formatOnsenTrendDate(
  value: string
) {

  const parts =
    value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}/${parts[1]}`;
}

function OnsenTrendTooltip({
  active,
  payload,
}: any) {

  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const item =
    payload[0].payload as OnsenTrendItem;

  return (
    <div className="ceo-onsen-tooltip">

      <div>
        {formatBusinessDate(
          item.date
        )}
      </div>

      <strong>
        {item.guests} lượt khách
      </strong>

    </div>
  );
}