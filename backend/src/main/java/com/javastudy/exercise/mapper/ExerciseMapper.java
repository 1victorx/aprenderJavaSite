package com.javastudy.exercise.mapper;

import com.javastudy.exercise.Exercise;
import com.javastudy.exercise.TestCase;
import com.javastudy.exercise.dto.ExerciseDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.ArrayList;

@Component
public class ExerciseMapper {

    public ExerciseDTO toDTO(Exercise exercise) {
        if (exercise == null) {
            return null;
        }

        ExerciseDTO dto = new ExerciseDTO();
        dto.setId(exercise.getId());
        dto.setSlug(exercise.getSlug());
        dto.setTitle(exercise.getTitle());
        dto.setDescription(exercise.getDescription());
        dto.setCategory(exercise.getCategory());
        dto.setDifficulty(exercise.getDifficulty());
        dto.setStarterCode(exercise.getStarterCode());
        dto.setXpReward(exercise.getXpReward());
        dto.setOrder(exercise.getOrder());

        if (exercise.getTestCases() != null) {
            List<ExerciseDTO.TestCaseDTO> visible = new ArrayList<>();
            for (TestCase tc : exercise.getTestCases()) {
                if (tc != null && Boolean.FALSE.equals(tc.getIsHidden())) {
                    ExerciseDTO.TestCaseDTO testCaseDTO = new ExerciseDTO.TestCaseDTO();
                    testCaseDTO.setId(tc.getId());
                    testCaseDTO.setInputData(tc.getInputData());
                    testCaseDTO.setExpectedOutput(tc.getExpectedOutput());
                    testCaseDTO.setOrder(tc.getOrder());
                    visible.add(testCaseDTO);
                }
            }
            dto.setVisibleTestCases(visible);
        } else {
            dto.setVisibleTestCases(List.of());
        }

        return dto;
    }

    public List<ExerciseDTO> toDTOList(List<Exercise> exercises) {
        if (exercises == null) {
            return List.of();
        }
        List<ExerciseDTO> list = new ArrayList<>(exercises.size());
        for (Exercise exercise : exercises) {
            list.add(toDTO(exercise));
        }
        return list;
    }
}