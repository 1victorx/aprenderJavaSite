package com.javastudy.exercise;

import com.javastudy.exercise.dto.ExerciseDTO;
import com.javastudy.exercise.dto.RunCodeRequest;
import com.javastudy.exercise.dto.RunCodeResponse;
import com.javastudy.exercise.mapper.ExerciseMapper;
import com.javastudy.gamification.AttemptHistory;
import com.javastudy.gamification.AttemptHistoryRepository;
import com.javastudy.gamification.GamificationService;
import com.javastudy.sandbox.Sandbox;
import com.javastudy.shared.exception.ApiException;
import com.javastudy.user.User;
import com.javastudy.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final ExerciseMapper exerciseMapper;
    private final Sandbox sandbox;
    private final AttemptHistoryRepository attemptHistoryRepository;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    public ExerciseService(ExerciseRepository exerciseRepository,
                           ExerciseMapper exerciseMapper,
                           Sandbox sandbox,
                           AttemptHistoryRepository attemptHistoryRepository,
                           GamificationService gamificationService,
                           UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseMapper = exerciseMapper;
        this.sandbox = sandbox;
        this.attemptHistoryRepository = attemptHistoryRepository;
        this.gamificationService = gamificationService;
        this.userRepository = userRepository;
    }

    public Page<ExerciseDTO> findAll(Pageable pageable) {
        return exerciseRepository.findAllOrdered(pageable).map(this::toDTO);
    }

    public Page<ExerciseDTO> findByCategory(ExerciseCategory category, Pageable pageable) {
        return exerciseRepository.findByCategory(category, pageable).map(this::toDTO);
    }

    public ExerciseDTO findById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Exercício não encontrado"));
        return toDTO(exercise);
    }

    public ExerciseDTO findBySlug(String slug) {
        Exercise exercise = exerciseRepository.findBySlug(slug)
            .orElseThrow(() -> ApiException.notFound("Exercício não encontrado"));
        return toDTO(exercise);
    }

    private ExerciseDTO toDTO(Exercise exercise) {
        return exerciseMapper.toDTO(exercise);
    }

    @Transactional
    public RunCodeResponse runCode(Long exerciseId, RunCodeRequest request, User user) {
        User managedUser = userRepository.findById(user.getId())
            .orElseThrow(() -> ApiException.unauthorized("Usuário não encontrado"));
        Exercise exercise = exerciseRepository.findById(exerciseId)
            .orElseThrow(() -> ApiException.notFound("Exercício não encontrado"));

        List<TestCase> allTestCases = exercise.getTestCases();
        if (allTestCases.isEmpty()) {
            throw ApiException.badRequest("Exercício sem casos de teste configurados");
        }

        Sandbox.CodeRequest sandboxRequest = new Sandbox.CodeRequest(
            request.getCode(),
            allTestCases,
            3000,
            256
        );

        Sandbox.ExecutionResult result = sandbox.execute(sandboxRequest);

        List<RunCodeResponse.TestResult> testResults = result.testResults().stream()
            .map(tr -> new RunCodeResponse.TestResult(
                tr.testNumber(),
                tr.passed(),
                tr.input(),
                tr.expectedOutput(),
                tr.actualOutput(),
                tr.error()
            ))
            .toList();

        int xpEarned = 0;
        if (result.success()) {
            xpEarned = exercise.getXpReward();
            gamificationService.awardXp(managedUser, xpEarned, exercise);
        }

        saveAttempt(managedUser, exercise, request.getCode(), result, xpEarned);

        return result.success()
            ? RunCodeResponse.success(result.stdout(), 0L, xpEarned, testResults)
            : RunCodeResponse.failure(result.stdout(), result.stderr(), 0L, testResults);
    }

    private void saveAttempt(User user, Exercise exercise, String code, Sandbox.ExecutionResult result, int xpEarned) {
        AttemptHistory attempt = AttemptHistory.builder()
            .user(user)
            .exercise(exercise)
            .codeSubmitted(code)
            .passed(result.success())
            .output(result.stdout() + "\n" + result.stderr())
            .executionTimeMs(0)
            .xpEarned(xpEarned)
            .build();
        attemptHistoryRepository.save(attempt);
    }

    @Transactional
    public RunCodeResponse runCodeBySlug(String slug, RunCodeRequest request, User user) {
        Exercise exercise = exerciseRepository.findBySlug(slug)
            .orElseThrow(() -> ApiException.notFound("Exercício não encontrado"));
        return runCode(exercise.getId(), request, user);
    }
}