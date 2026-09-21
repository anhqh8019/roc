import { useEffect, useState } from "react";

import AppLayout from "../layout/AppLayout";

import HotelTrendSection from "../components/HotelTrendSection";
import RevenueMixChart from "../components/RevenueMixChart";
import RoomMap from "../components/RoomMap";
import AlertCenter from "../components/AlertCenter";

import { getHotelDashboard } from "../api/hotelApi";

import type {
  HotelDashboardResponse,
} from "../types/hotel";

function getDefaultBusinessDate() {
  const date = new Date();

  // Lùi 1 ngày
  date.setDate(date.getDate() - 1);

  // Không dùng toISOString() để tránh lệch ngày do UTC
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}


export default function HotelDashboardPage() {
  const [date, setDate] =
  useState<string>(
    getDefaultBusinessDate
  );

  const [data, setData] =
    useState<HotelDashboardResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    loadDashboard();
  }, [date]);


  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getHotelDashboard(date);

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


  return (
    <AppLayout
      selectedDate={date}
      onDateChange={setDate}
    >

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
              value={data.guestFlow.inHouse}
              subtitle={`${data.guestFlow.adults} người lớn`}
            />

            <KpiCard
              title="Doanh thu nhà hàng"
              value={`${formatMoney(
                data.revenue.foodBeverageRevenue
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
              value={data.inventory.availableRooms}
              subtitle={`Tổng ${data.inventory.totalRooms} phòng`}
            />

          </div>


          {/* =================================================
              MAIN DASHBOARD GRID
              ================================================= */}

          <div className="dashboard-section-grid">

            {/* =============================================
                HOTEL PERFORMANCE - LEFT
                ============================================= */}

            <div className="dashboard-card span-8">
              <HotelTrendSection
                selectedDate={date}
              />
            </div>


            {/* =============================================
                RIGHT COLUMN:
                REVENUE MIX + ALERT CENTER
                ============================================= */}

            <div className="dashboard-card span-4 revenue-alert-card">

              {/* REVENUE MIX */}

              <div className="revenue-section">

                <h3 className="panel-title">
                  Cơ cấu doanh thu
                </h3>

                <RevenueMixChart
                  data={data}
                />

              </div>


              {/* DIVIDER */}

              <div className="revenue-alert-divider" />


              {/* ALERT CENTER */}

              <AlertCenter />

            </div>


            {/* =============================================
                ROOM MAP
                ============================================= */}

            <div className="dashboard-card span-8">

              <RoomMap />

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
                Onsen Live Map - Coming soon
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
                Operation Overview - Coming soon
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
        value={data.housekeeping.clean}
      />

      <HousekeepingItem
        label="Dirty"
        value={data.housekeeping.dirty}
      />

      <HousekeepingItem
        label="Inspected"
        value={data.housekeeping.inspected}
      />

      <div className="housekeeping-divider" />

      <HousekeepingItem
        label="Total Rooms"
        value={total}
      />

      {data.housekeeping.live && (
        <div className="housekeeping-live">

          <span className="housekeeping-live-dot" />

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