import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface ReviewSubmission {
  rideId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'rider' | 'driver';
  targetUserId: string;
  targetUserName: string;
  rating: number;
  tags: string[];
  comment: string;
  isSafetyReport: boolean;
  safetyCategory?: string;
  safetyDetails?: string;
  pickupAddress?: string;
  destinationAddress?: string;
}

export async function submitPostRideReview(reviewData: ReviewSubmission) {
  try {
    // 1. Add to reviews collection
    const reviewDocRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      safetyStatus: reviewData.isSafetyReport ? 'open' : null,
      createdAt: serverTimestamp(),
    });

    // 2. Update ride document with review fields
    const rideRef = doc(db, 'rides', reviewData.rideId);
    if (reviewData.reviewerRole === 'rider') {
      await updateDoc(rideRef, {
        riderRating: reviewData.rating,
        riderReview: reviewData.comment,
        riderTags: reviewData.tags,
        riderReportedSafety: reviewData.isSafetyReport,
        riderReviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(rideRef, {
        driverRating: reviewData.rating,
        driverReview: reviewData.comment,
        driverTags: reviewData.tags,
        driverReportedSafety: reviewData.isSafetyReport,
        driverReviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Update target user aggregate rating and safety score
    if (reviewData.targetUserId) {
      try {
        const userRef = doc(db, 'users', reviewData.targetUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentRating = typeof userData.rating === 'number' ? userData.rating : 5;
          const currentTotal = typeof userData.totalRatings === 'number' ? userData.totalRatings : 1;
          const newTotal = currentTotal + 1;
          const newRating = Number(((currentRating * currentTotal + reviewData.rating) / newTotal).toFixed(1));
          const currentSafetyCount = typeof userData.safetyReportsCount === 'number' ? userData.safetyReportsCount : 0;
          const newSafetyCount = reviewData.isSafetyReport ? currentSafetyCount + 1 : currentSafetyCount;

          await updateDoc(userRef, {
            rating: newRating,
            totalRatings: newTotal,
            safetyReportsCount: newSafetyCount,
            updatedAt: serverTimestamp(),
          });

          // If target is driver, also update drivers collection
          if (reviewData.reviewerRole === 'rider') {
            const driverRef = doc(db, 'drivers', reviewData.targetUserId);
            const driverSnap = await getDoc(driverRef);
            if (driverSnap.exists()) {
              await updateDoc(driverRef, {
                rating: newRating,
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not update target user profile aggregate rating:", err);
      }
    }

    return { success: true, id: reviewDocRef.id };
  } catch (error) {
    console.error("Error submitting review to Firestore:", error);
    // Return gracefully so user UI is not blocked
    return { success: false, error };
  }
}
