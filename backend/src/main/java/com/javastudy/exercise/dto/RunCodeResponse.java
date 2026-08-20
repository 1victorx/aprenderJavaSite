package com.javastudy.exercise.dto;

import lombok.Data;

import java.util.List;

@Data
public class RunCodeResponse {
    private boolean passed;
    private String output;
    private String error;
    private Long executionTimeMs;
    private Integer xpEarned;
    private List<TestResult> testResults;

    @Data
    public static class TestResult {
        private int testNumber;
        private boolean passed;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private String error;

        public TestResult() {
        }

        public TestResult(int testNumber,
                          boolean passed,
                          String input,
                          String expectedOutput,
                          String actualOutput,
                          String error) {
            this.testNumber = testNumber;
            this.passed = passed;
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.error = error;
        }
    }

    public static RunCodeResponse success(String output, Long executionTimeMs, Integer xpEarned, List<TestResult> testResults) {
        RunCodeResponse response = new RunCodeResponse();
        response.setPassed(true);
        response.setOutput(output);
        response.setExecutionTimeMs(executionTimeMs);
        response.setXpEarned(xpEarned);
        response.setTestResults(testResults);
        return response;
    }

    public static RunCodeResponse failure(String output, String error, Long executionTimeMs, List<TestResult> testResults) {
        RunCodeResponse response = new RunCodeResponse();
        response.setPassed(false);
        response.setOutput(output);
        response.setError(error);
        response.setExecutionTimeMs(executionTimeMs);
        response.setXpEarned(0);
        response.setTestResults(testResults);
        return response;
    }
}