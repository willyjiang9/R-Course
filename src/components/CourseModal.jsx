import React, { useState, useEffect } from 'react'
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { StarDisplay } from './StarRating.jsx'
import ReviewForm from './ReviewForm.jsx'
import { getReviews, getCourseStats, submitReview } from '../firebase.js'
import { displayTitle } from '../lib/format.js'

function parseDate(review) {
  if (review.createdAt?.toDate) {
    return review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const raw = review.createdAt || review.date || ''
  if (raw && typeof raw === 'string' && raw.trim() !== '') {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }
  return 'Recent'
}

function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.text && review.text.length > 180
  const shown = expanded || !long ? review.text : `${review.text.slice(0, 180)}…`
  const date = parseDate(review)

  return (
    <article className="review">
      <div className="review-top">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {review.professor ? <strong style={{ fontSize: 13 }}>{review.professor}</strong> : null}
          {review.gradeReceived && review.gradeReceived !== '—' ? (
            <span className="chip">Grade {review.gradeReceived}</span>
          ) : null}
          {review.workload ? <span className="muted">{review.workload} workload</span> : null}
          {review.wouldRecommend != null ? (
            <span className={review.wouldRecommend ? 'reco easy' : 'reco hard'} style={{ fontSize: 12 }}>
              {review.wouldRecommend ? 'Recommends' : 'Does not recommend'}
            </span>
          ) : null}
        </div>
        <span className="muted">{date}</span>
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <span className="muted">Difficulty</span>
          <StarDisplay value={review.difficulty} size={11} color="#9b3a32" />
        </div>
        <div>
          <span className="muted">Professor</span>
          <StarDisplay value={review.professorRating} size={11} />
        </div>
      </div>
      {review.text ? (
        <div>
          <p className="review-text">{shown}</p>
          {long ? (
            <button type="button" className="linkish" onClick={() => setExpanded(v => !v)}>
              {expanded ? <><ChevronUp size={12} aria-hidden="true" /> Show less</> : <><ChevronDown size={12} aria-hidden="true" /> Read more</>}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default function CourseModal({ course, onClose }) {
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    load()
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [course.fullCode])

  async function load() {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([getCourseStats(course.fullCode), getReviews(course.fullCode)])
      setStats(s)
      setReviews(r)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function handleSubmit(form) {
    await submitReview(course.fullCode, form)
    setShowForm(false)
    setSubmitted(true)
  }

  const diffTone = stats
    ? (stats.avgDifficulty <= 2 ? 'var(--easy)' : stats.avgDifficulty <= 3.5 ? 'var(--medium)' : 'var(--hard)')
    : null
  const diffLabel = stats
    ? (stats.avgDifficulty <= 2 ? 'Low' : stats.avgDifficulty <= 3.5 ? 'Moderate' : 'High')
    : null

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="dialog-wrap">
        <div
          className="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-dialog-title"
          onClick={e => e.stopPropagation()}
        >
          <div className="dialog-head">
            <button type="button" className="dialog-close" aria-label="Close course" onClick={onClose}>
              <X size={16} aria-hidden="true" />
            </button>
            <div className="dialog-code">{course.fullCode}</div>
            <h2 id="course-dialog-title" className="dialog-title">{displayTitle(course.title)}</h2>
            <div className="dialog-meta">
              {course.units ? `${course.units} units` : ''}
              {course.scheduleType ? ` · ${course.scheduleType}` : ''}
            </div>
          </div>

          <div className="dialog-body">
            {course.prerequisites && course.prerequisites !== 'None' ? (
              <div className="prereq" style={{ WebkitLineClamp: 8 }}>
                <span>Prerequisites: </span>{course.prerequisites}
              </div>
            ) : null}

            {!loading && stats && stats.reviewCount > 0 ? (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>
                  Student ratings ({stats.reviewCount})
                </div>
                <div className="stat-row">
                  <div className="stat-box">
                    <b style={{ color: diffTone }}>{stats.avgDifficulty.toFixed(1)}</b>
                    <span>Difficulty · {diffLabel}</span>
                  </div>
                  <div className="stat-box">
                    <b>{stats.avgProfRating.toFixed(1)}</b>
                    <span>Professor</span>
                  </div>
                  <div className="stat-box">
                    <b>{stats.recommendPct}%</b>
                    <span>Recommend</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <div className="reviews-head">
                <div className="section-label">
                  Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
                </div>
                {!showForm ? (
                  <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={14} aria-hidden="true" /> Write a review
                  </button>
                ) : null}
              </div>

              {submitted && !showForm ? (
                <div className="notice" role="status" style={{ marginBottom: 12 }}>
                  Your review was submitted. It will appear after it is checked.
                </div>
              ) : null}

              {showForm ? (
                <div style={{ marginBottom: 16, padding: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                  <ReviewForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
                </div>
              ) : null}

              {loading ? (
                <div className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                  No reviews on this course yet.
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
