package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.venusgiti.auth.JwtService;
import org.venusgiti.auth.RocUser;
import org.venusgiti.dto.auth.LoginRequest;
import org.venusgiti.dto.auth.LoginResponse;
import org.venusgiti.repository.RocUserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RocUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(
            LoginRequest request
    ) {

        RocUser user =
                userRepository
                        .findByUsername(
                                request.username()
                        )
                        .orElseThrow(
                                () ->
                                        new BadCredentialsException(
                                                "Invalid username or password"
                                        )
                        );

        if (!user.active()) {
            throw new BadCredentialsException(
                    "User account is inactive"
            );
        }

        boolean passwordValid =
                passwordEncoder.matches(
                        request.password(),
                        user.passwordHash()
                );

        if (!passwordValid) {
            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        String token =
                jwtService.generateToken(user);

        userRepository.updateLastLogin(
                user.id()
        );

        return new LoginResponse(
                token,
                "Bearer",
                new LoginResponse.UserInfo(
                        user.id(),
                        user.username(),
                        user.fullName(),
                        user.role().name()
                )
        );
    }
}