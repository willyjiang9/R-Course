// src/components/CourseModal.jsx
import React, { useState, useEffect } from 'react'
import { X, Plus, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import { StarDisplay } from './StarRating.jsx'
import ReviewForm from './ReviewForm.jsx'
import { getReviews, getCourseStats, submitReview } from '../firebase.js'

const WORKLOAD_COLOR = { Light: 'var(--easy)', Medium: 'var(--medium)', Heavy: 'var(--hard)' }
const WORKLOAD_BG    = { Light: 'var(--easy-bg)', Medium: 'var(--medium-bg)', Heavy: 'var(--hard-bg)' }

function StatBox({ label, value, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 80,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 10px',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ucr-blue)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.text && review.text.length > 180
  const shown = expanded || !long ? review.text : review.text.slice(0, 180) + '...'
  const date = review.createdAt?.toDate
    ? review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recent'

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '14px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {review.professor && <span style={{ fontSize: 13, fontWeight: 600 }}>{review.professor}</span>}
          {review.gradeReceived && review.gradeReceived !== '—' && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--ucr-gold-light)', color: '#92580a', borderRadius: 6, padding: '2px 7px' }}>
              Grade: {review.gradeReceived}
            </span>
          )}
          {review.workload && (
            <span style={{ fontSize: 11, fontWeight: 600, background: WORKLOAD_BG[review.workload] || 'var(--bg)', color: WORKLOAD_COLOR[review.workload] || 'var(--text-muted)', borderRadius: 6, padding: '2px 7px' }}>
              {review.workload} workload
            </span>
          )}
          {review.wouldRecommend != null && (
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, color: review.wouldRecommend ? 'var(--easy)' : 'var(--hard)' }}>
              {review.wouldRecommend ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
              {review.wouldRecommend ? 'Recommends' : "Doesn't recommend"}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Difficulty:</span>
          <StarDisplay value={review.difficulty} size={11} color="#dc2626" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Professor:</span>
          <StarDisplay value={review.professorRating} size={11} />
        </div>
      </div>
      {review.text && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{shown}</p>
          {long && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ fontSize: 12, color: 'var(--ucr-blue)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}
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
    } catch (e) { console.error('Firebase error:', e) }
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

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        display: 'flex', alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        <div
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxHeight: '92vh',
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, var(--ucr-blue) 0%, #002a73 100%)',
            color: '#fff',
            flexShrink: 0,
            position: 'relative',
          }}>
            {/* Drag handle */}
            <div style={{
              width: 36, height: 4, background: 'rgba(255,255,255,0.3)',
              borderRadius: 99, margin: '0 auto 14px',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'rgba(241,171,0,0.9)', letterSpacing: '0.05em', marginBottom: 4 }}>{course.fullCode}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.25, wordBreak: 'break-word' }}>{course.title}</h2>
                <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{course.units} units · {course.scheduleType || 'Lecture'}</div>
              </div>
              <button
                onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClose() }}
                onClick={e => { e.stopPropagation(); onClose() }}
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none', borderRadius: 99,
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{
            overflowY: 'auto', flex: 1,
            padding: '20px 20px',
            display: 'flex', flexDirection: 'column', gap: 20,
            WebkitOverflowScrolling: 'touch',
          }}>
            {course.prerequisites && course.prerequisites !== 'None' && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', borderLeft: '3px solid var(--ucr-blue)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Prerequisites: </span>{course.prerequisites}
              </div>
            )}

            {!loading && stats && stats.reviewCount > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  Student Ratings ({stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''})
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <StatBox label="Avg Difficulty" value={<span style={{ color: diffColor }}>{stats.avgDifficulty.toFixed(1)}</span>} sub={diffLabel} />
                  <StatBox label="Prof Rating" value={stats.avgProfRating.toFixed(1)} sub="out of 5.0" />
                  <StatBox label="Would Recommend" value={`${stats.recommendPct}%`} sub={`${stats.reviewCount} students`} />
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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
                      padding: '9px 14px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Plus size={13} /> Write a Review
                  </button>
                )}
              </div>

              {submitted && !showForm && (
                <div style={{ fontSize: 13, color: 'var(--easy)', background: 'var(--easy-bg)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontWeight: 500 }}>
                  ✅ Thanks for your review!
                </div>
              )}

              {showForm && (
                <div style={{ marginBottom: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                  <ReviewForm courseCode={course.fullCode} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: 14 }}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
                  No reviews yet. Be the first! 🎓
                </div>
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
