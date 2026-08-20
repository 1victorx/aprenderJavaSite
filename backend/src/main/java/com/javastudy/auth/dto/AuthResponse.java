package com.javastudy.auth.dto;

import com.javastudy.user.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;

    public AuthResponse(String accessToken, String refreshToken, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserDto(user);
    }

    @Data
    public static class UserDto {
        private Long id;
        private String name;
        private String email;

        public UserDto(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
        }
    }
}