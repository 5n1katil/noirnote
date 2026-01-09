/**
 * NoirNote — Active Case Firestore Utilities
 *
 * Manages active case state in Firestore: users/{uid}/activeCase/{caseId}
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase.client";
import type { GridState } from "@/types/grid";

/**
 * Firestore document type (with serialized gridState)
 */
export type ActiveCaseDoc = {
  caseId: string;
  status: "playing" | "finished";
  startedAt: number; // Timestamp (milliseconds)
  attempts: number;
  penaltyMs: number; // Total penalty time in milliseconds
  gridStateSerialized: string; // JSON string of GridState (Firestore doesn't support nested arrays)
  updatedAt: unknown; // serverTimestamp placeholder
};

/**
 * Application type (with deserialized gridState)
 */
export type ActiveCase = {
  caseId: string;
  status: "playing" | "finished";
  startedAt: number; // Timestamp (milliseconds)
  attempts: number;
  penaltyMs: number; // Total penalty time in milliseconds
  gridState: GridState;
  updatedAt: unknown; // serverTimestamp placeholder
};

/**
 * Serialize GridState to JSON string for Firestore
 */
function serializeGridState(gridState: GridState): string {
  return JSON.stringify(gridState);
}

/**
 * Deserialize JSON string to GridState from Firestore
 */
function deserializeGridState(serialized: string): GridState {
  try {
    return JSON.parse(serialized) as GridState;
  } catch (error) {
    console.error("[activeCase] Failed to deserialize gridState:", error);
    // Return default empty grid state on error
    return {
      SL: Array(3).fill(null).map(() => Array(3).fill("empty")),
      SW: Array(3).fill(null).map(() => Array(3).fill("empty")),
      LW: Array(3).fill(null).map(() => Array(3).fill("empty")),
    } as GridState;
  }
}

/**
 * Get active case for current user
 */
export async function getActiveCase(caseId: string): Promise<ActiveCase | null> {
  const { auth, db } = getFirebaseClient();

  // Check if user is already authenticated (faster path)
  if (auth.currentUser) {
      try {
        const ref = doc(db, "users", auth.currentUser.uid, "activeCase", caseId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as ActiveCaseDoc;
          // Convert Firestore document to application type (deserialize gridState)
          return {
            ...data,
            gridState: deserializeGridState(data.gridStateSerialized),
          };
        }
        return null;
      } catch (error) {
        console.error("[activeCase] Failed to get active case:", error);
        throw error;
      }
  }

  // Wait for auth state if not ready yet
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        reject(new Error("[activeCase] Auth state timeout"));
      }
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      unsubscribe();

      if (!user) {
        resolve(null);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "activeCase", caseId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as ActiveCaseDoc;
          // Convert Firestore document to application type (deserialize gridState)
          resolve({
            ...data,
            gridState: deserializeGridState(data.gridStateSerialized),
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("[activeCase] Failed to get active case:", error);
        reject(error);
      }
    });
  });
}

/**
 * Initialize or update active case
 */
export async function saveActiveCase(activeCase: Omit<ActiveCase, "updatedAt">): Promise<void> {
  const { auth, db } = getFirebaseClient();

  // Check if user is already authenticated (faster path)
  if (auth.currentUser) {
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "activeCase", activeCase.caseId);
      // Convert application type to Firestore document (serialize gridState)
      const docData: Omit<ActiveCaseDoc, "updatedAt"> = {
        caseId: activeCase.caseId,
        status: activeCase.status,
        startedAt: activeCase.startedAt,
        attempts: activeCase.attempts,
        penaltyMs: activeCase.penaltyMs,
        gridStateSerialized: serializeGridState(activeCase.gridState),
      };
      await setDoc(
        ref,
        {
          ...docData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return;
    } catch (error) {
      console.error("[activeCase] Failed to save active case:", error);
      throw error;
    }
  }

  // Wait for auth state if not ready yet
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        reject(new Error("[activeCase] Auth state timeout"));
      }
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      unsubscribe();

      if (!user) {
        reject(new Error("[activeCase] User not authenticated"));
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "activeCase", activeCase.caseId);
        // Convert application type to Firestore document (serialize gridState)
        const docData: Omit<ActiveCaseDoc, "updatedAt"> = {
          caseId: activeCase.caseId,
          status: activeCase.status,
          startedAt: activeCase.startedAt,
          attempts: activeCase.attempts,
          penaltyMs: activeCase.penaltyMs,
          gridStateSerialized: serializeGridState(activeCase.gridState),
        };
        await setDoc(
          ref,
          {
            ...docData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        resolve();
      } catch (error) {
        console.error("[activeCase] Failed to save active case:", error);
        reject(error);
      }
    });
  });
}

/**
 * Initialize new active case
 */
export async function initializeActiveCase(
  caseId: string,
  initialGridState: GridState
): Promise<ActiveCase> {
  const newActiveCase: Omit<ActiveCase, "updatedAt"> = {
    caseId,
    status: "playing",
    startedAt: Date.now(),
    attempts: 0,
    penaltyMs: 0,
    gridState: initialGridState,
  };

  await saveActiveCase(newActiveCase);
  return newActiveCase as ActiveCase;
}

