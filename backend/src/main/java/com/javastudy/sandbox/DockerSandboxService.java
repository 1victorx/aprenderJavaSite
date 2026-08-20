package com.javastudy.sandbox;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.StreamType;
import com.github.dockerjava.api.model.Volume;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.javastudy.exercise.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class DockerSandboxService implements Sandbox {
    private final String dockerImage;
    private final int timeoutSeconds;
    private final int memoryLimitMb;
    private final boolean useDocker;
    private final DockerClient dockerClient;

    public DockerSandboxService(
            @Value("${sandbox.docker-image:eclipse-temurin:21-jdk-alpine}") String dockerImage,
            @Value("${sandbox.timeout-seconds:3}") int timeoutSeconds,
            @Value("${sandbox.memory-limit-mb:256}") int memoryLimitMb,
            @Value("${sandbox.use-docker:false}") boolean useDocker
    ) {
        this.dockerImage = dockerImage;
        this.timeoutSeconds = timeoutSeconds;
        this.memoryLimitMb = memoryLimitMb;
        this.useDocker = useDocker;

        DockerClient client = null;
        if (useDocker) {
            try {
                DockerClientConfig config = DefaultDockerClientConfig
                        .createDefaultConfigBuilder()
                        .build();

                DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                        .dockerHost(config.getDockerHost())
                        .sslConfig(config.getSSLConfig())
                        .build();

                client = DockerClientImpl.getInstance(config, httpClient);
                // Test connection
                client.pingCmd().exec();
            } catch (Exception e) {
                // Docker not available, fall back to local
                client = null;
            }
        }
        this.dockerClient = client;
    }

    @Override
    public ExecutionResult execute(CodeRequest request) {
        if (dockerClient != null && useDocker) {
            return executeInDocker(request);
        } else {
            return executeLocally(request);
        }
    }

    private ExecutionResult executeInDocker(CodeRequest request) {
        Path tempDir = null;
        String containerId = null;

        try {
            tempDir = Files.createTempDirectory("javastudy-sandbox-");
            writeJavaFile(tempDir, request.code(), request.testCases());

            HostConfig hostConfig = HostConfig.newHostConfig()
                .withBinds(new Bind(tempDir.toString(), new Volume("/workspace")))
                .withMemory(memoryLimitMb * 1024L * 1024L)
                .withMemorySwap(memoryLimitMb * 1024L * 1024L)
                .withCpuCount(1L)
                .withNetworkMode("none")
                .withReadonlyRootfs(true)
                .withTmpFs(java.util.Map.of("/tmp", "rw,noexec,nosuid,size=50m"));

            CreateContainerResponse container = dockerClient.createContainerCmd(dockerImage)
                .withHostConfig(hostConfig)
                .withWorkingDir("/workspace")
                .withCmd("sh", "-c", "javac Main.java 2>&1 && java Main 2>&1")
                .withAttachStdout(true)
                .withAttachStderr(true)
                .exec();

            containerId = container.getId();
            dockerClient.startContainerCmd(containerId).exec();

            WaitContainerResultCallback waitCallback = new WaitContainerResultCallback();
            dockerClient.waitContainerCmd(containerId).exec(waitCallback);

            boolean finished = waitCallback.awaitCompletion(timeoutSeconds, TimeUnit.SECONDS);

            if (!finished) {
                dockerClient.killContainerCmd(containerId).exec();
                return ExecutionResult.timeout("", "Tempo limite excedido (" + timeoutSeconds + "s)");
            }

            ContainerLogs logs = readContainerLogs(containerId);

            return parseResults(logs.stdout(), logs.stderr(), request.testCases());

        } catch (Exception e) {
            return ExecutionResult.error("Erro na execução: " + e.getMessage());
        } finally {
            cleanup(tempDir, containerId);
        }
    }

    private ExecutionResult executeLocally(CodeRequest request) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("javastudy-sandbox-");
            writeJavaFile(tempDir, request.code(), request.testCases());

            // Compile
            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            if (compiler == null) {
                return ExecutionResult.error("Java compiler not available. Please run with JDK (not JRE).");
            }

            File javaFile = tempDir.resolve("Main.java").toFile();
            int compileResult = compiler.run(null, null, null, javaFile.getAbsolutePath());
            if (compileResult != 0) {
                return ExecutionResult.error("Compilation failed");
            }

            // Run with timeout and memory limit
            ProcessBuilder pb = new ProcessBuilder("java", "-Xmx" + memoryLimitMb + "m", "-cp", tempDir.toString(), "Main");
            pb.directory(tempDir.toFile());
            pb.redirectErrorStream(false);

            Process process = pb.start();

            // Read output with timeout
            String stdout = readStream(process.getInputStream());
            String stderr = readStream(process.getErrorStream());

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return ExecutionResult.timeout("", "Tempo limite excedido (" + timeoutSeconds + "s)");
            }

            int exitCode = process.exitValue();

            return parseResults(stdout, stderr, request.testCases());

        } catch (Exception e) {
            return ExecutionResult.error("Erro na execução: " + e.getMessage());
        } finally {
            cleanup(tempDir, null);
        }
    }

    private String readStream(InputStream is) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    private ContainerLogs readContainerLogs(String containerId) throws InterruptedException {
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();

        ResultCallback.Adapter<Frame> callback = new ResultCallback.Adapter<>() {
            @Override
            public void onNext(Frame frame) {
                String text = new String(frame.getPayload(), StandardCharsets.UTF_8);

                if (frame.getStreamType() == StreamType.STDERR) {
                    stderr.append(text);
                } else {
                    stdout.append(text);
                }
            }
        };

        dockerClient.logContainerCmd(containerId)
            .withStdOut(true)
            .withStdErr(true)
            .withFollowStream(false)
            .exec(callback)
            .awaitCompletion();

        return new ContainerLogs(stdout.toString(), stderr.toString());
    }

    private void writeJavaFile(Path tempDir, String userCode, List<TestCase> testCases) throws IOException {
        Path javaFile = tempDir.resolve("Main.java");
        String fullCode = generateMainClass(userCode, testCases);
        Files.writeString(javaFile, fullCode);
    }

    private String generateMainClass(String userCode, List<TestCase> testCases) {
        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n");
        sb.append("import java.lang.reflect.*;\n");
        sb.append("import java.util.ArrayList;\n\n");
        sb.append(userCode).append("\n\n");
        sb.append("public class Main {\n");
        sb.append("    public static void main(String[] args) {\n");
        sb.append("        try {\n");
        sb.append("            Class<?> solutionClass = Class.forName(\"Solution\");\n");
        sb.append("            Object solution = solutionClass.getDeclaredConstructor().newInstance();\n\n");

        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            String input = tc.getInputData() != null ? tc.getInputData() : "";
            String expected = tc.getExpectedOutput();

            sb.append("            // Test ").append(i + 1).append("\n");
            sb.append("            String input").append(i + 1).append(" = ").append(escapeForJavaString(input)).append(";\n");
            sb.append("            String expected").append(i + 1).append(" = ").append(escapeForJavaString(expected)).append(";\n");
            sb.append("            String actual").append(i + 1).append(" = \"\";\n");
            sb.append("            String error").append(i + 1).append(" = \"\";\n");
            sb.append("            try {\n");
            sb.append("                actual").append(i + 1).append(" = runTest(solution, input").append(i + 1).append(");\n");
            sb.append("            } catch (Exception e) {\n");
            sb.append("                error").append(i + 1).append(" = e.getMessage();\n");
            sb.append("            }\n");
            sb.append("            boolean passed").append(i + 1).append(" = error").append(i + 1).append(".isEmpty() && actual").append(i + 1).append(".trim().equals(expected").append(i + 1).append(".trim());\n");
            sb.append("            System.out.println(\"---TEST ").append(i + 1).append("--- \" + passed").append(i + 1).append(");\n");
            sb.append("            System.out.println(\"INPUT: \" + input").append(i + 1).append(");\n");
            sb.append("            System.out.println(\"EXPECTED: \" + expected").append(i + 1).append(");\n");
            sb.append("            System.out.println(\"ACTUAL: \" + actual").append(i + 1).append(");\n");
            sb.append("            System.out.println(\"ERROR: \" + error").append(i + 1).append(");\n\n");
        }

        sb.append("        } catch (Exception e) {\n");
        sb.append("            System.err.println(\"SETUP_ERROR: \" + e.getMessage());\n");
        sb.append("            e.printStackTrace();\n");
        sb.append("        }\n");
        sb.append("    }\n\n");

        sb.append("    private static String runTest(Object solution, String input) throws Exception {\n");
        sb.append("        if (input == null || input.isEmpty()) {\n");
        sb.append("            Method method = findNoArgMethod(solution.getClass());\n");
        sb.append("            Object result = method.invoke(solution);\n");
        sb.append("            return result != null ? result.toString() : \"\";\n");
        sb.append("        }\n");
        sb.append("\n");
        sb.append("        // Parse input - assume JSON-like format for arrays/objects\n");
        sb.append("        // For simplicity, try to find a method that matches the input pattern\n");
        sb.append("        Method[] methods = solution.getClass().getDeclaredMethods();\n");
        sb.append("        for (Method method : methods) {\n");
        sb.append("            if (method.getName().equals(\"testFactory\") || method.getName().equals(\"testSingleton\") ||\n");
        sb.append("                method.getName().equals(\"filterAdults\") || method.getName().equals(\"findUserName\") ||\n");
        sb.append("                method.getName().equals(\"combineAsync\") || method.getName().equals(\"testVirtualThreads\") ||\n");
        sb.append("                method.getName().equals(\"search\") || method.getName().equals(\"twoSum\") ||\n");
        sb.append("                method.getName().equals(\"sortArray\")) {\n");
        sb.append("                return invokeWithParsedInput(solution, method, input);\n");
        sb.append("            }\n");
        sb.append("        }\n");
        sb.append("\n");
        sb.append("        // Fallback: try first non-main method\n");
        sb.append("        for (Method method : methods) {\n");
        sb.append("            if (!method.getName().equals(\"main\") && method.getParameterCount() > 0) {\n");
        sb.append("                return invokeWithParsedInput(solution, method, input);\n");
        sb.append("            }\n");
        sb.append("        }\n");
        sb.append("        throw new IllegalStateException(\"No suitable test method found\");\n");
        sb.append("    }\n\n");

        sb.append("    private static Method findNoArgMethod(Class<?> clazz) {\n");
        sb.append("        for (Method m : clazz.getDeclaredMethods()) {\n");
        sb.append("            if (m.getParameterCount() == 0 && !m.getName().equals(\"main\")) {\n");
        sb.append("                return m;\n");
        sb.append("            }\n");
        sb.append("        }\n");
        sb.append("        throw new IllegalStateException(\"No zero-argument method found\");\n");
        sb.append("    }\n\n");

        sb.append("    private static String invokeWithParsedInput(Object solution, Method method, String input) throws Exception {\n");
        sb.append("        Class<?>[] paramTypes = method.getParameterTypes();\n");
        sb.append("        Object[] args = new Object[paramTypes.length];\n");
        sb.append("        \n");
        sb.append("        if (paramTypes.length == 1) {\n");
        sb.append("            args[0] = parseInput(input, paramTypes[0]);\n");
        sb.append("        } else if (paramTypes.length == 2) {\n");
        sb.append("            // Try to split input by newline for two params\n");
        sb.append("            String[] parts = input.split(\"\\n\", 2);\n");
        sb.append("            args[0] = parseInput(parts[0], paramTypes[0]);\n");
        sb.append("            args[1] = parts.length > 1 ? parseInput(parts[1], paramTypes[1]) : null;\n");
        sb.append("        }\n");
        sb.append("        \n");
        sb.append("        Object result = method.invoke(solution, args);\n");
        sb.append("        return formatResult(result);\n");
        sb.append("    }\n\n");

        sb.append("    private static Object parseInput(String input, Class<?> type) {\n");
        sb.append("        input = input.trim();\n");
        sb.append("        if (type == int.class || type == Integer.class) {\n");
        sb.append("            return Integer.parseInt(input);\n");
        sb.append("        } else if (type == String.class) {\n");
        sb.append("            return input.replaceAll(\"^\\\"|\\\"$\", \"\");\n");
        sb.append("        } else if (type == int[].class) {\n");
        sb.append("            return parseIntArray(input);\n");
        sb.append("        } else if (type == String[].class) {\n");
        sb.append("            return parseStringArray(input);\n");
        sb.append("        } else if (type == List.class) {\n");
        sb.append("            return parseList(input);\n");
        sb.append("        } else if (type.isArray()) {\n");
        sb.append("            Class<?> comp = type.getComponentType();\n");
        sb.append("            if (comp == int.class) return parseIntArray(input);\n");
        sb.append("            if (comp == String.class) return parseStringArray(input);\n");
        sb.append("        }\n");
        sb.append("        throw new IllegalArgumentException(\"Unsupported parameter type: \" + type.getName());\n");
        sb.append("    }\n\n");

        sb.append("    private static int[] parseIntArray(String input) {\n");
        sb.append("        input = input.trim();\n");
        sb.append("        if (input.startsWith(\"[\") && input.endsWith(\"]\")) {\n");
        sb.append("            input = input.substring(1, input.length() - 1);\n");
        sb.append("        }\n");
        sb.append("        if (input.isEmpty()) return new int[0];\n");
        sb.append("        String[] parts = input.split(\",\");\n");
        sb.append("        int[] arr = new int[parts.length];\n");
        sb.append("        for (int i = 0; i < parts.length; i++) {\n");
        sb.append("            arr[i] = Integer.parseInt(parts[i].trim());\n");
        sb.append("        }\n");
        sb.append("        return arr;\n");
        sb.append("    }\n\n");

        sb.append("    private static String[] parseStringArray(String input) {\n");
        sb.append("        input = input.trim();\n");
        sb.append("        if (input.startsWith(\"[\") && input.endsWith(\"]\")) {\n");
        sb.append("            input = input.substring(1, input.length() - 1);\n");
        sb.append("        }\n");
        sb.append("        if (input.isEmpty()) return new String[0];\n");
        sb.append("        String[] parts = input.split(\",\");\n");
        sb.append("        for (int i = 0; i < parts.length; i++) {\n");
        sb.append("            parts[i] = parts[i].trim().replaceAll(\"^\\\"|\\\"$\", \"\");\n");
        sb.append("        }\n");
        sb.append("        return parts;\n");
        sb.append("    }\n\n");

        sb.append("    private static List<?> parseList(String input) {\n");
        sb.append("        input = input.trim();\n");
        sb.append("        if (input.startsWith(\"[\") && input.endsWith(\"]\")) {\n");
        sb.append("            input = input.substring(1, input.length() - 1);\n");
        sb.append("        }\n");
        sb.append("        if (input.isEmpty()) return List.of();\n");
        sb.append("        // Try to parse as User records: User(name, age)\n");
        sb.append("        if (input.contains(\"User(\")) {\n");
        sb.append("            List<Object> users = new ArrayList<>();\n");
        sb.append("            String[] userParts = input.split(\"\\\\)\\\\s*,\\\\s*User\\\\(|\\\\)\\\\s*$\");\n");
        sb.append("            for (String part : userParts) {\n");
        sb.append("                part = part.trim();\n");
        sb.append("                if (part.startsWith(\"User(\")) part = part.substring(5);\n");
        sb.append("                if (part.endsWith(\")\")) part = part.substring(0, part.length() - 1);\n");
        sb.append("                String[] fields = part.split(\",\");\n");
        sb.append("                if (fields.length >= 2) {\n");
        sb.append("                    String fieldName = fields[0].trim().replaceAll(\"^\\\"|\\\"$\", \"\");\n");
        sb.append("                    int fieldAge = Integer.parseInt(fields[1].trim());\n");
        sb.append("                    users.add(new Object() {\n");
        sb.append("                        public String name = fieldName;\n");
        sb.append("                        public int age = fieldAge;\n");
        sb.append("                        public String toString() { return \"User(\" + name + \", \" + age + \")\"; }\n");
        sb.append("                    });\n");
        sb.append("                }\n");
        sb.append("            }\n");
        sb.append("            return users;\n");
        sb.append("        }\n");
        sb.append("        return List.of();\n");
        sb.append("    }\n\n");

        sb.append("    private static String formatResult(Object result) {\n");
        sb.append("        if (result == null) return \"\";\n");
        sb.append("        if (result.getClass().isArray()) {\n");
        sb.append("            if (result instanceof int[]) {\n");
        sb.append("                return java.util.Arrays.toString((int[]) result);\n");
        sb.append("            } else if (result instanceof String[]) {\n");
        sb.append("                return java.util.Arrays.toString((String[]) result);\n");
        sb.append("            } else {\n");
        sb.append("                return java.util.Arrays.toString((Object[]) result);\n");
        sb.append("            }\n");
        sb.append("        } else if (result instanceof List) {\n");
        sb.append("            return result.toString();\n");
        sb.append("        }\n");
        sb.append("        return result.toString();\n");
        sb.append("    }\n");
        sb.append("}\n");

        return sb.toString();
    }

    private String escapeForJavaString(String s) {
        if (s == null) return "\"\"";
        return "\"" + s
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t") + "\"";
    }

    private ExecutionResult parseResults(String stdout, String stderr, List<TestCase> testCases) {
        List<TestResult> results = new ArrayList<>();
        boolean allPassed = true;
        String combinedOutput = stdout + "\n" + stderr;

        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            String testMarker = "---TEST " + (i + 1) + "--- ";

            int testStart = combinedOutput.indexOf(testMarker);
            if (testStart == -1) {
                results.add(new TestResult(
                    i + 1,
                    false,
                    tc.getInputData() != null ? tc.getInputData() : "",
                    tc.getExpectedOutput(),
                    "",
                    "Test output not found"
                ));
                allPassed = false;
                continue;
            }

            String testOutput = combinedOutput.substring(testStart + testMarker.length());
            String[] lines = testOutput.split("\n");

            boolean passed = false;
            String actualOutput = "";
            String error = "";
            String input = tc.getInputData() != null ? tc.getInputData() : "";

            for (String line : lines) {
                if (line.startsWith("INPUT: ")) {
                    input = line.substring(7);
                } else if (line.startsWith("EXPECTED: ")) {
                    // expected already known
                } else if (line.startsWith("ACTUAL: ")) {
                    actualOutput = line.substring(8);
                } else if (line.startsWith("ERROR: ")) {
                    error = line.substring(7);
                }
            }

            // The first line after marker contains the boolean result
            if (!lines[0].isEmpty()) {
                passed = lines[0].trim().equals("true");
            }

            // Special handling for virtual threads test - accept any valid time output
            if (!passed && tc.getExpectedOutput().equals("Tempo:") && actualOutput.startsWith("Tempo:") && actualOutput.endsWith(" ms")) {
                passed = true;
            }

            if (!passed) {
                allPassed = false;
            }

            results.add(new TestResult(
                i + 1,
                passed,
                input,
                tc.getExpectedOutput(),
                actualOutput,
                error
            ));
        }

        return new ExecutionResult(
            allPassed,
            stdout,
            stderr,
            0,
            false,
            results
        );
    }

    private void cleanup(Path tempDir, String containerId) {
        if (containerId != null) {
            try {
                dockerClient.removeContainerCmd(containerId).withForce(true).exec();
            } catch (Exception ignored) {}
        }
        if (tempDir != null) {
            try {
                Files.walk(tempDir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .forEach(path -> {
                        try { Files.delete(path); } catch (Exception ignored) {}
                    });
            } catch (Exception ignored) {}
        }
    }

    private record ContainerLogs(String stdout, String stderr) {
    }
}