/**
 * NoirNote — Clear Results Utility
 *
 * Client-side utility for clearing case results from Firestore.
 * Note: This only clears results for the currently authenticated user
 * (based on Firestore security rules).
 */

import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase.client";

/**
 * Clear all case results for the current user
 * WARNING: This will permanently delete all case result history for the current user!
 */
export async function clearMyResults(): Promise<{ deletedCount: number; error?: string }> {
  const { auth, db } = getFirebaseClient();

  if (!auth.currentUser) {
    return { deletedCount: 0, error: "User not authenticated" };
  }

  try {
    console.log("[clearResults] Starting to clear results for user:", auth.currentUser.uid);

    // Get all results for current user
    const resultsRef = collection(db, "results");
    const q = query(resultsRef, where("uid", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("[clearResults] No results found. History is already empty.");
      return { deletedCount: 0 };
    }

    console.log(`[clearResults] Found ${snapshot.size} result documents to delete.`);

    // Delete all documents (can be done sequentially, Firestore handles it)
    let deletedCount = 0;
    const deletePromises = snapshot.docs.map(async (docSnap) => {
      await deleteDoc(doc(db, "results", docSnap.id));
      deletedCount++;
    });

    await Promise.all(deletePromises);

    console.log(`[clearResults] ✓ Successfully deleted all ${deletedCount} case result documents.`);
    return { deletedCount };
  } catch (error: any) {
    console.error("[clearResults] Error clearing results:", error);
    return { 
      deletedCount: 0, 
      error: error?.message || "Unknown error occurred" 
    };
  }
}

