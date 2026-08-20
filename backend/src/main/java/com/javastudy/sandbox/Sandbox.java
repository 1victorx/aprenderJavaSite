package com.javastudy.sandbox;

import com.javastudy.exercise.TestCase;

import java.util.List;

public interface Sandbox {
    ExecutionResult execute(CodeRequest request);

    record CodeRequest(
        String code,
        List<TestCase> testCases,
        int timeLimitMs,
        int memoryLimitMb
    ) {}

    record ExecutionResult(
        boolean success,
        String stdout,
        String stderr,
        int exitCode,
        boolean timedOut,
        List<TestResult> testResults
    ) {
        public static ExecutionResult timeout(String stdout, String stderr) {
            return new ExecutionResult(false, stdout, stderr, -1, true, List.of());
        }

        public static ExecutionResult error(String stderr) {
            return new ExecutionResult(false, "", stderr, -1, false, List.of());
        }
    }

    record TestResult(
        int testNumber,
        boolean passed,
        String input,
        String expectedOutput,
        String actualOutput,
        String error
    ) {}
}