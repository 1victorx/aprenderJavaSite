package com.javastudy.exercise;

import com.javastudy.exercise.dto.ExerciseDTO;
import com.javastudy.exercise.dto.RunCodeRequest;
import com.javastudy.exercise.dto.RunCodeResponse;
import com.javastudy.user.User;
import com.javastudy.shared.exception.ApiException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exercises")
public class ExerciseController {
    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseDTO>> list(
            @RequestParam(name = "category", required = false) ExerciseCategory category,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ExerciseDTO> exercises = category != null
            ? exerciseService.findByCategory(category, pageable)
            : exerciseService.findAll(pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.findById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ExerciseDTO> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(exerciseService.findBySlug(slug));
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<RunCodeResponse> runCode(
            @PathVariable Long id,
            @Valid @RequestBody RunCodeRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) throw ApiException.unauthorized("Login necessário para executar código");
        return ResponseEntity.ok(exerciseService.runCode(id, request, user));
    }

    @PostMapping("/slug/{slug}/run")
    public ResponseEntity<RunCodeResponse> runCodeBySlug(
            @PathVariable String slug,
            @Valid @RequestBody RunCodeRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) throw ApiException.unauthorized("Login necessário para executar código");
        return ResponseEntity.ok(exerciseService.runCodeBySlug(slug, request, user));
    }
}