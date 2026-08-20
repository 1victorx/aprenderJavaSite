package com.javastudy.gamification;

import com.javastudy.gamification.dto.DashboardDTO;
import com.javastudy.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final UserProgressRepository progressRepository;
    private final AttemptHistoryRepository attemptHistoryRepository;

    public DashboardService(UserProgressRepository progressRepository, AttemptHistoryRepository attemptHistoryRepository) {
        this.progressRepository = progressRepository;
        this.attemptHistoryRepository = attemptHistoryRepository;
    }

    public DashboardDTO getDashboard(User user) {
        UserProgress progress = progressRepository.findByUserId(user.getId())
            .orElseGet(() -> progressRepository.save(
                UserProgress.builder().user(user).userId(user.getId()).build()
            ));

        Page<AttemptHistory> recentAttempts = attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), Pageable.ofSize(10));

        DashboardDTO dto = DashboardDTO.from(progress, LevelCalculator.getLevelInfo(progress.getTotalXp()), recentAttempts.getContent());
        dto.setStreakCalendar(buildStreakCalendar(progress));
        return dto;
    }

    public Page<AttemptHistory> getHistory(User user, Pageable pageable) {
        return attemptHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
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