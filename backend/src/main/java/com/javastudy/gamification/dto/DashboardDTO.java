package com.javastudy.gamification.dto;

import com.javastudy.gamification.Achievement;
import com.javastudy.gamification.AttemptHistory;
import com.javastudy.gamification.LevelCalculator;
import com.javastudy.gamification.UserProgress;
import com.javastudy.exercise.dto.ExerciseDTO;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
public class DashboardDTO {
    private long totalXp;
    private int currentLevel;
    private long xpInCurrentLevel;
    private long xpToNextLevel;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastActivityDate;
    private List<AchievementDTO> achievements;
    private List<AchievementDTO> lockedAchievements;
    private List<StreakDayDTO> streakCalendar;
    private ExerciseDTO nextExercise;

    @Data
    public static class AchievementDTO {
        private String key;
        private String name;
        private String description;
        private String icon;
        private boolean unlocked;
        private LocalDate unlockedAt;
    }

    @Data
    public static class StreakDayDTO {
        private LocalDate date;
        private boolean completed;
        private boolean today;
    }

    public static DashboardDTO from(UserProgress progress, LevelCalculator.LevelInfo levelInfo,
                                    List<AttemptHistory> recentAttempts) {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalXp(progress.getTotalXp());
        dto.setCurrentLevel(progress.getCurrentLevel());
        dto.setXpInCurrentLevel(levelInfo.progressInLevel());
        dto.setXpToNextLevel(levelInfo.xpToNextLevel());
        dto.setCurrentStreak(progress.getCurrentStreak());
        dto.setLongestStreak(progress.getLongestStreak());
        dto.setLastActivityDate(progress.getLastActivityDate());

        Set<Achievement> unlocked = progress.getAchievementSet();
        dto.setAchievements(Achievement.ALL.stream()
            .map(a -> {
                AchievementDTO ad = new AchievementDTO();
                ad.setKey(a.name());
                ad.setName(formatName(a));
                ad.setDescription(getDescription(a));
                ad.setIcon(getIcon(a));
                ad.setUnlocked(unlocked.contains(a));
                return ad;
            })
            .toList());

        dto.setLockedAchievements(dto.getAchievements().stream()
            .filter(a -> !a.isUnlocked())
            .toList());

        return dto;
    }

    private static String formatName(Achievement a) {
        return switch (a) {
            case FIRST_BLOOD -> "Primeiro Sangue";
            case STREAK_3 -> "Streak de 3 dias";
            case STREAK_7 -> "Streak de 7 dias";
            case STREAK_30 -> "Streak de 30 dias";
            case ALGORITHM_MASTER -> "Mestre dos Algoritmos";
            case OO_PATTERNS_MASTER -> "Mestre de Padrões OO";
            case JAVA_CORE_MASTER -> "Mestre do Java Core";
            case CONCURRENCY_MASTER -> "Mestre da Concorrência";
            case POLYGLOT -> "Poliglota";
            case NIGHT_OWL -> "Coruja Noturna";
            case EARLY_BIRD -> "Madrugador";
            case WEEKEND_WARRIOR -> "Guerreiro de Fim de Semana";
        };
    }

    private static String getDescription(Achievement a) {
        return switch (a) {
            case FIRST_BLOOD -> "Resolva seu primeiro exercício";
            case STREAK_3 -> "Mantenha uma streak de 3 dias consecutivos";
            case STREAK_7 -> "Mantenha uma streak de 7 dias consecutivos";
            case STREAK_30 -> "Mantenha uma streak de 30 dias consecutivos";
            case ALGORITHM_MASTER -> "Resolva 10 exercícios de Algoritmos";
            case OO_PATTERNS_MASTER -> "Resolva 10 exercícios de Padrões OO";
            case JAVA_CORE_MASTER -> "Resolva 10 exercícios de Java Core";
            case CONCURRENCY_MASTER -> "Resolva 10 exercícios de Concorrência";
            case POLYGLOT -> "Resolva pelo menos 1 exercício de cada categoria";
            case NIGHT_OWL -> "Resolva um exercício entre 00h e 05h";
            case EARLY_BIRD -> "Resolva um exercício entre 05h e 08h";
            case WEEKEND_WARRIOR -> "Resolva um exercício no fim de semana";
        };
    }

    private static String getIcon(Achievement a) {
        return switch (a) {
            case FIRST_BLOOD -> "🩸";
            case STREAK_3, STREAK_7, STREAK_30 -> "🔥";
            case ALGORITHM_MASTER -> "🧮";
            case OO_PATTERNS_MASTER -> "🏗️";
            case JAVA_CORE_MASTER -> "☕";
            case CONCURRENCY_MASTER -> "⚡";
            case POLYGLOT -> "🌍";
            case NIGHT_OWL -> "🦉";
            case EARLY_BIRD -> "🌅";
            case WEEKEND_WARRIOR -> "🏖️";
        };
    }
}