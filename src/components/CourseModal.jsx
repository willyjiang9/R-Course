// src/components/CourseModal.jsx
import React, { useState, useEffect } from 'react'
import { X, Plus, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import { StarDisplay } from './StarRating.jsx'
import ReviewForm from './ReviewForm.jsx'
import { getReviews, getCourseStats, submitReview } from '../firebase.js'

const WORKLOAD_COLOR = { Light: 'var(--easy)', Medium: 'var(--medium)', Heavy: 'var(--hard)' }
const WORKLOAD_BG    = { Light: 'var(--easy-bg)', Medium: 'var(--medium-bg)', Heavy: 'var(--hard-bg)' }

function parseDate(review) {
  // Firestore timestamp
  if (review.createdAt?.toDate) {
    return review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  // String date from imported spreadsheet (e.g. "2023-10-06 00:00:00" or "10/6/2023")
  const raw = review.createdAt || review.date || ''
  if (raw && typeof raw === 'string' && raw.trim() !== '') {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }
  return 'Recent'
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 8px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--ucr-blue)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.text && review.text.length > 180
  const shown = expanded || !long ? review.text : review.text.slice(0, 180) + '...'
  const date = parseDate(review)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {review.professor && <span style={{ fontSize: 12, fontWeight: 600 }}>{review.professor}</span>}
          {review.gradeReceived && review.gradeReceived !== '—' && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--ucr-gold-light)', color: '#92580a', borderRadius: 6, padding: '2px 6px' }}>Grade: {review.gradeReceived}</span>
          )}
          {review.workload && (
            <span style={{ fontSize: 11, fontWeight: 600, background: WORKLOAD_BG[review.workload] || 'var(--bg)', color: WORKLOAD_COLOR[review.workload] || 'var(--text-muted)', borderRadius: 6, padding: '2px 6px' }}>{review.workload}</span>
          )}
          {review.wouldRecommend != null && (
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, color: review.wouldRecommend ? 'var(--easy)' : 'var(--hard)' }}>
              {review.wouldRecommend ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
              {review.wouldRecommend ? 'Recommends' : "Doesn't recommend"}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Difficulty:</span>
          <StarDisplay value={review.difficulty} size={11} color="#dc2626" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prof:</span>
          <StarDisplay value={review.professorRating} size={11} />
        </div>
      </div>
      {review.text && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{shown}</p>
          {long && (
            <button
              onTouchEnd={e => { e.stopPropagation(); setExpanded(v => !v) }}
              onClick={() => setExpanded(v => !v)}
              style={{ fontSize: 12, color: 'var(--ucr-blue)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3, touchAction: 'manipulation' }}
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CourseModal({ course, onClose, onNewStats }) {
  const [stats, setStats]         = useState(null)
  const [reviews, setReviews]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    load()
    return () => { document.body.style.overflow = '' }
  }, [course.fullCode])

  async function load() {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([getCourseStats(course.fullCode), getReviews(course.fullCode)])
      setStats(s)
      setReviews(r)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleSubmit(form) {
    await submitReview(course.fullCode, form)
    setShowForm(false)
    setSubmitted(true)
    await load()
    if (onNewStats) {
      const fresh = await getCourseStats(course.fullCode)
      if (fresh) onNewStats(course.fullCode, fresh)
    }
  }

  const diffLabel = stats ? (stats.avgDifficulty <= 2 ? 'Easy' : stats.avgDifficulty <= 3.5 ? 'Moderate' : 'Hard') : null
  const diffColor = stats ? (stats.avgDifficulty <= 2 ? 'var(--easy)' : stats.avgDifficulty <= 3.5 ? 'var(--medium)' : 'var(--hard)') : null

  return (
    <>
      {/* Backdrop */}
      <div
        onTouchStart={e => { e.stopPropagation(); e.preventDefault() }}
        onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClose() }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,17,23,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          touchAction: 'none',
        }}
      />

      {/* X button — always fixed to screen */}
      <button
        onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClose() }}
        onClick={e => { e.stopPropagation(); onClose() }}
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 203,
          background: 'var(--ucr-blue)',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: 99, width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <X size={20} />
      </button>

      {/* Modal */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}>
        <style>{`
          @media (min-width: 769px) {
            .modal-sheet {
              position: absolute !important;
              top: 50% !important; left: 50% !important; bottom: auto !important;
              transform: translate(-50%, -50%) !important;
              width: min(680px, calc(100vw - 32px)) !important;
              max-height: calc(100vh - 48px) !important;
              border-radius: 20px !important;
            }
          }
        `}</style>
        <div
          className="modal-sheet"
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto', width: '100%', maxHeight: '94vh',
            background: 'var(--surface)', borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, var(--ucr-blue) 0%, #002a73 100%)', color: '#fff' }}>
            <div style={{ paddingTop: 10, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }} />
            </div>
            <div style={{ padding: '12px 60px 16px 16px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(241,171,0,0.9)', letterSpacing: '0.06em', marginBottom: 4 }}>
                {course.fullCode}
              </div>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, lineHeight: 1.3, wordBreak: 'break-word', letterSpacing: '-0.01em' }}>
                {course.title}
              </h2>
              <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>
                {course.units} units · {course.scheduleType || 'Lecture'}
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, WebkitOverflowScrolling: 'touch' }}>
            {course.prerequisites && course.prerequisites !== 'None' && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', borderLeft: '3px solid var(--ucr-blue)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Prerequisites: </span>{course.prerequisites}
              </div>
            )}

            {!loading && stats && stats.reviewCount > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Student Ratings ({stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''})
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <StatBox label="Avg Difficulty" value={<span style={{ color: diffColor }}>{stats.avgDifficulty.toFixed(1)}</span>} sub={diffLabel} />
                  <StatBox label="Prof Rating" value={stats.avgProfRating.toFixed(1)} sub="out of 5.0" />
                  <StatBox label="Recommend" value={`${stats.recommendPct}%`} sub={`${stats.reviewCount} votes`} />
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </div>
                {!showForm && (
                  <button
                    onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); setShowForm(true) }}
                    onClick={() => setShowForm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'var(--ucr-blue)', color: '#fff',
                      border: 'none', borderRadius: 99,
                      padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Plus size={13} /> Write a Review
                  </button>
                )}
              </div>

              {submitted && !showForm && (
                <div style={{ fontSize: 13, color: 'var(--easy)', background: 'var(--easy-bg)', borderRadius: 8, padding: '10px 12px', marginBottom: 10, fontWeight: 500 }}>
                  ✅ Thanks for your review!
                </div>
              )}

              {showForm && (
                <div style={{ marginBottom: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                  <ReviewForm courseCode={course.fullCode} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: 14 }}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>No reviews yet. Be the first! 🎓</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reviews.map(r => <ReviewItem key={r.id} review={r} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
