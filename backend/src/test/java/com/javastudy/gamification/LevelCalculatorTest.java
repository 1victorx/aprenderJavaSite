package com.javastudy.gamification;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LevelCalculatorTest {
    @Test
    void levelOneStartsAtZeroXp() {
        LevelCalculator.LevelInfo info = LevelCalculator.getLevelInfo(0);

        assertThat(info.currentLevel()).isEqualTo(1);
        assertThat(info.progressInLevel()).isZero();
        assertThat(info.xpToNextLevel()).isEqualTo(100);
    }

    @Test
    void levelTwoStartsAtOneHundredXp() {
        LevelCalculator.LevelInfo info = LevelCalculator.getLevelInfo(100);

        assertThat(info.currentLevel()).isEqualTo(2);
        assertThat(info.progressInLevel()).isZero();
        assertThat(info.xpToNextLevel()).isEqualTo(200);
    }
}
