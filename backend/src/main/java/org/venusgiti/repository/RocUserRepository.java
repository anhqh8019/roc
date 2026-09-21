package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.venusgiti.auth.RocUser;
import org.venusgiti.auth.UserRole;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class RocUserRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public RocUserRepository(
            @Qualifier("rocJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public Optional<RocUser> findByUsername(
            String username
    ) {
        String sql = """
            SELECT
                Id,
                Username,
                PasswordHash,
                FullName,
                Role,
                Active
            FROM RocUser
            WHERE Username = :username
            """;

        List<RocUser> users = jdbc.query(
                sql,
                Map.of("username", username),
                (rs, rowNum) -> new RocUser(
                        rs.getLong("Id"),
                        rs.getString("Username"),
                        rs.getString("PasswordHash"),
                        rs.getString("FullName"),
                        UserRole.valueOf(
                                rs.getString("Role")
                        ),
                        rs.getBoolean("Active")
                )
        );

        return users.stream().findFirst();
    }

    public void updateLastLogin(Long userId) {

        String sql = """
            UPDATE RocUser
            SET LastLoginAt = SYSDATETIME()
            WHERE Id = :id
            """;

        jdbc.update(
                sql,
                Map.of("id", userId)
        );
    }
}