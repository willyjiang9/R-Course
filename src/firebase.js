// src/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyB3OJBHFWCo2ET9258ZTcmcPUDpkpih3f8",
  authDomain:        "ucr-cour.firebaseapp.com",
  projectId:         "ucr-cour",
  storageBucket:     "ucr-cour.firebasestorage.app",
  messagingSenderId: "213420603695",
  appId:             "1:213420603695:web:dd773ab75201d1f4c849da",
  measurementId:     "G-0XLCQRP9Q4"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export function trackEvent(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

// ── Reviews ───────────────────────────────────────────────────────

function isPublicReview(review) {
  return review.status !== 'pending' && review.status !== 'rejected'
}

async function applyReviewToStats(courseCode, review) {
  const statsRef = doc(db, 'courseStats', courseCode.replace(/\s+/g, '_'))
  const statsSnap = await getDoc(statsRef)

  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      courseCode,
      reviewCount:     1,
      totalDifficulty: review.difficulty,
      totalProfRating: review.professorRating,
      recommendCount:  review.wouldRecommend ? 1 : 0,
    })
  } else {
    await updateDoc(statsRef, {
      reviewCount:     increment(1),
      totalDifficulty: increment(review.difficulty),
      totalProfRating: increment(review.professorRating),
      recommendCount:  increment(review.wouldRecommend ? 1 : 0),
    })
  }
}

export async function submitReview(courseCode, review) {
  await addDoc(collection(db, 'reviews'), {
    courseCode,
    difficulty:      review.difficulty,
    professorRating: review.professorRating,
    workload:        review.workload,
    wouldRecommend:  review.wouldRecommend,
    gradeReceived:   review.gradeReceived,
    termTaken:       review.termTaken || '',
    professor:       review.professor,
    text:            review.text,
    source:          'web',
    status:          'pending',
    createdAt:       serverTimestamp(),
  })

  trackEvent('submit_review', { course_code: courseCode })
}

export async function getReviews(courseCode) {
  const q = query(
    collection(db, 'reviews'),
    where('courseCode', '==', courseCode),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(isPublicReview)
}

export async function getPendingReviews() {
  const q = query(
    collection(db, 'reviews'),
    where('status', '==', 'pending')
  )
  const snap = await getDocs(q)
  const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  reviews.sort((a, b) => {
    const at = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
    const bt = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
    return bt - at
  })
  return reviews
}

export async function approveReview(review) {
  await updateDoc(doc(db, 'reviews', review.id), {
    status: 'approved',
    approvedAt: serverTimestamp(),
  })
  await applyReviewToStats(review.courseCode, review)
}

export async function rejectReview(reviewId) {
  await updateDoc(doc(db, 'reviews', reviewId), {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  })
}

export async function getCourseStats(courseCode) {
  const ref  = doc(db, 'courseStats', courseCode.replace(/\s+/g, '_'))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    reviewCount:   d.reviewCount,
    avgDifficulty: d.totalDifficulty / d.reviewCount,
    avgProfRating: d.totalProfRating / d.reviewCount,
    recommendPct:  Math.round((d.recommendCount / d.reviewCount) * 100),
  }
}

// Not used for main page anymore — kept for compatibility
export async function getBatchCourseStats(courseCodes) {
  return {}
}