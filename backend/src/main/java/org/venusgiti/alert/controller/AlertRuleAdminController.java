package org.venusgiti.alert.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.venusgiti.alert.dto.AlertRuleEnabledRequest;
import org.venusgiti.alert.dto.AlertRuleRequest;
import org.venusgiti.alert.dto.AlertRuleResponse;
import org.venusgiti.alert.service.AlertRuleService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(
        "/api/v1/admin/alert-rules"
)
public class AlertRuleAdminController {

    private final AlertRuleService service;

    public AlertRuleAdminController(
            AlertRuleService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<AlertRuleResponse> getRules() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> create(
            @RequestBody
            AlertRuleRequest request
    ) {

        long id =
                service.create(request);

        return Map.of(
                "id",
                id
        );
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(
            @PathVariable long id,
            @RequestBody
            AlertRuleRequest request
    ) {

        service.update(
                id,
                request
        );
    }

    @PatchMapping("/{id}/enabled")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateEnabled(
            @PathVariable long id,
            @RequestBody
            AlertRuleEnabledRequest request
    ) {

        service.updateEnabled(
                id,
                request.enabled()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable long id
    ) {

        service.delete(id);
    }
}