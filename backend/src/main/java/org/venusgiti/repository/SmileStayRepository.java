package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.venusgiti.dto.ArrivalItemResponse;
import org.venusgiti.dto.DepartureItemResponse;
import org.venusgiti.dto.InHouseStayResponse;
import org.venusgiti.util.ArrivalStatus;
import org.venusgiti.util.DepartureStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository

public class SmileStayRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public SmileStayRepository(
            @Qualifier("smileJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

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

    public List<InHouseStayResponse> getInHouseStays() {

        String sql = """
            SELECT
                f.FolioNum,
                f.RoomCode,
                f.RoomTypeCode,
                rt.Description AS RoomTypeName,
                f.ArrivalDate,
                f.DepartureDate,
                f.NumAdult,
                f.NumChild,
                f.RateAmount,
                f.CheckInTime
            FROM Folio f
            INNER JOIN Room r
                ON r.RoomCode = f.RoomCode
            INNER JOIN RoomType rt
                ON rt.RoomTypeCode = r.RoomTypeCode
            WHERE f.FolioStatus = 2
              AND rt.NumRoom > 0
            ORDER BY
                f.RoomCode,
                f.FolioNum
            """;

        return jdbc.query(
                sql,
                Map.of(),
                (rs, rowNum) -> new InHouseStayResponse(
                        rs.getString("FolioNum"),
                        rs.getString("RoomCode"),
                        rs.getString("RoomTypeCode"),
                        rs.getString("RoomTypeName"),

                        rs.getDate("ArrivalDate") != null
                                ? rs.getDate("ArrivalDate").toLocalDate()
                                : null,

                        rs.getDate("DepartureDate") != null
                                ? rs.getDate("DepartureDate").toLocalDate()
                                : null,

                        rs.getInt("NumAdult"),
                        rs.getInt("NumChild"),
                        rs.getBigDecimal("RateAmount"),

                        rs.getTimestamp("CheckInTime") != null
                                ? rs.getTimestamp("CheckInTime").toLocalDateTime()
                                : null
                )
        );
    }

    public List<ArrivalItemResponse> getArrivals(
            LocalDate businessDate
    ) {

        String sql = """
        SELECT
            f.FolioNum,
            f.RoomCode,
            f.RoomTypeCode,
            rt.Description AS RoomTypeName,

            f.ArrivalDate,
            f.DepartureDate,

            f.NumAdult,
            f.NumChild,

            f.RateAmount,

            f.CheckInTime,
            f.CancelTime,

            f.NoShowFlag,
            f.WalkInFlag

        FROM Folio f

        INNER JOIN Room r
            ON r.RoomCode = f.RoomCode

        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode

        WHERE rt.NumRoom > 0

          AND f.ArrivalDate >= :fromDate
          AND f.ArrivalDate < :toDate

        ORDER BY
            f.RoomCode,
            f.FolioNum
        """;

        Map<String, Object> params = Map.of(
                "fromDate",
                businessDate.atStartOfDay(),

                "toDate",
                businessDate.plusDays(1).atStartOfDay()
        );

        return jdbc.query(
                sql,
                params,
                (rs, rowNum) -> {

                    LocalDateTime checkInTime =
                            rs.getTimestamp("CheckInTime") != null
                                    ? rs.getTimestamp("CheckInTime")
                                    .toLocalDateTime()
                                    : null;

                    LocalDateTime cancelTime =
                            rs.getTimestamp("CancelTime") != null
                                    ? rs.getTimestamp("CancelTime")
                                    .toLocalDateTime()
                                    : null;

                    boolean noShow =
                            rs.getInt("NoShowFlag") == 1;

                    boolean walkIn =
                            rs.getInt("WalkInFlag") == 1;

                    ArrivalStatus status;

                    if (cancelTime != null) {
                        status = ArrivalStatus.CANCELLED;

                    } else if (noShow) {
                        status = ArrivalStatus.NO_SHOW;

                    } else if (checkInTime != null) {
                        status = ArrivalStatus.CHECKED_IN;

                    } else {
                        status = ArrivalStatus.EXPECTED;
                    }

                    return new ArrivalItemResponse(
                            rs.getString("FolioNum"),
                            rs.getString("RoomCode"),
                            rs.getString("RoomTypeCode"),
                            rs.getString("RoomTypeName"),

                            rs.getDate("ArrivalDate") != null
                                    ? rs.getDate("ArrivalDate")
                                    .toLocalDate()
                                    : null,

                            rs.getDate("DepartureDate") != null
                                    ? rs.getDate("DepartureDate")
                                    .toLocalDate()
                                    : null,

                            rs.getInt("NumAdult"),
                            rs.getInt("NumChild"),

                            rs.getBigDecimal("RateAmount"),

                            status,

                            checkInTime,
                            cancelTime,

                            noShow,
                            walkIn
                    );
                }
        );
    }

    public List<DepartureItemResponse> getDepartures(
            LocalDate businessDate
    ) {

        String sql = """
        SELECT
            f.FolioNum,
            f.RoomCode,
            f.RoomTypeCode,
            rt.Description AS RoomTypeName,

            f.ArrivalDate,
            f.DepartureDate,

            f.NumAdult,
            f.NumChild,

            f.RateAmount,

            f.CheckInTime,
            f.CheckOutTime

        FROM Folio f

        INNER JOIN Room r
            ON r.RoomCode = f.RoomCode

        INNER JOIN RoomType rt
            ON rt.RoomTypeCode = r.RoomTypeCode

        WHERE rt.NumRoom > 0

          AND f.DepartureDate >= :fromDate
          AND f.DepartureDate < :toDate

          AND f.CancelTime IS NULL
          AND ISNULL(f.NoShowFlag, 0) = 0

        ORDER BY
            f.RoomCode,
            f.FolioNum
        """;

        Map<String, Object> params = Map.of(
                "fromDate",
                businessDate.atStartOfDay(),

                "toDate",
                businessDate
                        .plusDays(1)
                        .atStartOfDay()
        );

        return jdbc.query(
                sql,
                params,
                (rs, rowNum) -> {

                    LocalDateTime checkInTime =
                            rs.getTimestamp("CheckInTime") != null
                                    ? rs.getTimestamp("CheckInTime")
                                    .toLocalDateTime()
                                    : null;

                    LocalDateTime checkOutTime =
                            rs.getTimestamp("CheckOutTime") != null
                                    ? rs.getTimestamp("CheckOutTime")
                                    .toLocalDateTime()
                                    : null;

                    DepartureStatus status =
                            checkOutTime != null
                                    ? DepartureStatus.CHECKED_OUT
                                    : DepartureStatus.DUE_OUT;

                    return new DepartureItemResponse(
                            rs.getString("FolioNum"),
                            rs.getString("RoomCode"),
                            rs.getString("RoomTypeCode"),
                            rs.getString("RoomTypeName"),

                            rs.getDate("ArrivalDate") != null
                                    ? rs.getDate("ArrivalDate")
                                    .toLocalDate()
                                    : null,

                            rs.getDate("DepartureDate") != null
                                    ? rs.getDate("DepartureDate")
                                    .toLocalDate()
                                    : null,

                            rs.getInt("NumAdult"),
                            rs.getInt("NumChild"),

                            rs.getBigDecimal("RateAmount"),

                            status,

                            checkInTime,
                            checkOutTime
                    );
                }
        );
    }

}