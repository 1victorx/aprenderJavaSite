package com.javastudy.gamification;

public final class LevelCalculator {
    private static final long XP_PER_LEVEL_BASE = 100;

    private LevelCalculator() {}

    public static int calculateLevel(long totalXp) {
        if (totalXp < XP_PER_LEVEL_BASE) {
            return 1;
        }
        double discriminant = 1 + 8.0 * totalXp / XP_PER_LEVEL_BASE;
        return Math.max(1, (int) Math.floor((1 + Math.sqrt(discriminant)) / 2));
    }

    public static long xpForLevel(int level) {
        if (level <= 1) return 0;
        return XP_PER_LEVEL_BASE * (long) (level - 1) * level / 2;
    }

    public static long xpToNextLevel(long totalXp) {
        int currentLevel = calculateLevel(totalXp);
        long xpForCurrentLevel = xpForLevel(currentLevel);
        long xpForNextLevel = xpForLevel(currentLevel + 1);
        return xpForNextLevel - totalXp;
    }

    public static long xpForCurrentLevel(long totalXp) {
        int currentLevel = calculateLevel(totalXp);
        return xpForLevel(currentLevel);
    }

    public static LevelInfo getLevelInfo(long totalXp) {
        int level = calculateLevel(totalXp);
        long xpCurrentLevel = xpForLevel(level);
        long xpNextLevel = xpForLevel(level + 1);
        long progress = totalXp - xpCurrentLevel;
        long needed = xpNextLevel - xpCurrentLevel;
        return new LevelInfo(level, progress, needed, xpNextLevel - totalXp);
    }

    public record LevelInfo(
        int currentLevel,
        long progressInLevel,
        long xpNeededForLevel,
        long xpToNextLevel
    ) {}
}