package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
@Repository
public class SmileHousekeepingRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public SmileHousekeepingRepository(
            @Qualifier("smileJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public HousekeepingSummary getCurrentSummary() {

        String sql = """
            SELECT
                SUM(CASE
                    WHEN ISNULL(r.HSKPClean, 0) = 1
                         AND ISNULL(r.Inspected, 0) = 0
                    THEN 1 ELSE 0
                END) AS clean,

                SUM(CASE
                    WHEN ISNULL(r.HSKPClean, 0) = 0
                    THEN 1 ELSE 0
                END) AS dirty,

                SUM(CASE
                    WHEN ISNULL(r.Inspected, 0) = 1
                    THEN 1 ELSE 0
                END) AS inspected

            FROM Room r

            INNER JOIN RoomType rt
                ON rt.RoomTypeCode = r.RoomTypeCode

            WHERE rt.NumRoom > 0
            """;

        return jdbc.queryForObject(
                sql,
                Map.of(),
                (rs, rowNum) -> new HousekeepingSummary(
                        rs.getInt("clean"),
                        rs.getInt("dirty"),
                        rs.getInt("inspected")
                )
        );
    }

    public record HousekeepingSummary(
            int clean,
            int dirty,
            int inspected
    ) {}
}