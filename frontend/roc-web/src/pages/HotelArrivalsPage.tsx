import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from
  "../layout/AppLayout";

import HotelNavigation from
  "../components/hotel/HotelNavigation";

import {
  getArrivals,
} from "../api/hotelApi";

import type {
  ArrivalItemResponse,
  ArrivalStatus,
  ArrivalsResponse,
} from "../types/hotel";

import {
  useBusinessDate,
} from "../context/BusinessDateContext";

import "./HotelArrivalsPage.css";

type ArrivalFilter =
  | "ALL"
  | ArrivalStatus;

 

function formatDate(
  value: string | null
) {
  if (!value) return "—";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

function formatTime(
  value: string | null
) {
  if (!value) return "—";

  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatMoney(
  value: number
) {
  return (
    new Intl.NumberFormat("vi-VN")
      .format(value) + " đ"
  );
}

function statusLabel(
  status: ArrivalStatus
) {
  switch (status) {
    case "EXPECTED":
      return "Chờ đến";

    case "CHECKED_IN":
      return "Đã check-in";

    case "CANCELLED":
      return "Đã hủy";

    case "NO_SHOW":
      return "No-show";
  }
}

export default function HotelArrivalsPage() {
const {
  businessDate,
} = useBusinessDate();

  const [data, setData] =
    useState<ArrivalsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<ArrivalFilter>("ALL");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getArrivals(
            businessDate
          );

        setData(result);
      } catch (err) {
        console.error(err);

        setError(
          "Không tải được danh sách khách đến."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessDate]);

  const filteredArrivals =
    useMemo(() => {
      if (!data) return [];

      const keyword =
        search
          .trim()
          .toLowerCase();

      return data.arrivals.filter(
        (arrival) => {
          const statusMatches =
            filter === "ALL" ||
            arrival.status === filter;

          const searchMatches =
            !keyword ||
            arrival.roomCode
              .toLowerCase()
              .includes(keyword) ||
            arrival.folioNum
              .toLowerCase()
              .includes(keyword) ||
            arrival.roomTypeName
              .toLowerCase()
              .includes(keyword);

          return (
            statusMatches &&
            searchMatches
          );
        }
      );
    }, [
      data,
      filter,
      search,
    ]);

  const summary = data?.summary;

  return (
    <AppLayout>
      <div className="hotel-arrivals-page">
        <div className="arrivals-header">
          <div>
            <h1>Khách sạn</h1>

            <p>
              Front Office Operations
            </p>
          </div>
        </div>

        <HotelNavigation />

        {/* DATE */}

        <div className="arrivals-date-bar">
          <div>
            <h2>Arrivals</h2>

            <p>
              Danh sách khách dự kiến
              đến theo Business Date
            </p>
          </div>
 

        </div>

        {/* SUMMARY */}

        <div className="arrivals-summary-grid">
          <SummaryCard
            label="Tổng arrivals"
            value={summary?.total ?? 0}
          />

          <SummaryCard
            label="Chờ đến"
            value={
              summary?.expected ?? 0
            }
          />

          <SummaryCard
            label="Đã check-in"
            value={
              summary?.checkedIn ?? 0
            }
          />

          <SummaryCard
            label="Đã hủy"
            value={
              summary?.cancelled ?? 0
            }
          />

          <SummaryCard
            label="No-show"
            value={
              summary?.noShow ?? 0
            }
          />
        </div>

        {/* FILTER */}

        <div className="arrivals-toolbar">
          <div className="arrival-filter-group">
            <FilterButton
              label="Tất cả"
              value="ALL"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="Chờ đến"
              value="EXPECTED"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="Đã check-in"
              value="CHECKED_IN"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="Đã hủy"
              value="CANCELLED"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="No-show"
              value="NO_SHOW"
              current={filter}
              onChange={setFilter}
            />
          </div>

          <input
            className="arrivals-search"
            type="text"
            placeholder="Tìm phòng / Folio..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        {error && (
          <div className="arrivals-error">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="arrivals-table-card">
          {loading ? (
            <div className="arrivals-loading">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="arrivals-table-wrapper">
              <table className="arrivals-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Folio</th>
                    <th>Loại phòng</th>
                    <th>Khách</th>
                    <th>Ngày đi</th>
                    <th>Rate</th>
                    <th>Check-in</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredArrivals.map(
                    (arrival) => (
                      <ArrivalRow
                        key={
                          arrival.folioNum
                        }
                        arrival={
                          arrival
                        }
                      />
                    )
                  )}

                  {filteredArrivals.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="arrivals-empty"
                      >
                        Không có dữ liệu
                        phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ArrivalRow({
  arrival,
}: {
  arrival: ArrivalItemResponse;
}) {
  return (
    <tr>
      <td>
        <strong>
          {arrival.roomCode}
        </strong>
      </td>

      <td>
        {arrival.folioNum}
      </td>

      <td>
        <div className="arrival-room-type">
          <strong>
            {arrival.roomTypeName}
          </strong>

          <span>
            {arrival.roomType}
          </span>
        </div>
      </td>

      <td>
        {arrival.adults} NL
        {arrival.children > 0 &&
          ` + ${arrival.children} TE`}
      </td>

      <td>
        {formatDate(
          arrival.departureDate
        )}
      </td>

      <td>
        {formatMoney(
          arrival.rateAmount
        )}
      </td>

      <td>
        {formatTime(
          arrival.checkInTime
        )}
      </td>

      <td>
        <span
          className={[
            "arrival-status",
            arrival.status
              .toLowerCase()
              .replace("_", "-"),
          ].join(" ")}
        >
          {statusLabel(
            arrival.status
          )}
        </span>
      </td>
    </tr>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="arrivals-summary-card">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function FilterButton({
  label,
  value,
  current,
  onChange,
}: {
  label: string;
  value: ArrivalFilter;
  current: ArrivalFilter;
  onChange: (
    value: ArrivalFilter
  ) => void;
}) {
  return (
    <button
      type="button"
      className={
        current === value
          ? "active"
          : ""
      }
      onClick={() =>
        onChange(value)
      }
    >
      {label}
    </button>
  );
}