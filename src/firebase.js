// src/firebase.js
// ─────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
//   1. Go to https://console.firebase.google.com
//   2. Create a new project (e.g. "ucr-courses")
//   3. Add a Web app, copy your firebaseConfig below
//   4. In Firestore Database → Create database (start in test mode)
//   5. Replace the placeholder values below with your real config
// ─────────────────────────────────────────────────────────────────


import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
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
  measurementId: "G-0XLCQRP9Q4"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ── Reviews ───────────────────────────────────────────────────────

/**
 * Submit a review for a course.
 * Also updates the aggregate stats doc for the course.
 */
export async function submitReview(courseCode, review) {
  // 1. Add the review document
  await addDoc(collection(db, 'reviews'), {
    courseCode,
    difficulty:    review.difficulty,    // 1-5
    professorRating: review.professorRating, // 1-5
    workload:      review.workload,      // 'Light' | 'Medium' | 'Heavy'
    wouldRecommend: review.wouldRecommend, // true | false
    gradeReceived: review.gradeReceived, // 'A' | 'B' | 'C' | 'D' | 'F' | 'P' | 'NP' | 'W'
    professor:     review.professor,     // string
    text:          review.text,          // string
    createdAt:     serverTimestamp(),
  })

  // 2. Upsert the aggregate stats doc
  const statsRef = doc(db, 'courseStats', courseCode.replace(/\s+/g, '_'))
  const statsSnap = await getDoc(statsRef)

  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      courseCode,
      reviewCount:       1,
      totalDifficulty:   review.difficulty,
      totalProfRating:   review.professorRating,
      recommendCount:    review.wouldRecommend ? 1 : 0,
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

/**
 * Get all reviews for a course, newest first.
 */
export async function getReviews(courseCode) {
  const q = query(
    collection(db, 'reviews'),
    where('courseCode', '==', courseCode),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get aggregate stats for a course.
 * Returns { avgDifficulty, avgProfRating, recommendPct, reviewCount } or null.
 */
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

/**
 * Fetch stats for a batch of course codes at once.
 * Returns a map: { "CS 010": { avgDifficulty, ... }, ... }
 */
export async function getBatchCourseStats(courseCodes) {
  if (!courseCodes.length) return {}
  const map = {}
  // Firestore 'in' queries allow max 30 items — chunk if needed
  const chunks = []
  for (let i = 0; i < courseCodes.length; i += 30)
    chunks.push(courseCodes.slice(i, i + 30))

  for (const chunk of chunks) {
    const ids = chunk.map(c => c.replace(/\s+/g, '_'))
    // getDocs each individually (stats collection is small)
    await Promise.all(ids.map(async (id, i) => {
      const snap = await getDoc(doc(db, 'courseStats', id))
      if (snap.exists()) {
        const d = snap.data()
        map[chunk[i]] = {
          reviewCount:   d.reviewCount,
          avgDifficulty: d.totalDifficulty / d.reviewCount,
          avgProfRating: d.totalProfRating / d.reviewCount,
          recommendPct:  Math.round((d.recommendCount / d.reviewCount) * 100),
        }
      }
    }))
  }
  return map
}
