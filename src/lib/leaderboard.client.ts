/**
 * NoirNote — Leaderboard Firestore Utilities
 *
 * Manages leaderboards:
 * - leaderboard/global: Global rankings
 * - leaderboard/{caseId}: Case-specific rankings
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  setDoc, 
  serverTimestamp,
  where,
  type QueryDocumentSnapshot 
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase.client";
import { getUserStats } from "./userStats.client";

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  durationMs?: number; // For case-specific leaderboards
  attempts?: number; // For case-specific leaderboards
  solvedCases?: number; // For global leaderboard
  rank?: number; // Calculated on client
  updatedAt: unknown; // serverTimestamp placeholder
};

/**
 * Update global leaderboard entry for a user
 */
export async function updateGlobalLeaderboard(
  uid: string,
  displayName: string,
  photoURL: string | null,
  totalScore: number,
  solvedCases: number
): Promise<void> {
  const { db } = getFirebaseClient();

  try {
    const ref = doc(db, "leaderboard", "global", "entries", uid);
    await setDoc(
      ref,
      {
        uid,
        displayName,
        photoURL: photoURL || null,
        score: totalScore,
        solvedCases,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("[leaderboard] Failed to update global leaderboard:", error);
    throw error;
  }
}

/**
 * Update case-specific leaderboard entry
 */
export async function updateCaseLeaderboard(
  uid: string,
  displayName: string,
  photoURL: string | null,
  caseId: string,
  score: number,
  durationMs: number,
  attempts: number
): Promise<void> {
  const { db } = getFirebaseClient();

  try {
    const ref = doc(db, "leaderboard", caseId, "entries", uid);
    
    // Check if existing entry exists and compare scores
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const existingData = existing.data() as LeaderboardEntry;
      // Only update if new score is better (higher)
      if (existingData.score >= score) {
        return; // Don't update if existing score is better or equal
      }
    }

    await setDoc(
      ref,
      {
        uid,
        displayName,
        photoURL: photoURL || null,
        score,
        durationMs,
        attempts,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("[leaderboard] Failed to update case leaderboard:", error);
    throw error;
  }
}

/**
 * Get global leaderboard (top N)
 */
export async function getGlobalLeaderboard(limitCount: number = 100): Promise<LeaderboardEntry[]> {
  const { db } = getFirebaseClient();

  try {
    const ref = collection(db, "leaderboard", "global", "entries");
    const q = query(ref, orderBy("score", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((doc) => {
      entries.push({ ...doc.data(), rank: entries.length + 1 } as LeaderboardEntry);
    });

    return entries;
  } catch (error) {
    console.error("[leaderboard] Failed to get global leaderboard:", error);
    throw error;
  }
}

/**
 * Get case-specific leaderboard (top N)
 */
export async function getCaseLeaderboard(
  caseId: string,
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  const { db } = getFirebaseClient();

  try {
    const ref = collection(db, "leaderboard", caseId, "entries");
    const q = query(ref, orderBy("score", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((doc) => {
      entries.push({ ...doc.data(), rank: entries.length + 1 } as LeaderboardEntry);
    });

    return entries;
  } catch (error) {
    console.error("[leaderboard] Failed to get case leaderboard:", error);
    throw error;
  }
}

/**
 * Process case completion: update stats and leaderboards
 * This should be called after a case is successfully completed
 */
export async function processCaseCompletion(
  caseId: string,
  difficulty: "easy" | "medium" | "hard",
  durationMs: number,
  penaltyMs: number,
  attempts: number,
  score: number
): Promise<void> {
  const { auth } = getFirebaseClient();

  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      processWithUser(auth.currentUser, caseId, difficulty, durationMs, penaltyMs, attempts, score)
        .then(resolve)
        .catch(reject);
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        reject(new Error("[leaderboard] Auth state timeout"));
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      unsubscribe();

      if (!user) {
        reject(new Error("[leaderboard] User not authenticated"));
        return;
      }

      try {
        await processWithUser(user, caseId, difficulty, durationMs, penaltyMs, attempts, score);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function processWithUser(
  user: User,
  caseId: string,
  difficulty: "easy" | "medium" | "hard",
  durationMs: number,
  penaltyMs: number,
  attempts: number,
  score: number
): Promise<void> {
  const { updateUserStats } = await import("./userStats.client");
  
  // Update user stats
  await updateUserStats(user.uid, score, durationMs, attempts);

  // Get updated stats for leaderboard
  const stats = await getUserStats(user.uid);
  if (!stats) {
    throw new Error("Failed to get user stats after update");
  }

  // Update global leaderboard
  await updateGlobalLeaderboard(
    user.uid,
    user.displayName || user.email || "Kullanıcı",
    user.photoURL,
    stats.totalScore,
    stats.solvedCases
  );

  // Update case-specific leaderboard
  await updateCaseLeaderboard(
    user.uid,
    user.displayName || user.email || "Kullanıcı",
    user.photoURL,
    caseId,
    score,
    durationMs,
    attempts
  );
}

