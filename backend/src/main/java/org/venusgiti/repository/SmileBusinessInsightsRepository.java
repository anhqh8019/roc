package org.venusgiti.repository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public class SmileBusinessInsightsRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public SmileBusinessInsightsRepository(
            @Qualifier("smileJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public List<AgeGroupRow> getAgeGroups(LocalDate businessDate) {

        String sql = """
            WITH HotelGuests AS
            (
                SELECT DISTINCT
                    a.IdAddition,
                    a.BirthDate
                FROM AdditionalName a
                INNER JOIN Folio f
                    ON f.FolioNum = a.FolioNum
                WHERE
                    a.ArrivalTime < DATEADD(day, 1, :businessDate)
                    AND a.DepartureTime > :businessDate
            ),
            GuestAge AS
            (
                SELECT
                    IdAddition,
                    CASE
                        WHEN BirthDate IS NULL THEN NULL
                        ELSE
                            DATEDIFF(YEAR, BirthDate, :businessDate)
                            - CASE
                                WHEN DATEADD(
                                    YEAR,
                                    DATEDIFF(YEAR, BirthDate, :businessDate),
                                    BirthDate
                                ) > :businessDate
                                THEN 1
                                ELSE 0
                              END
                    END AS Age
                FROM HotelGuests
            ),
            AgeGroups AS
            (
                SELECT
                    IdAddition,
                    CASE
                        WHEN Age IS NULL THEN 'UNKNOWN'
                        WHEN Age < 18 THEN '<18'
                        WHEN Age <= 30 THEN '18-30'
                        WHEN Age <= 45 THEN '31-45'
                        WHEN Age <= 60 THEN '46-60'
                        ELSE '60+'
                    END AS AgeGroup
                FROM GuestAge
            )
            SELECT
                AgeGroup,
                COUNT(*) AS Guests
            FROM AgeGroups
            GROUP BY AgeGroup
            ORDER BY
                CASE AgeGroup
                    WHEN '<18' THEN 1
                    WHEN '18-30' THEN 2
                    WHEN '31-45' THEN 3
                    WHEN '46-60' THEN 4
                    WHEN '60+' THEN 5
                    ELSE 6
                END
            """;

        return jdbc.query(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new AgeGroupRow(
                        rs.getString("AgeGroup"),
                        rs.getInt("Guests")
                )
        );
    }

    public record AgeGroupRow(
            String ageGroup,
            int guests
    ) {
    }

    public List<GenderRow> getGenderGroups(LocalDate businessDate) {

        String sql = """
        WITH HotelGuests AS
        (
            SELECT DISTINCT
                a.IdAddition,
                a.Gender
            FROM AdditionalName a
            INNER JOIN Folio f
                ON f.FolioNum = a.FolioNum
            WHERE
                a.ArrivalTime < DATEADD(day, 1, :businessDate)
                AND a.DepartureTime > :businessDate
        ),
        GenderGroups AS
        (
            SELECT
                CASE
                    WHEN Gender = 1 THEN 'MALE'
                    WHEN Gender = 0 THEN 'FEMALE'
                    ELSE 'UNKNOWN'
                END AS GenderGroup,
                COUNT(*) AS Guests
            FROM HotelGuests
            GROUP BY
                CASE
                    WHEN Gender = 1 THEN 'MALE'
                    WHEN Gender = 0 THEN 'FEMALE'
                    ELSE 'UNKNOWN'
                END
        )
        SELECT
            GenderGroup,
            Guests
        FROM GenderGroups
        ORDER BY
            CASE GenderGroup
                WHEN 'MALE' THEN 1
                WHEN 'FEMALE' THEN 2
                ELSE 3
            END
        """;

        return jdbc.query(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new GenderRow(
                        rs.getString("GenderGroup"),
                        rs.getInt("Guests")
                )
        );
    }

    public List<NationalityRow> getNationalityGroups(LocalDate businessDate) {

        String sql = """
        WITH HotelGuests AS
        (
            SELECT DISTINCT
                a.IdAddition,
                NULLIF(
                    LTRIM(RTRIM(a.NationalityCode)),
                    ''
                ) AS NationalityCode
            FROM AdditionalName a
            INNER JOIN Folio f
                ON f.FolioNum = a.FolioNum
            WHERE
                a.ArrivalTime < DATEADD(day, 1, :businessDate)
                AND a.DepartureTime > :businessDate
        )
        SELECT
            COALESCE(NationalityCode, 'UNKNOWN') AS Nationality,
            COUNT(*) AS Guests
        FROM HotelGuests
        GROUP BY
            COALESCE(NationalityCode, 'UNKNOWN')
        ORDER BY
            Guests DESC,
            Nationality
        """;

        return jdbc.query(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new NationalityRow(
                        rs.getString("Nationality"),
                        rs.getInt("Guests")
                )
        );
    }

    public record GenderRow(
            String gender,
            int guests
    ) {
    }

    public record NationalityRow(
            String nationality,
            int guests
    ) {
    }

    public CustomerMixRow getHotelToOnsenMix(LocalDate businessDate) {

        String sql = """
        WITH HotelGuests AS
        (
            SELECT DISTINCT
                a.FolioNum,
                a.IdAddition
            FROM SMILE_FO.dbo.AdditionalName a
            INNER JOIN SMILE_FO.dbo.Folio f
                ON f.FolioNum = a.FolioNum
            WHERE
                a.ArrivalTime < DATEADD(day, 1, :businessDate)
                AND a.DepartureTime > :businessDate
        ),
        OnsenGuests AS
        (
            SELECT DISTINCT
                TRY_CONVERT(numeric, ae.FolioNum_FO) AS FolioNum,
                TRY_CONVERT(numeric, ae.IdAddition_FO) AS IdAddition
            FROM SMILE_ONSEN.dbo.AdditionalExt ae
            WHERE
                ISNULL(ae.IsCancel, 0) = 0
                AND NULLIF(LTRIM(RTRIM(ae.FolioNum_FO)), '') IS NOT NULL
                AND NULLIF(LTRIM(RTRIM(ae.IdAddition_FO)), '') IS NOT NULL
                AND ae.CheckInTime >= :businessDate
                AND ae.CheckInTime < DATEADD(day, 1, :businessDate)
        )
        SELECT
            COUNT(*) AS HotelGuests,
            SUM(
                CASE
                    WHEN og.IdAddition IS NOT NULL THEN 1
                    ELSE 0
                END
            ) AS UsedGuests
        FROM HotelGuests hg
        LEFT JOIN OnsenGuests og
            ON og.FolioNum = hg.FolioNum
            AND og.IdAddition = hg.IdAddition
        """;

        return jdbc.queryForObject(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new CustomerMixRow(
                        rs.getInt("HotelGuests"),
                        rs.getInt("UsedGuests")
                )
        );
    }

    public record CustomerMixRow(
            int hotelGuests,
            int usedGuests
    ) {
    }

    public BreakfastMixRow getHotelToBreakfastMix(LocalDate businessDate) {

        String sql = """
        WITH BreakfastEligibleGuests AS
        (
            SELECT DISTINCT
                a.FolioNum,
                a.IdAddition
            FROM SMILE_FO.dbo.AdditionalName a
            INNER JOIN SMILE_FO.dbo.Folio f
                ON f.FolioNum = a.FolioNum
            WHERE
                a.ArrivalTime < :businessDate
                AND a.DepartureTime >= :businessDate
        ),
        BreakfastGuests AS
        (
            SELECT DISTINCT
                p.FolioNum,
                p.IDAddition
            FROM SMILE_POS.dbo.POSMealCheck p
            WHERE
                p.SPDate >= :businessDate
                AND p.SPDate < DATEADD(day, 1, :businessDate)
                AND p.SPCode = 'BF'
                AND p.IDAddition IS NOT NULL
        ),
        SourceStats AS
        (
            SELECT
                COUNT(*) AS SourceGuests
            FROM BreakfastGuests
        )
        SELECT
            ss.SourceGuests,
            COUNT(eg.IdAddition) AS EligibleGuests,
            SUM(
                CASE
                    WHEN bg.IDAddition IS NOT NULL THEN 1
                    ELSE 0
                END
            ) AS UsedGuests
        FROM SourceStats ss
        LEFT JOIN BreakfastEligibleGuests eg
            ON 1 = 1
        LEFT JOIN BreakfastGuests bg
            ON bg.FolioNum = eg.FolioNum
            AND bg.IDAddition = eg.IdAddition
        GROUP BY
            ss.SourceGuests
        """;

        return jdbc.queryForObject(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new BreakfastMixRow(
                        rs.getInt("SourceGuests"),
                        rs.getInt("EligibleGuests"),
                        rs.getInt("UsedGuests")
                )
        );
    }

    public record BreakfastMixRow(
            int sourceGuests,
            int eligibleGuests,
            int usedGuests
    ) {
    }

    public List<RevenueMixRow> getRevenueMix(LocalDate businessDate) {

        String sql = """
        WITH RevenueBase AS
        (
            SELECT
                CASE
                    WHEN tc.DeptCode = 120
                        THEN 'HOTEL'

                    WHEN tc.DeptCode IN (
                        210, 220, 230,
                        250, 260, 280, 290
                    )
                        THEN 'F&B'

                    WHEN tc.DeptCode = 405
                        THEN 'ONSEN'

                    WHEN tc.DeptCode = 450
                        THEN 'SPA'

                    ELSE 'OTHER'
                END AS BusinessUnit,

                ISNULL(ft.TransactionAmount, 0) AS Revenue

            FROM SMILE_FO.dbo.FolioTransaction ft

            INNER JOIN SMILE_FO.dbo.TransactionCode tc
                ON tc.TransactionCode = ft.TransactionCode
                AND tc.TransactionSubCode = ft.TransactionSubCode

            WHERE
                ft.TransactionDate >= :businessDate
                AND ft.TransactionDate < DATEADD(day, 1, :businessDate)

                AND tc.TransactionGroup = 1
                AND tc.DeptCode IS NOT NULL

                AND ISNULL(ft.VoidTransactionFlag, 0) = 0
        )
        SELECT
            BusinessUnit,
            SUM(Revenue) AS Revenue
        FROM RevenueBase
        GROUP BY BusinessUnit
        """;

        return jdbc.query(
                sql,
                Map.of("businessDate", businessDate),
                (rs, rowNum) -> new RevenueMixRow(
                        rs.getString("BusinessUnit"),
                        rs.getBigDecimal("Revenue")
                )
        );
    }

    public record RevenueMixRow(
            String businessUnit,
            BigDecimal revenue
    ) {
    }

    public List<RevenueTrendRow> getRevenueTrend(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        String sql = """
        SELECT
            CAST(ft.TransactionDate AS date) AS BusinessDate,
            SUM(ISNULL(ft.TransactionAmount, 0)) AS Revenue

        FROM SMILE_FO.dbo.FolioTransaction ft

        INNER JOIN SMILE_FO.dbo.TransactionCode tc
            ON tc.TransactionCode = ft.TransactionCode
            AND tc.TransactionSubCode = ft.TransactionSubCode

        WHERE
            ft.TransactionDate >= :fromDate
            AND ft.TransactionDate < DATEADD(day, 1, :toDate)

            AND tc.TransactionGroup = 1
            AND tc.DeptCode IS NOT NULL

            AND ISNULL(ft.VoidTransactionFlag, 0) = 0

        GROUP BY
            CAST(ft.TransactionDate AS date)

        ORDER BY
            BusinessDate
        """;

        return jdbc.query(
                sql,
                Map.of(
                        "fromDate", fromDate,
                        "toDate", toDate
                ),
                (rs, rowNum) -> new RevenueTrendRow(
                        rs.getDate("BusinessDate")
                                .toLocalDate(),
                        rs.getBigDecimal("Revenue")
                )
        );
    }

    public record RevenueTrendRow(
            LocalDate date,
            BigDecimal revenue
    ) {
    }
}