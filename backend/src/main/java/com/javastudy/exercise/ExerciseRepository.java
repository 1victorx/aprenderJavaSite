package com.javastudy.exercise;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findBySlug(String slug);

    List<Exercise> findByCategoryOrderByOrderAsc(ExerciseCategory category);

    @Query("""
        SELECT DISTINCT e FROM Exercise e
        LEFT JOIN AttemptHistory a ON a.exercise.id = e.id
            AND a.user.id = :userId AND a.passed = true
        WHERE (:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:category IS NULL OR e.category = :category)
          AND (:difficulty IS NULL OR e.difficulty = :difficulty)
          AND (:status = 'all'
            OR (:status = 'solved' AND a.id IS NOT NULL)
            OR (:status = 'unsolved' AND a.id IS NULL))
        ORDER BY e.order ASC
        """)
    Page<Exercise> search(
            @Param("query") String query,
            @Param("category") ExerciseCategory category,
            @Param("difficulty") Difficulty difficulty,
            @Param("status") String status,
            @Param("userId") Long userId,
            Pageable pageable
    );

    @Query("SELECT e.id FROM Exercise e JOIN AttemptHistory a ON a.exercise.id = e.id WHERE a.user.id = :userId AND a.passed = true")
    List<Long> findSolvedExerciseIds(@Param("userId") Long userId);

    @Query("SELECT e FROM Exercise e ORDER BY e.order ASC")
    Page<Exercise> findAllOrdered(Pageable pageable);

    boolean existsBySlug(String slug);

    @Query("""
        SELECT COUNT(DISTINCT e) FROM Exercise e
        JOIN e.testCases tc
        JOIN AttemptHistory a ON a.exercise.id = e.id
        WHERE e.category = :category AND a.user.id = :userId AND a.passed = true
        """)
    long countByCategoryAndUserSolved(ExerciseCategory category, Long userId);
}
