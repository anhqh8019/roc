package org.venusgiti.alert.service;

import org.springframework.stereotype.Service;
import org.venusgiti.alert.dto.AlertRuleRequest;
import org.venusgiti.alert.dto.AlertRuleResponse;
import org.venusgiti.alert.repository.AlertRuleRepository;

import java.util.List;

@Service
public class AlertRuleService {

    private final AlertRuleRepository repository;

    public AlertRuleService(
            AlertRuleRepository repository
    ) {
        this.repository = repository;
    }

    public List<AlertRuleResponse> findAll() {
        return repository.findAll();
    }

    public List<AlertRuleResponse> findEnabled() {
        return repository.findEnabled();
    }

    public long create(
            AlertRuleRequest request
    ) {
        return repository.create(request);
    }

    public void update(
            long id,
            AlertRuleRequest request
    ) {

        int affected =
                repository.update(
                        id,
                        request
                );

        if (affected == 0) {
            throw new IllegalArgumentException(
                    "Alert rule not found: " + id
            );
        }
    }

    public void updateEnabled(
            long id,
            boolean enabled
    ) {

        int affected =
                repository.updateEnabled(
                        id,
                        enabled
                );

        if (affected == 0) {
            throw new IllegalArgumentException(
                    "Alert rule not found: " + id
            );
        }
    }

    public void delete(long id) {

        int affected =
                repository.delete(id);

        if (affected == 0) {
            throw new IllegalArgumentException(
                    "Alert rule not found: " + id
            );
        }
    }
}