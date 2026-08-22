package com.javastudy.gamification;

import com.javastudy.gamification.dto.DashboardDTO;
import com.javastudy.gamification.dto.AttemptHistoryDTO;
import com.javastudy.exercise.Exercise;
import com.javastudy.exercise.ExerciseRepository;
import com.javastudy.exercise.mapper.ExerciseMapper;
import com.javastudy.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {
    private final GamificationService gamificationService;
    private final AttemptHistoryRepository attemptHistoryRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseMapper exerciseMapper;

    public DashboardService(GamificationService gamificationService,
                            AttemptHistoryRepository attemptHistoryRepository,
                            ExerciseRepository exerciseRepository,
                            ExerciseMapper exerciseMapper) {
        this.gamificationService = gamificationService;
        this.attemptHistoryRepository = attemptHistoryRepository;
        this.exerciseRepository = exerciseRepository;
        this.exerciseMapper = exerciseMapper;
    }

    public DashboardDTO getDashboard(User user) {
        UserProgress progress = gamificationService.getOrCreateProgress(user);

        Page<AttemptHistory> recentAttempts = attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), Pageable.ofSize(10));

        DashboardDTO dto = DashboardDTO.from(progress, LevelCalculator.getLevelInfo(progress.getTotalXp()), recentAttempts.getContent());
        dto.setStreakCalendar(buildStreakCalendar(progress));
        Set<Long> solvedIds = attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(), Pageable.unpaged()
            ).stream()
            .filter(attempt -> Boolean.TRUE.equals(attempt.getPassed()))
            .map(attempt -> attempt.getExercise().getId())
            .collect(Collectors.toSet());
        Exercise next = exerciseRepository.findAllOrdered(Pageable.ofSize(50)).getContent().stream()
            .filter(exercise -> !solvedIds.contains(exercise.getId()))
            .findFirst()
            .orElse(null);
        if (next != null) {
            dto.setNextExercise(exerciseMapper.toDTO(next));
        }
        return dto;
    }

    public Page<AttemptHistory> getHistory(User user, Boolean passed, Pageable pageable) {
        if (passed == null) {
            return attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        return attemptHistoryRepository.findByUserIdAndPassedOrderByCreatedAtDesc(user.getId(), passed, pageable);
    }

    public List<AttemptHistoryDTO> getExerciseHistory(User user, Long exerciseId) {
        return attemptHistoryRepository.findByUserIdAndExerciseId(user.getId(), exerciseId).stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .limit(8)
            .map(AttemptHistoryDTO::from)
            .toList();
    }

    private List<DashboardDTO.StreakDayDTO> buildStreakCalendar(UserProgress progress) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusWeeks(12).with(DayOfWeek.SUNDAY);
        List<LocalDate> completedDates = attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(progress.getUserId(), Pageable.unpaged())
            .stream()
            .map(a -> a.getCreatedAt().toLocalDate())
            .distinct()
            .toList();

        return start.datesUntil(today.plusDays(1))
            .map(date -> {
                DashboardDTO.StreakDayDTO dto = new DashboardDTO.StreakDayDTO();
                dto.setDate(date);
                dto.setCompleted(completedDates.contains(date));
                dto.setToday(date.equals(today));
                return dto;
            })
            .toList();
    }
}
