package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class SmileStayRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public int countInHouse() {
        String sql = """
            SELECT COUNT(*)
            FROM Folio
            WHERE FolioStatus = 2
            """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of(),
                Integer.class
        );

        return value == null ? 0 : value;
    }

    public int countArrivals(LocalDate date) {

        String sql = """
        SELECT COUNT(DISTINCT f.RoomCode)
        FROM Folio f
        INNER JOIN Room r
            ON r.RoomCode = f.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE CAST(f.CheckInTime AS date) = :businessDate
          AND f.CheckInTime IS NOT NULL
          AND rt.NumRoom > 0
        """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                Integer.class
        );

        return value == null ? 0 : value;
    }

    public int countDepartures(LocalDate date) {

        String sql = """
        SELECT COUNT(DISTINCT f.RoomCode)
        FROM Folio f
        INNER JOIN Room r
            ON r.RoomCode = f.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE CAST(f.CheckOutTime AS date) = :businessDate
          AND f.CheckOutTime IS NOT NULL
          AND rt.NumRoom > 0
        """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                Integer.class
        );

        return value == null ? 0 : value;
    }

    public GuestCount getGuestCount(LocalDate date) {
        String sql = """
        SELECT
            ISNULL(SUM(NumGuest), 0) AS adults,
            ISNULL(SUM(NumChild), 0) AS children
        FROM FolioRoomNight frn
        INNER JOIN Room r
            ON r.RoomCode = frn.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE CAST(frn.hDate AS date) = :businessDate
          AND rt.NumRoom > 0
          AND frn.FolioNum IS NOT NULL
        """;

        return jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                (rs, rowNum) -> new GuestCount(
                        rs.getInt("adults"),
                        rs.getInt("children")
                )
        );
    }

    public record GuestCount(
            int adults,
            int children
    ) {}

    public int countOccupiedRooms(LocalDate date) {

        String sql = """
        SELECT COUNT(DISTINCT frn.RoomCode)
        FROM FolioRoomNight frn
        INNER JOIN Room r
            ON r.RoomCode = frn.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE CAST(frn.hDate AS date) = :businessDate
          AND rt.NumRoom > 0
          AND ISNULL(frn.Vacant, 0) = 0
          AND ISNULL(frn.OOO, 0) = 0
          AND ISNULL(frn.OOI, 0) = 0
        """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                Integer.class
        );

        return value == null ? 0 : value;
    }

    public List<DailyOccupancy> getDailyOccupancy(
            LocalDate from,
            LocalDate to
    ) {
        String sql = """
        SELECT
            CAST(frn.hDate AS date) AS businessDate,
            COUNT(DISTINCT frn.RoomCode) AS occupiedRooms
        FROM FolioRoomNight frn
        INNER JOIN Room r
            ON r.RoomCode = frn.RoomCode
        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode
        WHERE CAST(frn.hDate AS date)
              BETWEEN :fromDate AND :toDate
          AND rt.NumRoom > 0
          AND frn.FolioNum IS NOT NULL
        GROUP BY CAST(frn.hDate AS date)
        ORDER BY businessDate
        """;

        return jdbc.query(
                sql,
                Map.of(
                        "fromDate", from,
                        "toDate", to
                ),
                (rs, rowNum) -> new DailyOccupancy(
                        rs.getDate("businessDate")
                                .toLocalDate(),
                        rs.getInt("occupiedRooms")
                )
        );
    }

    public record DailyOccupancy(
            LocalDate businessDate,
            int occupiedRooms
    ) {}

}