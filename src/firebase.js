// src/firebase.js
import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
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

// ── App Check (optional) ──────────────────────────────────────────
// 1. Firebase Console → App Check → register web app with reCAPTCHA v3
// 2. Paste the site key between the quotes below
const RECAPTCHA_SITE_KEY = ''
if (RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

export const db = getFirestore(app)

export function trackEvent(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

// ── Basic spam guard (per browser) ────────────────────────────────
const COOLDOWN_MS = 30 * 1000

function readLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch (e) {
    return fallback
  }
}

function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) {}
}

function checkSpamGuard(courseCode) {
  const last = Number(readLocal('rc_last_review', 0))
  if (Date.now() - last < COOLDOWN_MS) {
    throw new Error('Please wait a few seconds before posting another review.')
  }
  const done = readLocal('rc_reviewed', [])
  if (done.includes(courseCode)) {
    throw new Error('You already reviewed this course on this device.')
  }
}

function markReviewed(courseCode) {
  writeLocal('rc_last_review', Date.now())
  const done = readLocal('rc_reviewed', [])
  writeLocal('rc_reviewed', [...done, courseCode])
}

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

// ── Reviews ───────────────────────────────────────────────────────
export async function submitReview(courseCode, review) {
  checkSpamGuard(courseCode)

  await addDoc(collection(db, 'reviews'), {
    courseCode,
    difficulty:      review.difficulty,
    professorRating: review.professorRating,
    workload:        review.workload,
    wouldRecommend:  review.wouldRecommend,
    gradeReceived:   review.gradeReceived || '',
    termTaken:       review.termTaken || '',
    professor:       review.professor || '',
    text:            review.text,
    createdAt:       serverTimestamp(),
  })

  await applyReviewToStats(courseCode, review)
  markReviewed(courseCode)
  trackEvent('submit_review', { course_code: courseCode })
}

export async function getReviews(courseCode) {
  const q = query(
    collection(db, 'reviews'),
    where('courseCode', '==', courseCode),
    orderBy('createdAt', 'desc'),
    limit(100)
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

// Kept for compatibility — main page uses bundled stats now
export async function getBatchCourseStats(courseCodes) {
  return {}
}
