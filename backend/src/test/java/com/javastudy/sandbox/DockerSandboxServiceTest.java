package com.javastudy.sandbox;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DockerSandboxServiceTest {
    @Test
    void doesNotRunCodeLocallyWhenFallbackIsDisabled() {
        DockerSandboxService sandbox = new DockerSandboxService(
            "eclipse-temurin:21-jdk-alpine",
            3,
            256,
            false,
            false
        );

        Sandbox.ExecutionResult result = sandbox.execute(new Sandbox.CodeRequest(
            "public class Solution {}",
            List.of(),
            3000,
            256
        ));

        assertFalse(result.success());
        assertTrue(result.stderr().contains("desabilitada"));
    }
}
