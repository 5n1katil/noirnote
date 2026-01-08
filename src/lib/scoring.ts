/**
 * NoirNote — Scoring System
 *
 * Calculates player scores based on:
 * - Duration (faster = higher score)
 * - Attempts (fewer = higher score)
 * - Difficulty multiplier
 */

export type Difficulty = "easy" | "medium" | "hard";

const BASE_SCORE = 1000;
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

/**
 * Calculate score for a completed case
 * 
 * Formula: (BASE_SCORE / (durationMinutes + 1)) * (1 / attempts) * difficultyMultiplier
 * 
 * @param durationMs Total duration in milliseconds (including penalties)
 * @param attempts Number of attempts
 * @param difficulty Case difficulty
 * @returns Calculated score (higher is better)
 */
export function calculateCaseScore(
  durationMs: number,
  attempts: number,
  difficulty: Difficulty
): number {
  if (attempts === 0) return 0;

  const durationMinutes = durationMs / (1000 * 60);
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];

  // Base score decreases with time (but not too harshly)
  const timeFactor = BASE_SCORE / (durationMinutes + 1);

  // Attempts penalty: fewer attempts = higher score
  const attemptFactor = 1 / attempts;

  // Final score
  const score = timeFactor * attemptFactor * difficultyMultiplier;

  // Round to nearest integer
  return Math.round(score);
}

/**
 * Calculate total score from multiple case scores
 */
export function calculateTotalScore(caseScores: number[]): number {
  return caseScores.reduce((sum, score) => sum + score, 0);
}

/**
 * Calculate average time from multiple durations (in milliseconds)
 */
export function calculateAverageTime(durations: number[]): number {
  if (durations.length === 0) return 0;
  return durations.reduce((sum, d) => sum + d, 0) / durations.length;
}

