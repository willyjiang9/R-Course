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
      flex: 1, minWidth: 100,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--ucr-blue)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {review.professor && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{review.professor}</span>}
          {review.gradeReceived && review.gradeReceived !== '—' && (
            <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ucr-gold-light)', color: '#92580a', borderRadius: 6, padding: '2px 8px' }}>Grade: {review.gradeReceived}</span>
          )}
          {review.workload && (
            <span style={{ fontSize: 12, fontWeight: 600, background: WORKLOAD_BG[review.workload] || 'var(--bg)', color: WORKLOAD_COLOR[review.workload] || 'var(--text-muted)', borderRadius: 6, padding: '2px 8px' }}>{review.workload} workload</span>
          )}
          {review.wouldRecommend != null && (
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: review.wouldRecommend ? 'var(--easy)' : 'var(--hard)' }}>
              {review.wouldRecommend ? <ThumbsUp size={13} /> : <ThumbsDown size={13} />}
              {review.wouldRecommend ? 'Recommends' : "Doesn't recommend"}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{date}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Difficulty:</span>
          <StarDisplay value={review.difficulty} size={12} color="#dc2626" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Professor:</span>
          <StarDisplay value={review.professorRating} size={12} />
        </div>
      </div>
      {review.text && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{shown}</p>
          {long && (
            <button onClick={() => setExpanded(e => !e)} style={{ fontSize: 13, color: 'var(--ucr-blue)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CourseModal({ course, onClose }) {
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
  }

  const diffLabel = stats ? (stats.avgDifficulty <= 2 ? 'Easy' : stats.avgDifficulty <= 3.5 ? 'Moderate' : 'Hard') : null
  const diffColor = stats ? (stats.avgDifficulty <= 2 ? 'var(--easy)' : stats.avgDifficulty <= 3.5 ? 'var(--medium)' : 'var(--hard)') : null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,17,23,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal — centered with margin auto */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 201,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: 680,
          maxHeight: 'calc(100vh - 32px)',
          background: 'var(--surface)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, var(--ucr-blue) 0%, #002a73 100%)',
            color: '#fff',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'rgba(241,171,0,0.9)', letterSpacing: '0.05em', marginBottom: 6 }}>{course.fullCode}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.25 }}>{course.title}</h2>
                <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{course.units} units · {course.scheduleType || 'Lecture'}</div>
              </div>
              <button onClick={onClose} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: 6, color: '#fff', cursor: 'pointer', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {course.description && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>About This Course</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description}</p>
              </div>
            )}

            {course.prerequisites && course.prerequisites !== 'None' && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', borderLeft: '3px solid var(--ucr-blue)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Prerequisites: </span>{course.prerequisites}
              </div>
            )}

            {!loading && stats && stats.reviewCount > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                  Student Ratings ({stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''})
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <StatBox label="Avg Difficulty" value={<span style={{ color: diffColor }}>{stats.avgDifficulty.toFixed(1)}</span>} sub={diffLabel} />
                  <StatBox label="Prof Rating" value={stats.avgProfRating.toFixed(1)} sub="out of 5.0" />
                  <StatBox label="Would Recommend" value={`${stats.recommendPct}%`} sub={`${stats.reviewCount} students`} />
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </div>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ucr-blue)', color: '#fff', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={13} /> Write a Review
                  </button>
                )}
              </div>

              {submitted && !showForm && (
                <div style={{ fontSize: 13, color: 'var(--easy)', background: 'var(--easy-bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontWeight: 500 }}>
                  ✅ Thanks for your review! It's now live.
                </div>
              )}

              {showForm && (
                <div style={{ marginBottom: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px' }}>
                  <ReviewForm courseCode={course.fullCode} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px 0', fontSize: 14 }}>
                  No reviews yet. Be the first to help future students! 🎓
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
