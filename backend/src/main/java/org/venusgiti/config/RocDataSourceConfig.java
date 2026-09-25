package org.venusgiti.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class RocDataSourceConfig {

    @Bean(name = "rocDataSourceProperties")
    @ConfigurationProperties("roc.datasource")
    public DataSourceProperties rocDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "rocDataSource")
    @ConfigurationProperties("roc.datasource")
    public HikariDataSource rocDataSource(
            @Qualifier("rocDataSourceProperties")
            DataSourceProperties properties
    ) {
        return properties
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "rocJdbcTemplate")
    public NamedParameterJdbcTemplate rocJdbcTemplate(
            @Qualifier("rocDataSource")
            HikariDataSource dataSource
    ) {
        return new NamedParameterJdbcTemplate(
                dataSource
        );
    }

    @Bean(name = "rocNamedParameterJdbcTemplate")
    public NamedParameterJdbcTemplate rocNamedParameterJdbcTemplate(
            @Qualifier("rocDataSource")
            DataSource dataSource
    ) {
        return new NamedParameterJdbcTemplate(
                dataSource
        );
    }

}