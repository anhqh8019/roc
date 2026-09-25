import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

import HotelNavigation from
  "../components/hotel/HotelNavigation";

import {
  getInHouseStays,
} from "../api/hotelApi";

import type {
  InHouseStayResponse,
} from "../types/hotel";

import "./HotelInHousePage.css";

function formatDate(value: string | null) {
  if (!value) return "—";

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

function formatMoney(value: number) {
  return (
    new Intl.NumberFormat("vi-VN")
      .format(value) + " đ"
  );
}

export default function HotelInHousePage() {
  const [stays, setStays] =
    useState<InHouseStayResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const data =
          await getInHouseStays();

        setStays(data);
        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Không tải được danh sách khách đang lưu trú."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const summary = useMemo(() => {
    return {
      rooms: new Set(
        stays.map(
          (stay) => stay.roomCode
        )
      ).size,

      adults: stays.reduce(
        (total, stay) =>
          total + stay.adults,
        0
      ),

      children: stays.reduce(
        (total, stay) =>
          total + stay.children,
        0
      ),
    };
  }, [stays]);

  const filteredStays = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return stays;
    }

    return stays.filter((stay) => {
      return (
        stay.roomCode
          .toLowerCase()
          .includes(keyword) ||
        stay.folioNum
          .toLowerCase()
          .includes(keyword) ||
        stay.roomTypeName
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [stays, search]);

  return (
    <AppLayout>
      <div className="hotel-inhouse-page">
        <div className="inhouse-header">
          <div>
            <h1>Khách sạn</h1>
            <p>
              Front Office Operations
            </p>
          </div>
        </div>

        <HotelNavigation />

        <div className="inhouse-summary-grid">
          <SummaryCard
            label="Phòng đang ở"
            value={summary.rooms}
          />

          <SummaryCard
            label="Người lớn"
            value={summary.adults}
          />

          <SummaryCard
            label="Trẻ em"
            value={summary.children}
          />
        </div>

        <div className="inhouse-toolbar">
          <div>
            <h2>Khách đang lưu trú</h2>

            <p>
              Danh sách In-house hiện tại
              từ Smile PMS
            </p>
          </div>

          <input
            type="text"
            value={search}
            placeholder="Tìm phòng / Folio..."
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        {error && (
          <div className="inhouse-error">
            {error}
          </div>
        )}

        <div className="inhouse-table-card">
          {loading ? (
            <div className="inhouse-loading">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="inhouse-table-wrapper">
              <table className="inhouse-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Folio</th>
                    <th>Loại phòng</th>
                    <th>Ngày đến</th>
                    <th>Ngày đi</th>
                    <th>Người lớn</th>
                    <th>Trẻ em</th>
                    <th>Giá phòng</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStays.map(
                    (stay) => (
                      <tr
                        key={
                          stay.folioNum
                        }
                      >
                        <td>
                          <strong>
                            {
                              stay.roomCode
                            }
                          </strong>
                        </td>

                        <td>
                          {stay.folioNum}
                        </td>

                        <td>
                          <div className="inhouse-room-type">
                            <strong>
                              {
                                stay.roomTypeName
                              }
                            </strong>

                            <span>
                              {
                                stay.roomType
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          {formatDate(
                            stay.arrivalDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            stay.departureDate
                          )}
                        </td>

                        <td>
                          {stay.adults}
                        </td>

                        <td>
                          {stay.children}
                        </td>

                        <td>
                          {formatMoney(
                            stay.rateAmount
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {filteredStays.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="inhouse-empty"
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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="inhouse-summary-card">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}