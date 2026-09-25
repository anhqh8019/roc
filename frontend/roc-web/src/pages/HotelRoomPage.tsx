import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../layout/AppLayout";

import {
  getRoomDetail,
  getRooms,
} from "../api/hotelApi";

import type {
  RoomDetailResponse,
  RoomStatusResponse,
} from "../types/hotel";

import "./HotelRoomPage.css";

import HotelNavigation from
  "../components/hotel/HotelNavigation";

type StatusFilter =
  | "ALL"
  | "OCCUPIED"
  | "VACANT"
  | "DIRTY"
  | "INSPECTED";

function zoneLabel(zone: string) {
  return zone === "VILLA"
    ? "Khu Villa"
    : `Tầng ${zone}`;
}

function formatMoney(value: number) {
  return (
    new Intl.NumberFormat("vi-VN").format(value) +
    " đ"
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

export default function HotelRoomPage() {
  const [rooms, setRooms] =
    useState<RoomStatusResponse[]>([]);

  // Mặc định mở Khu Villa
  const [selectedZone, setSelectedZone] =
    useState("VILLA");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [selectedRoom, setSelectedRoom] =
    useState<RoomDetailResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        setLoading(true);

        const data = await getRooms();

        setRooms(data);
        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Không tải được danh sách phòng."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  // Villa đứng đầu, sau đó tầng 2, 3, 4, 5...
  const zones = useMemo(() => {
    const values = Array.from(
      new Set(
        rooms
          .map((room) => room.zone)
          .filter(Boolean)
      )
    );

    return values.sort((a, b) => {
      if (a === "VILLA") return -1;
      if (b === "VILLA") return 1;

      const floorA = Number(a);
      const floorB = Number(b);

      if (
        !Number.isNaN(floorA) &&
        !Number.isNaN(floorB)
      ) {
        return floorA - floorB;
      }

      return a.localeCompare(b);
    });
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const zoneMatches =
        selectedZone === "ALL" ||
        room.zone === selectedZone;

      let statusMatches = true;

      if (statusFilter === "OCCUPIED") {
        statusMatches =
          room.occupancyStatus ===
          "OCCUPIED";
      }

      if (statusFilter === "VACANT") {
        statusMatches =
          room.occupancyStatus ===
          "VACANT";
      }

      if (statusFilter === "DIRTY") {
        statusMatches =
          room.housekeepingStatus ===
          "DIRTY";
      }

      if (
        statusFilter === "INSPECTED"
      ) {
        statusMatches =
          room.housekeepingStatus ===
          "INSPECTED";
      }

      return (
        zoneMatches &&
        statusMatches
      );
    });
  }, [
    rooms,
    selectedZone,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    return {
      total: rooms.length,

      occupied: rooms.filter(
        (room) =>
          room.occupancyStatus ===
          "OCCUPIED"
      ).length,

      vacant: rooms.filter(
        (room) =>
          room.occupancyStatus ===
          "VACANT"
      ).length,

      dirty: rooms.filter(
        (room) =>
          room.housekeepingStatus ===
          "DIRTY"
      ).length,

      inspected: rooms.filter(
        (room) =>
          room.housekeepingStatus ===
          "INSPECTED"
      ).length,
    };
  }, [rooms]);

  async function handleRoomClick(
    roomCode: string
  ) {
    try {
      setDetailLoading(true);
      setError(null);

      const detail =
        await getRoomDetail(roomCode);

      setSelectedRoom(detail);
    } catch (err) {
      console.error(err);

      setError(
        "Không tải được chi tiết phòng."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="hotel-room-page">
        {/* PAGE HEADER */}

        <div className="room-page-header">
          <div>
            <h1>Khách sạn</h1>
            <p>Room Operations</p>
          </div>
        </div>

        <HotelNavigation />

        {/* SUMMARY */}

        <div className="room-summary-grid">
          <SummaryCard
            label="Tổng phòng"
            value={summary.total}
          />

          <SummaryCard
            label="Đang ở"
            value={summary.occupied}
          />

          <SummaryCard
            label="Phòng trống"
            value={summary.vacant}
          />

          <SummaryCard
            label="Dirty"
            value={summary.dirty}
          />

          <SummaryCard
            label="Inspected"
            value={summary.inspected}
          />
        </div>

        {/* FILTER TOOLBAR */}

        <div className="room-toolbar">
          {/* ZONE FILTER */}

          <div className="room-filter-group">
            {zones.map((zone) => (
              <button
                key={zone}
                type="button"
                className={
                  selectedZone === zone
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSelectedZone(zone);
                  setSelectedRoom(null);
                }}
              >
                {zoneLabel(zone)}
              </button>
            ))}

            {/* Tất cả luôn nằm cuối */}

            <button
              type="button"
              className={
                selectedZone === "ALL"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setSelectedZone("ALL");
                setSelectedRoom(null);
              }}
            >
              Tất cả
            </button>
          </div>

          {/* STATUS FILTER */}

          <div className="room-filter-group">
            <FilterButton
              label="Tất cả"
              value="ALL"
              current={statusFilter}
              onChange={setStatusFilter}
            />

            <FilterButton
              label="Đang ở"
              value="OCCUPIED"
              current={statusFilter}
              onChange={setStatusFilter}
            />

            <FilterButton
              label="Trống"
              value="VACANT"
              current={statusFilter}
              onChange={setStatusFilter}
            />

            <FilterButton
              label="Dirty"
              value="DIRTY"
              current={statusFilter}
              onChange={setStatusFilter}
            />

            <FilterButton
              label="Inspected"
              value="INSPECTED"
              current={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="room-error">
            {error}
          </div>
        )}

        {/* ROOM OPERATION */}

        <div className="room-operation-layout">
          {/* ROOM BOARD */}

          <section className="room-board">
            {loading ? (
              <div className="room-loading">
                Đang tải danh sách phòng...
              </div>
            ) : (
              <div className="room-operation-grid">
                {filteredRooms.map(
                  (room) => (
                    <button
                      key={room.roomCode}
                      type="button"
                      className={[
                        "operation-room-card",
                        room.occupancyStatus.toLowerCase(),
                        room.housekeepingStatus.toLowerCase(),
                        selectedRoom
                          ?.roomCode ===
                        room.roomCode
                          ? "selected"
                          : "",
                      ].join(" ")}
                      onClick={() =>
                        handleRoomClick(
                          room.roomCode
                        )
                      }
                    >
                      <strong>
                        {room.roomCode}
                      </strong>

                      <span className="room-type-code">
                        {room.roomType}
                      </span>

                      <span className="room-type-name">
                        {room.roomTypeName}
                      </span>

                      <div className="room-card-status">
                        <span>
                          {
                            room.occupancyStatus
                          }
                        </span>

                        <span>
                          {
                            room.housekeepingStatus
                          }
                        </span>
                      </div>
                    </button>
                  )
                )}

                {!loading &&
                  filteredRooms.length ===
                    0 && (
                    <div className="room-loading">
                      Không có phòng phù hợp
                      với bộ lọc.
                    </div>
                  )}
              </div>
            )}
          </section>

          {/* ROOM DETAIL */}

          <aside className="room-detail-panel">
            {detailLoading ? (
              <div className="room-detail-empty">
                Đang tải chi tiết...
              </div>
            ) : selectedRoom ? (
              <>
                <div className="room-detail-header">
                  <div>
                    <h2>
                      {
                        selectedRoom.roomCode
                      }
                    </h2>

                    <p>
                      {
                        selectedRoom
                          .roomTypeName
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    className="room-detail-close"
                    onClick={() =>
                      setSelectedRoom(null)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="detail-status-row">
                  <span>
                    {
                      selectedRoom
                        .occupancyStatus
                    }
                  </span>

                  <span>
                    {
                      selectedRoom
                        .housekeepingStatus
                    }
                  </span>
                </div>

                {/* ROOM INFORMATION */}

                <div className="detail-section">
                  <h3>
                    Thông tin phòng
                  </h3>

                  <DetailRow
                    label="Loại phòng"
                    value={
                      selectedRoom.roomType
                    }
                  />

                  <DetailRow
                    label="Khu vực"
                    value={zoneLabel(
                      selectedRoom.zone
                    )}
                  />
                </div>

                {/* CURRENT STAY */}

                <div className="detail-section">
                  <h3>
                    Lưu trú hiện tại
                  </h3>

                  {selectedRoom.currentStay ? (
                    <>
                      <DetailRow
                        label="Folio"
                        value={
                          selectedRoom
                            .currentStay
                            .folioNum
                        }
                      />

                      <DetailRow
                        label="Ngày đến"
                        value={formatDate(
                          selectedRoom
                            .currentStay
                            .arrivalDate
                        )}
                      />

                      <DetailRow
                        label="Ngày đi"
                        value={formatDate(
                          selectedRoom
                            .currentStay
                            .departureDate
                        )}
                      />

                      <DetailRow
                        label="Người lớn"
                        value={String(
                          selectedRoom
                            .currentStay
                            .adults
                        )}
                      />

                      <DetailRow
                        label="Trẻ em"
                        value={String(
                          selectedRoom
                            .currentStay
                            .children
                        )}
                      />

                      <DetailRow
                        label="Giá phòng"
                        value={formatMoney(
                          selectedRoom
                            .currentStay
                            .rateAmount
                        )}
                      />
                    </>
                  ) : (
                    <div className="no-current-stay">
                      Không có khách đang
                      lưu trú
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="room-detail-empty">
                Chọn một phòng để xem chi
                tiết
              </div>
            )}
          </aside>
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
    <div className="room-summary-card">
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
  value: StatusFilter;
  current: StatusFilter;
  onChange: (
    value: StatusFilter
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}