/**
 * NoirNote — Case Result Storage
 *
 * Client-side utility for saving case completion results to Firestore.
 */

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase.client";

export type CaseResult = {
  userId: string;
  caseId: string;
  durationSeconds: number;
  attempts: number;
  completedAt: number; // Timestamp
  isCorrect: boolean;
  createdAt: unknown; // serverTimestamp placeholder
};

/**
 * Save case result to Firestore
 * Document ID format: {userId}_{caseId}
 */
export async function saveCaseResult(
  caseId: string,
  durationSeconds: number,
  attempts: number,
  isCorrect: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { auth, db } = getFirebaseClient();

    // Wait for auth state to ensure we have a user
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      unsubscribe(); // Clean up listener

      if (!user) {
        reject(new Error("[caseResult] User not authenticated"));
        return;
      }

      try {
        const docId = `${user.uid}_${caseId}`;
        const ref = doc(db, "results", docId);

        const data: CaseResult = {
          userId: user.uid,
          caseId,
          durationSeconds,
          attempts,
          completedAt: Date.now(),
          isCorrect,
          createdAt: serverTimestamp(),
        };

        await setDoc(ref, data, { merge: true });
        resolve();
      } catch (error) {
        console.error("[caseResult] Failed to save result:", error);
        reject(error);
      }
    });
  });
}

