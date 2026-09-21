package org.venusgiti.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@Configuration
public class SmileDataSourceConfig {

    @Bean(name = "smileDataSource")
    @ConfigurationProperties(prefix = "smile.datasource")
    public HikariDataSource smileDataSource() {
        return new HikariDataSource();
    }

    @Bean(name = "smileJdbcTemplate")
    public NamedParameterJdbcTemplate smileJdbcTemplate(
            @Qualifier("smileDataSource")
            HikariDataSource dataSource
    ) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}