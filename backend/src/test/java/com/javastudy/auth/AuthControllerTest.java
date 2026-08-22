package com.javastudy.auth;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class AuthControllerTest {
    @Test
    void meWithoutAuthenticatedPrincipalReturnsUnauthorizedInsteadOfInternalError() {
        AuthController controller = new AuthController(null, null);

        ResponseEntity<?> response = controller.me(null);

        assertThat(response.getStatusCode().value()).isEqualTo(401);
    }
}
