package org.venusgiti.integration.onsen;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

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
}
