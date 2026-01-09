/**
 * Clear current user's case results from Firestore
 * 
 * This script can be run in the browser console on the profile page
 * It will delete all results for the currently logged-in user
 * 
 * WARNING: This will permanently delete all case result history for the current user!
 */

// Copy and paste this into the browser console on the profile page

(async function clearMyResults() {
  try {
    // Import Firebase client (assuming it's available globally or via module)
    const { getFirebaseClient } = await import('/src/lib/firebase.client.ts');
    const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    
    const { auth, db } = getFirebaseClient();
    
    if (!auth.currentUser) {
      console.error('You must be logged in to clear results');
      return;
    }
    
    console.log('Starting to clear your case results...');
    console.log('User:', auth.currentUser.uid);
    
    // Get all results for current user
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, where('uid', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No results found. Your history is already empty.');
      return;
    }
    
    console.log(`Found ${snapshot.size} result documents to delete.`);
    
    // Delete all documents
    let deletedCount = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'results', docSnap.id));
      deletedCount++;
      console.log(`Deleted ${deletedCount}/${snapshot.size} documents...`);
    }
    
    console.log(`✓ Successfully deleted all ${deletedCount} case result documents.`);
    console.log('Please refresh the page to see the changes.');
  } catch (error) {
    console.error('Error clearing results:', error);
  }
})();

