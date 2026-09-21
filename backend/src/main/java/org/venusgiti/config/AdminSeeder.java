package org.venusgiti.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AdminSeeder
        implements CommandLineRunner {

    private final NamedParameterJdbcTemplate jdbc;
    private final PasswordEncoder encoder;

    @Value("${ROC_ADMIN_USERNAME:admin}")
    private String username;

    @Value("${ROC_ADMIN_PASSWORD:}")
    private String password;

    public AdminSeeder(
            @Qualifier("rocJdbcTemplate")
            NamedParameterJdbcTemplate jdbc,
            PasswordEncoder encoder
    ) {
        this.jdbc = jdbc;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {

        if (
                password == null ||
                        password.isBlank()
        ) {
            return;
        }

        Integer count =
                jdbc.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM RocUser
                        WHERE Username = :username
                        """,
                        Map.of(
                                "username",
                                username
                        ),
                        Integer.class
                );

        if (
                count != null &&
                        count > 0
        ) {
            return;
        }

        jdbc.update(
                """
                INSERT INTO RocUser (
                    Username,
                    PasswordHash,
                    FullName,
                    Role,
                    Active
                )
                VALUES (
                    :username,
                    :passwordHash,
                    :fullName,
                    :role,
                    1
                )
                """,
                Map.of(
                        "username",
                        username,
                        "passwordHash",
                        encoder.encode(password),
                        "fullName",
                        "ROC Administrator",
                        "role",
                        "ADMIN"
                )
        );

        System.out.println(
                "ROC admin user created."
        );
    }
}