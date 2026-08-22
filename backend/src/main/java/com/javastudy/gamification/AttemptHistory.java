package com.javastudy.gamification;

import com.javastudy.exercise.Exercise;
import com.javastudy.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attempt_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "code_submitted", columnDefinition = "TEXT", nullable = false)
    private String codeSubmitted;

    @Column(name = "passed", nullable = false)
    private Boolean passed;

    @Column(name = "output", columnDefinition = "TEXT")
    private String output;

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "xp_earned", nullable = false)
    @Builder.Default
    private Integer xpEarned = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}