package com.javastudy.gamification;

import java.util.List;

public enum Achievement {
    FIRST_BLOOD,
    STREAK_3,
    STREAK_7,
    STREAK_30,
    ALGORITHM_MASTER,
    OO_PATTERNS_MASTER,
    JAVA_CORE_MASTER,
    CONCURRENCY_MASTER,
    POLYGLOT,
    NIGHT_OWL,
    EARLY_BIRD,
    WEEKEND_WARRIOR;

    public static final List<Achievement> ALL = List.of(values());
}