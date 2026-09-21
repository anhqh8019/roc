package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public class SmileRevenueRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public SmileRevenueRepository(
            @Qualifier("smileJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public BigDecimal getRoomRevenue(LocalDate date) {

        String sql = """
            SELECT ISNULL(SUM(frc.Amount), 0)
            FROM FolioRoomCharge frc
            INNER JOIN Room r
                ON r.RoomCode = frc.RoomCode
            INNER JOIN RoomType rt
                ON rt.RoomTypeCode = r.RoomTypeCode
            WHERE CAST(frc.hDate AS date) = :businessDate
              AND rt.NumRoom > 0
            """;

        BigDecimal value = jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                BigDecimal.class
        );

        return value == null ? BigDecimal.ZERO : value;
    }

    public RevenueSummary getRevenue(LocalDate date) {

        String sql = """
    SELECT
        ISNULL(SUM(CASE
            WHEN TransactionCode = 400
            THEN TransactionAmount ELSE 0
        END), 0) AS roomGrossRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode = 400
            THEN SubAmount ELSE 0
        END), 0) AS roomNetRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (510, 560, 590)
            THEN TransactionAmount ELSE 0
        END), 0) AS foodBeverageRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (655, 666)
            THEN TransactionAmount ELSE 0
        END), 0) AS onsenRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (630, 675, 676)
            THEN TransactionAmount ELSE 0
        END), 0) AS otherRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (
                400,
                510, 560, 590,
                655, 666,
                630, 675, 676
            )
            THEN TransactionAmount ELSE 0
        END), 0) AS totalGrossRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (
                400,
                510, 560, 590,
                655, 666,
                630, 675, 676
            )
            THEN SubAmount ELSE 0
        END), 0) AS totalNetRevenue,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (
                400,
                510, 560, 590,
                655, 666,
                630, 675, 676
            )
            THEN ServiceCharge ELSE 0
        END), 0) AS serviceCharge,

        ISNULL(SUM(CASE
            WHEN TransactionCode IN (
                400,
                510, 560, 590,
                655, 666,
                630, 675, 676
            )
            THEN TaxAmount ELSE 0
        END), 0) AS tax

    FROM FolioTransaction
    WHERE CAST(TransactionDate AS date) = :businessDate
      AND ISNULL(VoidTransactionFlag, 0) = 0
    """;

        return jdbc.queryForObject(
                sql,
                Map.of("businessDate", date),
                (rs, rowNum) -> new RevenueSummary(
                        rs.getBigDecimal("roomGrossRevenue"),
                        rs.getBigDecimal("roomNetRevenue"),

                        rs.getBigDecimal("foodBeverageRevenue"),
                        rs.getBigDecimal("onsenRevenue"),
                        rs.getBigDecimal("otherRevenue"),

                        rs.getBigDecimal("totalGrossRevenue"),
                        rs.getBigDecimal("totalNetRevenue"),

                        rs.getBigDecimal("serviceCharge"),
                        rs.getBigDecimal("tax")
                )
        );
    }

    public record RevenueSummary(
            BigDecimal roomGrossRevenue,
            BigDecimal roomNetRevenue,

            BigDecimal foodBeverageRevenue,
            BigDecimal onsenRevenue,
            BigDecimal otherRevenue,

            BigDecimal totalGrossRevenue,
            BigDecimal totalNetRevenue,

            BigDecimal serviceCharge,
            BigDecimal tax
    ) {}

    public List<DailyRevenue> getDailyRevenue(
            LocalDate from,
            LocalDate to
    ) {
        String sql = """
        SELECT
            CAST(TransactionDate AS date) AS businessDate,

            ISNULL(SUM(CASE
                WHEN TransactionCode = 400
                THEN SubAmount ELSE 0
            END), 0) AS roomNetRevenue,

            ISNULL(SUM(CASE
                WHEN TransactionCode IN (
                    400,
                    510, 560, 590,
                    655, 666,
                    630, 675, 676
                )
                THEN SubAmount ELSE 0
            END), 0) AS totalNetRevenue

        FROM FolioTransaction

        WHERE CAST(TransactionDate AS date)
              BETWEEN :fromDate AND :toDate

          AND ISNULL(VoidTransactionFlag, 0) = 0

        GROUP BY CAST(TransactionDate AS date)

        ORDER BY businessDate
        """;

        return jdbc.query(
                sql,
                Map.of(
                        "fromDate", from,
                        "toDate", to
                ),
                (rs, rowNum) -> new DailyRevenue(
                        rs.getDate("businessDate")
                                .toLocalDate(),
                        rs.getBigDecimal("roomNetRevenue"),
                        rs.getBigDecimal("totalNetRevenue")
                )
        );
    }

    public record DailyRevenue(
            LocalDate businessDate,
            BigDecimal roomNetRevenue,
            BigDecimal totalNetRevenue
    ) {}

}