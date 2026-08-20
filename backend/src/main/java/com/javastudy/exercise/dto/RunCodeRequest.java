package com.javastudy.exercise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RunCodeRequest {
    @NotBlank(message = "Código é obrigatório")
    private String code;
}