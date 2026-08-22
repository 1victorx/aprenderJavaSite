package com.javastudy.gamification.dto;

import com.javastudy.gamification.AttemptHistory;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttemptHistoryDTO {
    private Long id;
    private Long exerciseId;
    private String exerciseTitle;
    private String exerciseSlug;
    private Boolean passed;
    private String output;
    private Integer executionTimeMs;
    private Integer xpEarned;
    private LocalDateTime createdAt;

    public static AttemptHistoryDTO from(AttemptHistory attempt) {
        AttemptHistoryDTO dto = new AttemptHistoryDTO();
        dto.setId(attempt.getId());
        dto.setExerciseId(attempt.getExercise().getId());
        dto.setExerciseTitle(attempt.getExercise().getTitle());
        dto.setExerciseSlug(attempt.getExercise().getSlug());
        dto.setPassed(attempt.getPassed());
        dto.setOutput(attempt.getOutput());
        dto.setExecutionTimeMs(attempt.getExecutionTimeMs());
        dto.setXpEarned(attempt.getXpEarned());
        dto.setCreatedAt(attempt.getCreatedAt());
        return dto;
    }
}
