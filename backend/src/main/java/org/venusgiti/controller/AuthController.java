package org.venusgiti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.venusgiti.dto.auth.CaptchaResponse;
import org.venusgiti.dto.auth.LoginRequest;
import org.venusgiti.dto.auth.LoginResponse;
import org.venusgiti.service.AuthService;
import org.venusgiti.service.CaptchaService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CaptchaService captchaService;

    @GetMapping("/captcha")
    public CaptchaResponse captcha() {
        return captchaService.createChallenge();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        if (!captchaService.verify(
                request.captchaId(),
                request.captchaAnswer()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Captcha is invalid or expired"
            );
        }

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}
