package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.venusgiti.dto.RoomStatusResponse;
import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class SmileRoomRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public int countPhysicalRooms() {
        String sql = """
            SELECT COUNT(*)
            FROM Room r
            WHERE EXISTS (
                SELECT 1
                FROM RoomType rt
                WHERE rt.RoomTypeCode = r.RoomTypeCode
                  AND rt.NumRoom > 0
            )
            """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of(),
                Integer.class
        );

        return value == null ? 0 : value;
    }
    public List<RoomStatusResponse> getCurrentRooms() {

        String sql = """
        SELECT
            r.RoomCode,
            r.RoomTypeCode,
            r.Floor,
            r.HSKPOccupied,
            r.HSKPClean,
            r.Inspected
        FROM Room r
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE rt.NumRoom > 0
        ORDER BY r.Floor, r.RoomCode
        """;

        return jdbc.query(
                sql,
                Map.of(),
                (rs, rowNum) -> {

                    int hskpOccupied = rs.getInt("HSKPOccupied");
                    int hskpClean = rs.getInt("HSKPClean");
                    int inspected = rs.getInt("Inspected");

                    OccupancyStatus occupancyStatus =
                            hskpOccupied == 1
                                    ? OccupancyStatus.OCCUPIED
                                    : OccupancyStatus.VACANT;

                    HousekeepingStatus housekeepingStatus;

                    if (inspected == 1) {
                        housekeepingStatus =
                                HousekeepingStatus.INSPECTED;
                    } else if (hskpClean == 1) {
                        housekeepingStatus =
                                HousekeepingStatus.CLEAN;
                    } else {
                        housekeepingStatus =
                                HousekeepingStatus.DIRTY;
                    }

                    return new RoomStatusResponse(
                            rs.getString("RoomCode"),
                            rs.getString("RoomTypeCode"),
                            rs.getString("Floor"),
                            occupancyStatus,
                            housekeepingStatus,
                            inspected == 1
                    );
                }
        );
    }
}