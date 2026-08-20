package com.javastudy.gamification;

import com.javastudy.exercise.Exercise;
import com.javastudy.exercise.ExerciseCategory;
import com.javastudy.exercise.ExerciseRepository;
import com.javastudy.user.User;
import com.javastudy.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class GamificationService {
    private final UserProgressRepository progressRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public GamificationService(UserProgressRepository progressRepository, ExerciseRepository exerciseRepository, UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    public UserProgress getOrCreateProgress(User user) {
        // Re-attach user if detached
        User managedUser = userRepository.findById(user.getId()).orElseThrow();
        return progressRepository.findByUserId(managedUser.getId())
            .orElseGet(() -> progressRepository.save(
                UserProgress.builder()
                    .user(managedUser)
                    .build()
            ));
    }

    public void awardXp(User user, int xp, Exercise exercise) {
        UserProgress progress = getOrCreateProgress(user);
        long newTotalXp = progress.getTotalXp() + xp;
        progress.setTotalXp(newTotalXp);

        int newLevel = LevelCalculator.calculateLevel(newTotalXp);
        if (newLevel > progress.getCurrentLevel()) {
            progress.setCurrentLevel(newLevel);
        }

        updateStreak(progress);
        checkAchievements(progress, exercise);

        progressRepository.save(progress);
    }

    private void updateStreak(UserProgress progress) {
        LocalDate today = LocalDate.now();
        LocalDate lastDate = progress.getLastActivityDate();

        if (lastDate == null) {
            progress.setCurrentStreak(1);
        } else if (lastDate.equals(today)) {
            return; // Já contou hoje
        } else if (lastDate.equals(today.minusDays(1))) {
            progress.setCurrentStreak(progress.getCurrentStreak() + 1);
        } else {
            progress.setCurrentStreak(1);
        }

        if (progress.getCurrentStreak() > progress.getLongestStreak()) {
            progress.setLongestStreak(progress.getCurrentStreak());
        }

        progress.setLastActivityDate(today);
    }

    private void checkAchievements(UserProgress progress, Exercise exercise) {
        // FIRST_BLOOD
        if (!progress.hasAchievement(Achievement.FIRST_BLOOD)) {
            progress.addAchievement(Achievement.FIRST_BLOOD);
        }

        // Streak achievements
        checkStreakAchievements(progress);

        // Category master achievements
        checkCategoryMastery(progress, exercise);

        // POLYGLOT - one of each category
        checkPolyglot(progress);

        // Time-based achievements
        checkTimeAchievements(progress);
    }

    private void checkStreakAchievements(UserProgress progress) {
        int streak = progress.getCurrentStreak();
        if (streak >= 3 && !progress.hasAchievement(Achievement.STREAK_3)) {
            progress.addAchievement(Achievement.STREAK_3);
        }
        if (streak >= 7 && !progress.hasAchievement(Achievement.STREAK_7)) {
            progress.addAchievement(Achievement.STREAK_7);
        }
        if (streak >= 30 && !progress.hasAchievement(Achievement.STREAK_30)) {
            progress.addAchievement(Achievement.STREAK_30);
        }
    }

    private void checkCategoryMastery(UserProgress progress, Exercise exercise) {
        ExerciseCategory cat = exercise.getCategory();
        long count = exerciseRepository.countByCategoryAndUserSolved(cat, progress.getUserId());

        switch (cat) {
            case ALGORITHMS -> {
                if (count >= 10 && !progress.hasAchievement(Achievement.ALGORITHM_MASTER)) {
                    progress.addAchievement(Achievement.ALGORITHM_MASTER);
                }
            }
            case OO_PATTERNS -> {
                if (count >= 10 && !progress.hasAchievement(Achievement.OO_PATTERNS_MASTER)) {
                    progress.addAchievement(Achievement.OO_PATTERNS_MASTER);
                }
            }
            case JAVA_CORE -> {
                if (count >= 10 && !progress.hasAchievement(Achievement.JAVA_CORE_MASTER)) {
                    progress.addAchievement(Achievement.JAVA_CORE_MASTER);
                }
            }
            case CONCURRENCY -> {
                if (count >= 10 && !progress.hasAchievement(Achievement.CONCURRENCY_MASTER)) {
                    progress.addAchievement(Achievement.CONCURRENCY_MASTER);
                }
            }
        }
    }

    private void checkPolyglot(UserProgress progress) {
        if (progress.hasAchievement(Achievement.POLYGLOT)) return;

        boolean hasAlgo = exerciseRepository.countByCategoryAndUserSolved(ExerciseCategory.ALGORITHMS, progress.getUserId()) > 0;
        boolean hasOo = exerciseRepository.countByCategoryAndUserSolved(ExerciseCategory.OO_PATTERNS, progress.getUserId()) > 0;
        boolean hasCore = exerciseRepository.countByCategoryAndUserSolved(ExerciseCategory.JAVA_CORE, progress.getUserId()) > 0;
        boolean hasConcurrency = exerciseRepository.countByCategoryAndUserSolved(ExerciseCategory.CONCURRENCY, progress.getUserId()) > 0;

        if (hasAlgo && hasOo && hasCore && hasConcurrency) {
            progress.addAchievement(Achievement.POLYGLOT);
        }
    }

    private void checkTimeAchievements(UserProgress progress) {
        LocalTime now = LocalTime.now();
        DayOfWeek day = LocalDate.now().getDayOfWeek();

        if ((now.isAfter(LocalTime.MIDNIGHT) && now.isBefore(LocalTime.of(5, 0))) &&
            !progress.hasAchievement(Achievement.NIGHT_OWL)) {
            progress.addAchievement(Achievement.NIGHT_OWL);
        }

        if ((now.isAfter(LocalTime.of(5, 0)) && now.isBefore(LocalTime.of(8, 0))) &&
            !progress.hasAchievement(Achievement.EARLY_BIRD)) {
            progress.addAchievement(Achievement.EARLY_BIRD);
        }

        if ((day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) &&
            !progress.hasAchievement(Achievement.WEEKEND_WARRIOR)) {
            progress.addAchievement(Achievement.WEEKEND_WARRIOR);
        }
    }
}