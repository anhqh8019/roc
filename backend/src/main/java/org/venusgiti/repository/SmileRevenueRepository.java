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
            -- ROOM
            ISNULL(SUM(CASE
                WHEN tc.DeptCode = 120
                THEN ft.TransactionAmount
                ELSE 0
            END), 0) AS roomGrossRevenue,

            ISNULL(SUM(CASE
                WHEN tc.DeptCode = 120
                THEN ft.SubAmount
                ELSE 0
            END), 0) AS roomNetRevenue,

            -- F&B
            ISNULL(SUM(CASE
                WHEN tc.DeptCode IN (
                    210, 220, 230, 250,
                    260, 280, 290
                )
                THEN ft.SubAmount
                ELSE 0
            END), 0) AS foodBeverageRevenue,

            -- ONSEN
            ISNULL(SUM(CASE
                WHEN tc.DeptCode = 405
                THEN ft.SubAmount
                ELSE 0
            END), 0) AS onsenRevenue,

            -- OTHER
            ISNULL(SUM(CASE
                WHEN tc.DeptCode NOT IN (
                    120,
                    210, 220, 230, 250,
                    260, 280, 290,
                    405
                )
                THEN ft.SubAmount
                ELSE 0
            END), 0) AS otherRevenue,

            -- TOTAL GROSS
            ISNULL(SUM(ft.TransactionAmount), 0)
                AS totalGrossRevenue,

            -- TOTAL NET
            ISNULL(SUM(ft.SubAmount), 0)
                AS totalNetRevenue,

            -- SERVICE CHARGE
            ISNULL(SUM(ft.ServiceCharge), 0)
                AS serviceCharge,

            -- TAX
            ISNULL(SUM(ft.TaxAmount), 0)
                AS tax

        FROM FolioTransaction ft

        INNER JOIN TransactionCode tc
            ON tc.TransactionCode = ft.TransactionCode
           AND tc.TransactionSubCode = ft.TransactionSubCode

        WHERE ft.TransactionDate >= :startDate
          AND ft.TransactionDate < :endDate

          AND ISNULL(ft.VoidTransactionFlag, 0) = 0

          AND tc.TransactionGroup = 1
          AND tc.DeptCode IS NOT NULL
        """;

        return jdbc.queryForObject(
                sql,
                Map.of(
                        "startDate", date,
                        "endDate", date.plusDays(1)
                ),
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
            CAST(ft.TransactionDate AS date)
                AS businessDate,

            ISNULL(SUM(CASE
                WHEN tc.DeptCode = 120
                THEN ft.SubAmount
                ELSE 0
            END), 0) AS roomNetRevenue,

            ISNULL(SUM(ft.SubAmount), 0)
                AS totalNetRevenue

        FROM FolioTransaction ft

        INNER JOIN TransactionCode tc
            ON tc.TransactionCode = ft.TransactionCode
           AND tc.TransactionSubCode = ft.TransactionSubCode

        WHERE ft.TransactionDate >= :fromDate
          AND ft.TransactionDate < :endDate

          AND ISNULL(ft.VoidTransactionFlag, 0) = 0

          AND tc.TransactionGroup = 1
          AND tc.DeptCode IS NOT NULL

        GROUP BY
            CAST(ft.TransactionDate AS date)

        ORDER BY
            businessDate
        """;

        return jdbc.query(
                sql,
                Map.of(
                        "fromDate", from,
                        "endDate", to.plusDays(1)
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