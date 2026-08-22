package com.javastudy.exercise.dto;

import com.javastudy.exercise.ExerciseCategory;
import com.javastudy.exercise.Difficulty;
import lombok.Data;

import java.util.List;

@Data
public class ExerciseDTO {
    private Long id;
    private String slug;
    private String title;
    private String description;
    private ExerciseCategory category;
    private Difficulty difficulty;
    private String starterCode;
    private Integer xpReward;
    private Integer order;
    private Boolean solved;
    private List<TestCaseDTO> visibleTestCases;

    @Data
    public static class TestCaseDTO {
        private Long id;
        private String inputData;
        private String expectedOutput;
        private Integer order;
    }
}
