import { useEffect, useMemo, useState } from "react";
import { getRooms } from "../api/hotelApi";
import type { RoomStatusResponse } from "../types/hotel";
import "./RoomMap.css";

export default function RoomMap() {
  const [rooms, setRooms] = useState<RoomStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoading(true);

      const result = await getRooms();

      setRooms(result);

      const floorList = [
        ...new Set(
          result
            .map((room) => room.floor)
            .filter((floor): floor is string => Boolean(floor))
        ),
      ].sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
        })
      );

      if (floorList.length > 0) {
        setSelectedFloor(floorList[0]);
      }
    } catch (error) {
      console.error("Load rooms error:", error);
    } finally {
      setLoading(false);
    }
  }

  const floors = useMemo(() => {
    return [
      ...new Set(
        rooms
          .map((room) => room.floor)
          .filter((floor): floor is string => Boolean(floor))
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
      })
    );
  }, [rooms]);

  const floorRooms = useMemo(() => {
    return rooms
      .filter((room) => room.floor === selectedFloor)
      .sort((a, b) =>
        a.roomCode.localeCompare(b.roomCode, undefined, {
          numeric: true,
        })
      );
  }, [rooms, selectedFloor]);

  const summary = useMemo(() => {
    const occupied = floorRooms.filter(
      (room) => room.occupancyStatus === "OCCUPIED"
    ).length;

    const dirty = floorRooms.filter(
      (room) => room.housekeepingStatus === "DIRTY"
    ).length;

    const inspected = floorRooms.filter(
      (room) => room.housekeepingStatus === "INSPECTED"
    ).length;

    const clean = floorRooms.filter(
      (room) => room.housekeepingStatus === "CLEAN"
    ).length;

    return {
      total: floorRooms.length,
      occupied,
      vacant: floorRooms.length - occupied,
      clean,
      dirty,
      inspected,
    };
  }, [floorRooms]);

  if (loading) {
    return (
      <div className="compact-room-map-loading">
        Đang tải sơ đồ phòng...
      </div>
    );
  }

  return (
    <section className="compact-room-map">
      <div className="compact-room-header">
        <h3>
          Sơ đồ phòng - Tầng {selectedFloor}
        </h3>

        <select
          value={selectedFloor}
          onChange={(e) =>
            setSelectedFloor(e.target.value)
          }
          className="floor-select"
        >
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              Tầng {floor}
            </option>
          ))}
        </select>
      </div>

      <div className="compact-room-legend">
        <Legend
          className="legend-occupied"
          label="Có khách"
        />

        <Legend
          className="legend-clean"
          label="Trống sạch"
        />

        <Legend
          className="legend-dirty"
          label="Đang dọn"
        />

        <Legend
          className="legend-inspected"
          label="Inspected"
        />
      </div>

      <div className="compact-room-grid">
        {floorRooms.map((room) => (
          <RoomTile
            key={room.roomCode}
            room={room}
          />
        ))}
      </div>

      <div className="compact-room-footer">
        <span>
          Tổng: <strong>{summary.total}</strong> phòng
        </span>

        <span>
          Có khách: <strong>{summary.occupied}</strong>
        </span>

        <span>
          Trống sạch: <strong>{summary.clean}</strong>
        </span>

        <span>
          Đang dọn: <strong>{summary.dirty}</strong>
        </span>

        <span>
          Inspected: <strong>{summary.inspected}</strong>
        </span>
      </div>
    </section>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="compact-legend-item">
      <span
        className={`compact-legend-color ${className}`}
      />
      <span>{label}</span>
    </div>
  );
}

function RoomTile({
  room,
}: {
  room: RoomStatusResponse;
}) {
  return (
    <div
      className={`compact-room-tile ${getRoomClass(room)}`}
      title={[
        `Room: ${room.roomCode}`,
        `Type: ${room.roomType}`,
        `Occupancy: ${room.occupancyStatus}`,
        `Housekeeping: ${room.housekeepingStatus}`,
      ].join("\n")}
    >
      <div className="compact-room-code">
        {room.roomCode}
      </div>

      <div className="compact-room-icon">
        {getRoomIcon(room)}
      </div>

      <div className="compact-room-type">
        {room.roomType}
      </div>
    </div>
  );
}

function getRoomClass(room: RoomStatusResponse) {
  if (room.housekeepingStatus === "INSPECTED") {
    return "room-inspected";
  }

  if (room.housekeepingStatus === "DIRTY") {
    return "room-dirty";
  }

  if (room.occupancyStatus === "OCCUPIED") {
    return "room-occupied";
  }

  return "room-clean";
}

function getRoomIcon(room: RoomStatusResponse) {
  if (room.housekeepingStatus === "INSPECTED") {
    return "✓";
  }

  if (room.housekeepingStatus === "DIRTY") {
    return "⌛";
  }

  if (room.occupancyStatus === "OCCUPIED") {
    return "●";
  }

  return "✓";
}