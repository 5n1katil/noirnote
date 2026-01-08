/**
 * NoirNote — User Stats Firestore Utilities
 *
 * Manages user statistics: users/{uid}/stats
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase.client";

export type UserStats = {
  uid: string;
  totalScore: number;
  solvedCases: number;
  averageTimeMs: number;
  totalAttempts: number;
  lastUpdated: unknown; // serverTimestamp placeholder
};

/**
 * Get user stats
 */
export async function getUserStats(uid: string): Promise<UserStats | null> {
  const { db } = getFirebaseClient();

  try {
    const ref = doc(db, "users", uid, "stats", "main");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data() as UserStats;
    }
    return null;
  } catch (error) {
    console.error("[userStats] Failed to get user stats:", error);
    throw error;
  }
}

/**
 * Update user stats after case completion
 */
export async function updateUserStats(
  uid: string,
  caseScore: number,
  durationMs: number,
  attempts: number
): Promise<void> {
  const { db } = getFirebaseClient();

  try {
    const ref = doc(db, "users", uid, "stats", "main");
    const current = await getDoc(ref);

    let stats: Omit<UserStats, "lastUpdated">;

    if (current.exists()) {
      const existing = current.data() as UserStats;
      const newSolvedCases = existing.solvedCases + 1;
      const newTotalScore = existing.totalScore + caseScore;
      const newTotalAttempts = existing.totalAttempts + attempts;
      
      // Calculate new average time
      const newAverageTimeMs = 
        (existing.averageTimeMs * existing.solvedCases + durationMs) / newSolvedCases;

      stats = {
        uid,
        totalScore: newTotalScore,
        solvedCases: newSolvedCases,
        averageTimeMs: Math.round(newAverageTimeMs),
        totalAttempts: newTotalAttempts,
      };
    } else {
      // First case completion
      stats = {
        uid,
        totalScore: caseScore,
        solvedCases: 1,
        averageTimeMs: durationMs,
        totalAttempts: attempts,
      };
    }

    await setDoc(
      ref,
      {
        ...stats,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("[userStats] Failed to update user stats:", error);
    throw error;
  }
}

