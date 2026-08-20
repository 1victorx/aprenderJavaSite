package com.javastudy.exercise;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findBySlug(String slug);

    List<Exercise> findByCategoryOrderByOrderAsc(ExerciseCategory category);

    @Query("SELECT e FROM Exercise e WHERE e.category = :category ORDER BY e.order ASC")
    Page<Exercise> findByCategory(ExerciseCategory category, Pageable pageable);

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