package com.javastudy.gamification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptHistoryRepository extends JpaRepository<AttemptHistory, Long> {
    Page<AttemptHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<AttemptHistory> findByUserIdAndExerciseId(Long userId, Long exerciseId);
}