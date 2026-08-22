package com.javastudy.gamification;

import com.javastudy.gamification.dto.DashboardDTO;
import com.javastudy.gamification.dto.AttemptHistoryDTO;
import com.javastudy.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamification")
public class GamificationController {
    private final DashboardService dashboardService;

    public GamificationController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getDashboard(user));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<AttemptHistory>> getHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "passed", required = false) Boolean passed,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(dashboardService.getHistory(user, passed, pageable));
    }

    @GetMapping("/history/exercise/{exerciseId}")
    public ResponseEntity<List<AttemptHistoryDTO>> getExerciseHistory(
            @AuthenticationPrincipal User user,
            @PathVariable Long exerciseId
    ) {
        return ResponseEntity.ok(dashboardService.getExerciseHistory(user, exerciseId));
    }
}
