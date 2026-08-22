package com.javastudy.auth;

import com.javastudy.auth.dto.AuthResponse;
import com.javastudy.auth.dto.LoginRequest;
import com.javastudy.auth.dto.RegisterRequest;
import com.javastudy.shared.security.JwtService;
import com.javastudy.user.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        addTokenCookies(response, authResponse, request.isRememberMe());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        addTokenCookies(response, authResponse, request.isRememberMe());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        addTokenCookies(response, authResponse, jwtService.extractRememberMe(refreshToken));
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearTokenCookies(response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new AuthResponse.UserDto(user));
    }

    private void addTokenCookies(HttpServletResponse response, AuthResponse authResponse, boolean rememberMe) {
        Cookie accessCookie = new Cookie("access_token", authResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // true em produção com HTTPS
        accessCookie.setPath("/");
        accessCookie.setMaxAge(rememberMe ? 30 * 24 * 60 * 60 : -1);
        accessCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", authResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/api/auth/refresh");
        refreshCookie.setMaxAge(rememberMe ? 7 * 24 * 60 * 60 : -1);
        refreshCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/auth/refresh");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }
}
