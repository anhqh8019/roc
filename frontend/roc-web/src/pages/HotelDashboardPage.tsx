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

import type {
  HotelDashboardResponse,
  RoomStatusResponse,
} from "../types/hotel";

import {
  useBusinessDate,
} from "../context/BusinessDateContext";

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

            <KpiCard
              title="Phòng trống"
              value={
                data.inventory.availableRooms
              }
              subtitle={`Tổng ${data.inventory.totalRooms} phòng`}
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

              <AlertCenter />
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
              <h3 className="panel-title">
                Khu tắm khoáng
              </h3>

              <div className="placeholder-panel">
                Onsen Live Map -
                Coming soon
              </div>
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