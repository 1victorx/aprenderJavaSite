package com.javastudy.gamification;

import com.javastudy.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Long totalXp = 0L;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "achievements", length = 1000)
    @Builder.Default
    private String achievements = "";

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Set<Achievement> getAchievementSet() {
        if (achievements == null || achievements.isEmpty()) {
            return new HashSet<>();
        }
        Set<Achievement> set = new HashSet<>();
        for (String s : achievements.split(",")) {
            if (!s.isEmpty()) {
                try {
                    set.add(Achievement.valueOf(s.trim()));
                } catch (IllegalArgumentException ignored) {}
            }
        }
        return set;
    }

    public void addAchievement(Achievement achievement) {
        Set<Achievement> set = getAchievementSet();
        set.add(achievement);
        this.achievements = String.join(",", set.stream().map(Enum::name).toList());
    }

    public boolean hasAchievement(Achievement achievement) {
        return getAchievementSet().contains(achievement);
    }
}