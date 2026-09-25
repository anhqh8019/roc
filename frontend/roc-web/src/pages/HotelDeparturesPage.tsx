import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

import HotelNavigation from
  "../components/hotel/HotelNavigation";

import {
  getDepartures,
} from "../api/hotelApi";

import type {
  DepartureItemResponse,
  DepartureStatus,
  DeparturesResponse,
} from "../types/hotel";

import {
  useBusinessDate,
} from "../context/BusinessDateContext";

import "./HotelDeparturesPage.css";

type DepartureFilter =
  | "ALL"
  | DepartureStatus;

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

function formatTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

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
    new Intl.NumberFormat(
      "vi-VN"
    ).format(value) + " đ"
  );
}

function statusLabel(
  status: DepartureStatus
) {
  switch (status) {
    case "DUE_OUT":
      return "Chờ checkout";

    case "CHECKED_OUT":
      return "Đã checkout";
  }
}

export default function HotelDeparturesPage() {
  const {
    businessDate,
  } = useBusinessDate();

  const [data, setData] =
    useState<DeparturesResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<DepartureFilter>(
      "ALL"
    );

  const [search, setSearch] =
    useState("");

  /*
   * Business Date được điều khiển
   * duy nhất từ TopHeader.
   */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getDepartures(
            businessDate
          );

        setData(result);
      } catch (err) {
        console.error(
          "Load departures error:",
          err
        );

        setError(
          "Không tải được danh sách khách đi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessDate]);

  const filteredDepartures =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const keyword =
        search
          .trim()
          .toLowerCase();

      return data.departures.filter(
        (departure) => {
          const statusMatches =
            filter === "ALL" ||
            departure.status ===
              filter;

          const searchMatches =
            !keyword ||
            departure.roomCode
              .toLowerCase()
              .includes(keyword) ||
            departure.folioNum
              .toLowerCase()
              .includes(keyword) ||
            departure.roomTypeName
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

  const summary =
    data?.summary;

  return (
    <AppLayout>
      <div className="hotel-departures-page">
        {/* HEADER */}

        <div className="departures-header">
          <div>
            <h1>
              Khách sạn
            </h1>

            <p>
              Front Office Operations
            </p>
          </div>
        </div>

        <HotelNavigation />

        {/* TITLE */}

        <div className="departures-title">
          <div>
            <h2>
              Departures
            </h2>

            <p>
              Danh sách khách dự kiến đi
              theo Business Date
            </p>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="departures-summary-grid">
          <SummaryCard
            label="Tổng departures"
            value={
              summary?.total ?? 0
            }
          />

          <SummaryCard
            label="Chờ checkout"
            value={
              summary?.dueOut ?? 0
            }
          />

          <SummaryCard
            label="Đã checkout"
            value={
              summary?.checkedOut ?? 0
            }
          />
        </div>

        {/* FILTER */}

        <div className="departures-toolbar">
          <div className="departure-filter-group">
            <FilterButton
              label="Tất cả"
              value="ALL"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="Chờ checkout"
              value="DUE_OUT"
              current={filter}
              onChange={setFilter}
            />

            <FilterButton
              label="Đã checkout"
              value="CHECKED_OUT"
              current={filter}
              onChange={setFilter}
            />
          </div>

          <input
            className="departures-search"
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

        {/* ERROR */}

        {error && (
          <div className="departures-error">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="departures-table-card">
          {loading ? (
            <div className="departures-loading">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="departures-table-wrapper">
              <table className="departures-table">
                <thead>
                  <tr>
                    <th>
                      Phòng
                    </th>

                    <th>
                      Folio
                    </th>

                    <th>
                      Loại phòng
                    </th>

                    <th>
                      Khách
                    </th>

                    <th>
                      Ngày đến
                    </th>

                    <th>
                      Rate
                    </th>

                    <th>
                      Checkout
                    </th>

                    <th>
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartures.map(
                    (departure) => (
                      <DepartureRow
                        key={
                          departure.folioNum
                        }
                        departure={
                          departure
                        }
                      />
                    )
                  )}

                  {filteredDepartures.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="departures-empty"
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

function DepartureRow({
  departure,
}: {
  departure:
    DepartureItemResponse;
}) {
  return (
    <tr>
      <td>
        <strong>
          {departure.roomCode}
        </strong>
      </td>

      <td>
        {departure.folioNum}
      </td>

      <td>
        <div className="departure-room-type">
          <strong>
            {departure.roomTypeName}
          </strong>

          <span>
            {departure.roomType}
          </span>
        </div>
      </td>

      <td>
        {departure.adults} NL

        {departure.children > 0 &&
          ` + ${departure.children} TE`}
      </td>

      <td>
        {formatDate(
          departure.arrivalDate
        )}
      </td>

      <td>
        {formatMoney(
          departure.rateAmount
        )}
      </td>

      <td>
        {formatTime(
          departure.checkOutTime
        )}
      </td>

      <td>
        <span
          className={[
            "departure-status",
            departure.status
              .toLowerCase()
              .replace("_", "-"),
          ].join(" ")}
        >
          {statusLabel(
            departure.status
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
    <div className="departures-summary-card">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
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
  value: DepartureFilter;
  current: DepartureFilter;

  onChange: (
    value: DepartureFilter
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