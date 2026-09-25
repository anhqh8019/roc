package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.venusgiti.dto.RoomDetailResponse;
import org.venusgiti.dto.RoomStatusResponse;
import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class SmileRoomRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public SmileRoomRepository(
            @Qualifier("smileJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public int countPhysicalRooms() {

        String currentDb = jdbc.queryForObject(
                "SELECT DB_NAME()",
                Map.of(),
                String.class
        );

        System.out.println(
                ">>> SMILE CURRENT DATABASE = " + currentDb
        );

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
            rt.Description AS RoomTypeName,

            CASE
                WHEN r.RoomTypeCode IN ('VO', 'VA', 'VL')
                    THEN 'VILLA'
                ELSE CAST(r.Floor AS varchar(20))
            END AS Zone,

            r.HSKPOccupied,
            r.HSKPClean,
            r.Inspected

        FROM Room r

        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode

        WHERE rt.NumRoom > 0

        ORDER BY
            CASE
                WHEN r.RoomTypeCode IN ('VO', 'VA', 'VL') THEN 1
                ELSE 0
            END,
            r.Floor,
            r.RoomCode
        """;

        return jdbc.query(
                sql,
                Map.of(),
                (rs, rowNum) -> {

                    int hskpOccupied =
                            rs.getInt("HSKPOccupied");

                    int hskpClean =
                            rs.getInt("HSKPClean");

                    int inspected =
                            rs.getInt("Inspected");

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
                            rs.getString("RoomTypeName"),
                            rs.getString("Zone"),
                            occupancyStatus,
                            housekeepingStatus,
                            inspected == 1
                    );
                }
        );
    }

    public RoomDetailResponse getRoomDetail(String roomCode) {

        String sql = """
        SELECT
            r.RoomCode,
            r.RoomTypeCode,
            rt.Description AS RoomTypeName,

            CASE
                WHEN r.RoomTypeCode IN ('VO', 'VA', 'VL')
                    THEN 'VILLA'
                ELSE CAST(r.Floor AS varchar(20))
            END AS Zone,

            r.HSKPOccupied,
            r.HSKPClean,
            r.Inspected

        FROM Room r

        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode

        WHERE rt.NumRoom > 0
          AND r.RoomCode = :roomCode
        """;

        var rooms = jdbc.query(
                sql,
                Map.of("roomCode", roomCode),
                (rs, rowNum) -> {

                    int occupied = rs.getInt("HSKPOccupied");
                    int clean = rs.getInt("HSKPClean");
                    int inspected = rs.getInt("Inspected");

                    OccupancyStatus occupancyStatus =
                            occupied == 1
                                    ? OccupancyStatus.OCCUPIED
                                    : OccupancyStatus.VACANT;

                    HousekeepingStatus housekeepingStatus;

                    if (inspected == 1) {
                        housekeepingStatus =
                                HousekeepingStatus.INSPECTED;
                    } else if (clean == 1) {
                        housekeepingStatus =
                                HousekeepingStatus.CLEAN;
                    } else {
                        housekeepingStatus =
                                HousekeepingStatus.DIRTY;
                    }

                    return new RoomDetailResponse(
                            rs.getString("RoomCode"),
                            rs.getString("RoomTypeCode"),
                            rs.getString("RoomTypeName"),
                            rs.getString("Zone"),
                            occupancyStatus,
                            housekeepingStatus,
                            inspected == 1,
                            null
                    );
                }
        );

        if (rooms.isEmpty()) {
            return null;
        }

        RoomDetailResponse room = rooms.getFirst();

        RoomDetailResponse.StayInfo stay =
                findCurrentStay(roomCode);

        return new RoomDetailResponse(
                room.roomCode(),
                room.roomType(),
                room.roomTypeName(),
                room.zone(),
                room.occupancyStatus(),
                room.housekeepingStatus(),
                room.inspected(),
                stay
        );
    }

    private RoomDetailResponse.StayInfo findCurrentStay(
            String roomCode
    ) {

        String sql = """
        SELECT TOP 1
            f.FolioNum,
            f.ArrivalDate,
            f.DepartureDate,
            f.NumAdult,
            f.NumChild,
            f.RateAmount
        FROM Folio f
        WHERE f.RoomCode = :roomCode
          AND f.FolioStatus = 2
          AND f.CheckOutTime IS NULL
        ORDER BY f.CheckInTime DESC
        """;

        var results = jdbc.query(
                sql,
                Map.of("roomCode", roomCode),
                (rs, rowNum) ->
                        new RoomDetailResponse.StayInfo(
                                rs.getString("FolioNum"),

                                rs.getTimestamp("ArrivalDate") == null
                                        ? null
                                        : rs.getTimestamp("ArrivalDate")
                                        .toLocalDateTime()
                                        .toLocalDate(),

                                rs.getTimestamp("DepartureDate") == null
                                        ? null
                                        : rs.getTimestamp("DepartureDate")
                                        .toLocalDateTime()
                                        .toLocalDate(),

                                rs.getInt("NumAdult"),
                                rs.getInt("NumChild"),
                                rs.getBigDecimal("RateAmount")
                        )
        );

        return results.isEmpty()
                ? null
                : results.getFirst();
    }

    public int countDirtyRooms() {

        String sql = """
        SELECT COUNT(*)
        FROM Room r
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE rt.NumRoom > 0
          AND ISNULL(r.HSKPClean, 0) = 0
        """;

        Integer result =
                jdbc.queryForObject(
                        sql,
                        Map.of(),
                        Integer.class
                );

        return result != null
                ? result
                : 0;
    }

    public int countPendingArrivals(
            LocalDate businessDate
    ) {

        LocalDateTime from =
                businessDate.atStartOfDay();

        LocalDateTime to =
                businessDate
                        .plusDays(1)
                        .atStartOfDay();

        String sql = """
        SELECT COUNT(*)
        FROM Folio f
        INNER JOIN Room r
            ON r.RoomCode = f.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE rt.NumRoom > 0

          AND f.ArrivalDate >= :fromDate
          AND f.ArrivalDate < :toDate

          AND f.CheckInTime IS NULL
          AND f.CancelTime IS NULL
        """;

        Map<String, Object> params =
                Map.of(
                        "fromDate", from,
                        "toDate", to
                );

        Integer result =
                jdbc.queryForObject(
                        sql,
                        params,
                        Integer.class
                );

        return result != null
                ? result
                : 0;
    }

}