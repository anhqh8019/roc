package org.venusgiti.integration.onsen;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class OnsenRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public OnsenRepository(@Qualifier("smileJdbcTemplate")NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }


    public OnsenStats getDashboardStats(LocalDate businessDate) {
        String sql = """
                SELECT
                    COUNT(DISTINCT CASE
                        WHEN CheckInTime >= :startDate
                         AND CheckInTime < :endDate
                         AND CheckOutTime IS NULL
                        THEN CardNo
                    END) AS CurrentGuests,

                    COUNT(DISTINCT CASE
                        WHEN CheckInTime >= :startDate
                         AND CheckInTime < :endDate
                        THEN CardNo
                    END) AS CheckIns,

                    COUNT(DISTINCT CASE
                        WHEN CheckOutTime >= :startDate
                         AND CheckOutTime < :endDate
                        THEN CardNo
                    END) AS CheckOuts
                FROM SMILE_ONSEN.dbo.AdditionalExt
                WHERE ISNULL(IsCancel, 0) = 0
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("startDate", businessDate)
                        .addValue("endDate", businessDate.plusDays(1));

        return jdbc.queryForObject(
                sql,
                params,
                (rs, rowNum) -> new OnsenStats(
                        rs.getInt("CurrentGuests"),
                        rs.getInt("CheckIns"),
                        rs.getInt("CheckOuts")
                )
        );
    }

    public record OnsenStats(
            int currentGuests,
            int checkIns,
            int checkOuts
    ) {
    }

    public List<OnsenPackageSummaryResponse> findPackageSummary(
            LocalDate businessDate
    ) {

        LocalDateTime startDate =
                businessDate.atStartOfDay();

        LocalDateTime endDate =
                businessDate.plusDays(1).atStartOfDay();

        String sql = """
        SELECT
            ae.PkgCode AS PackageCode,
            pc.Description AS PackageName,
            pc.TrnSubCode,

            COUNT(DISTINCT CASE
                WHEN ae.CheckInTime >= :startDate
                 AND ae.CheckInTime < :endDate
                THEN ae.CardNo
            END) AS Guests,

            COUNT(DISTINCT CASE
                WHEN ae.CheckInTime >= :startDate
                 AND ae.CheckInTime < :endDate
                THEN ae.CardNo
            END) AS CheckIns,

            COUNT(DISTINCT CASE
                WHEN ae.CheckOutTime >= :startDate
                 AND ae.CheckOutTime < :endDate
                THEN ae.CardNo
            END) AS CheckOuts

        FROM SMILE_ONSEN.dbo.AdditionalExt ae

        LEFT JOIN SMILE_ONSEN.dbo.PackageCode pc
            ON pc.PackageCode = ae.PkgCode

        WHERE
            (
                (
                    ae.CheckInTime >= :startDate
                    AND ae.CheckInTime < :endDate
                )
                OR
                (
                    ae.CheckOutTime >= :startDate
                    AND ae.CheckOutTime < :endDate
                )
            )

            AND ISNULL(ae.IsCancel, 0) = 0

            AND ae.PkgCode IS NOT NULL

        GROUP BY
            ae.PkgCode,
            pc.Description,
            pc.TrnSubCode

        ORDER BY
            Guests DESC,
            ae.PkgCode
        """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("startDate", startDate)
                        .addValue("endDate", endDate);

        return jdbc.query(
                sql,
                params,
                (rs, rowNum) ->
                        new OnsenPackageSummaryResponse(
                                rs.getString("PackageCode"),
                                rs.getString("PackageName"),
                                rs.getString("TrnSubCode"),
                                rs.getInt("Guests"),
                                rs.getInt("CheckIns"),
                                rs.getInt("CheckOuts")
                        )
        );
    }

    public List<OnsenCurrentGuestResponse> findCurrentGuests(
            LocalDate businessDate
    ) {

        LocalDateTime startDate =
                businessDate.atStartOfDay();

        LocalDateTime endDate =
                businessDate.plusDays(1).atStartOfDay();

        String sql = """
        SELECT
            CardNo,
            FolioNum,
            PkgCode,
            CheckInTime
        FROM SMILE_ONSEN.dbo.AdditionalExt
        WHERE CheckInTime >= :startDate
          AND CheckInTime < :endDate
          AND CheckOutTime IS NULL
          AND ISNULL(IsCancel, 0) = 0
          AND CardNo IS NOT NULL
          AND LTRIM(RTRIM(CardNo)) <> ''
        ORDER BY CheckInTime DESC
        """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue(
                                "startDate",
                                startDate
                        )
                        .addValue(
                                "endDate",
                                endDate
                        );

        LocalDateTime now =
                LocalDateTime.now();

        return jdbc.query(
                sql,
                params,
                (rs, rowNum) -> {

                    LocalDateTime checkInTime =
                            rs.getTimestamp(
                                    "CheckInTime"
                            ).toLocalDateTime();

                    long durationMinutes =
                            Math.max(
                                    0,
                                    Duration.between(
                                            checkInTime,
                                            now
                                    ).toMinutes()
                            );

                    return new OnsenCurrentGuestResponse(
                            rs.getString("CardNo"),
                            rs.getObject(
                                    "FolioNum",
                                    Integer.class
                            ),
                            rs.getString("PkgCode"),
                            checkInTime,
                            durationMinutes
                    );
                }
        );
    }

    public List<OnsenTrendResponse> findGuestTrend(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        LocalDateTime startDate =
                fromDate.atStartOfDay();

        LocalDateTime endDate =
                toDate.plusDays(1).atStartOfDay();

        String sql = """
        SELECT
            CAST(ae.CheckInTime AS date) AS BusinessDate,
            COUNT(DISTINCT ae.CardNo) AS Guests

        FROM SMILE_ONSEN.dbo.AdditionalExt ae

        WHERE ae.CheckInTime >= :startDate
          AND ae.CheckInTime < :endDate

          AND ISNULL(ae.IsCancel, 0) = 0

          AND ae.CardNo IS NOT NULL
          AND LTRIM(RTRIM(ae.CardNo)) <> ''

        GROUP BY
            CAST(ae.CheckInTime AS date)

        ORDER BY
            BusinessDate
        """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue(
                                "startDate",
                                startDate
                        )
                        .addValue(
                                "endDate",
                                endDate
                        );

        return jdbc.query(
                sql,
                params,
                (rs, rowNum) ->
                        new OnsenTrendResponse(
                                rs.getDate(
                                        "BusinessDate"
                                ).toLocalDate(),

                                rs.getInt(
                                        "Guests"
                                )
                        )
        );
    }
}
