/**
 * NoirNote — User Stats Firestore Utilities
 *
 * Manages user statistics: users/{uid}/stats
 */

import { doc, getDoc, getDocFromCache, setDoc, serverTimestamp, waitForPendingWrites } from "firebase/firestore";
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
 * Get user stats (offline-friendly)
 */
export async function getUserStats(uid: string): Promise<UserStats | null> {
  const { db } = getFirebaseClient();

  try {
    const ref = doc(db, "users", uid, "stats", "main");
    
    // Strategy: Try cache first (offline-friendly), fallback to network
    let snap;
    try {
      // Try cache first (instant if available, works offline)
      snap = await getDocFromCache(ref);
      if (snap.exists()) {
        return snap.data() as UserStats;
      }
    } catch (cacheError: any) {
      // Cache miss or offline, try network if online
      // If error is "client is offline", skip network attempt
      if (cacheError?.code === "unavailable" || cacheError?.message?.includes("offline")) {
        console.warn("[userStats] Offline mode: cache miss for stats");
        return null;
      }
      // Try network (if online)
      snap = await getDoc(ref);
      // With persistence enabled, getDoc automatically uses cache if available
      if (snap.exists()) {
        return snap.data() as UserStats;
      }
    }
    
    return null;
  } catch (error: any) {
    // Offline errors are expected and should return null gracefully
    if (error?.code === "unavailable" || error?.message?.includes("offline")) {
      console.warn("[userStats] Offline mode: cannot load stats from network");
      return null;
    }
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
    
    // Strategy: Try cache first (offline-friendly), fallback to network
    let current;
    try {
      // Try cache first (instant if available, works offline)
      current = await getDocFromCache(ref);
    } catch (cacheError: any) {
      // Cache miss or offline, try network if online
      // If error is "client is offline", skip network attempt and use default stats
      if (cacheError?.code === "unavailable" || cacheError?.message?.includes("offline")) {
        console.warn("[userStats] Offline mode: cache miss, will create new stats entry");
        current = null as any; // Will be treated as non-existent
      } else {
        // Try network (if online)
        current = await getDoc(ref);
      }
    }

    let stats: Omit<UserStats, "lastUpdated">;

    if (current?.exists()) {
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
      // First case completion or offline with no cache
      stats = {
        uid,
        totalScore: caseScore,
        solvedCases: 1,
        averageTimeMs: durationMs,
        totalAttempts: attempts,
      };
    }

    // With Firestore persistence enabled, setDoc will queue writes offline
    // and automatically sync when network is available
    await setDoc(
      ref,
      {
        ...stats,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    
    // Try to wait for write to complete (works online)
    // Offline writes are automatically queued by Firestore SDK
    try {
      await waitForPendingWrites(db);
    } catch (waitError: any) {
      // If offline, waitForPendingWrites may timeout - that's OK, write is queued
      if (waitError?.code === "unavailable" || waitError?.message?.includes("offline")) {
        console.log("[userStats] Write queued offline, will sync when online");
      } else {
        // Other error, log but don't fail the operation
        console.warn("[userStats] Failed to wait for pending writes:", waitError);
      }
    }
  } catch (error: any) {
    // Offline errors are expected and handled by Firestore persistence
    if (error?.code === "unavailable" || error?.message?.includes("offline")) {
      console.log("[userStats] Stats update queued offline, will sync when online");
      // Don't throw - Firestore persistence will handle the sync
      return;
    }
    console.error("[userStats] Failed to update user stats:", error);
    throw error;
  }
}

