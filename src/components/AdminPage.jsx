// src/components/AdminPage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, LogOut, Shield, RefreshCw } from 'lucide-react'
import { StarDisplay } from './StarRating.jsx'
import { getPendingReviews, approveReview, rejectReview } from '../firebase.js'

const ADMIN_PASSWORD_SHA256 = 'c9f10efefc63f53705b63fd5d2e4829d236bfced4392fb1a76b50a464748be03'
const SESSION_KEY = 'rcourses_admin_ok'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function parseDate(review) {
  if (review.createdAt?.toDate) {
    return review.createdAt.toDate().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }
  return 'Just now'
}

function ReviewCard({ review, busy, onApprove, onReject }) {
  return (
    <article className="review">
      <div className="review-top">
        <div>
          <div className="course-code">{review.courseCode}</div>
          <div className="muted" style={{ marginTop: 4 }}>
            {parseDate(review)}
            {review.termTaken ? ` · ${review.termTaken}` : ''}
            {review.professor ? ` · ${review.professor}` : ''}
            {review.gradeReceived ? ` · Grade ${review.gradeReceived}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {review.workload ? <span className="muted">{review.workload} workload</span> : null}
          {review.wouldRecommend != null ? (
            <span className={review.wouldRecommend ? 'reco easy' : 'reco hard'}>
              {review.wouldRecommend ? 'Recommends' : 'Does not recommend'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="muted">Difficulty</div>
          <StarDisplay value={review.difficulty} size={14} color="#9b3a32" />
        </div>
        <div>
          <div className="muted">Professor</div>
          <StarDisplay value={review.professorRating} size={14} />
        </div>
      </div>
      {review.text ? <p className="review-text" style={{ whiteSpace: 'pre-wrap' }}>{review.text}</p> : null}
      <div className="form-actions">
        <button type="button" className="btn-primary" style={{ flex: 1, background: busy ? 'var(--line)' : 'var(--easy)' }} disabled={busy} onClick={() => onApprove(review)}>
          <Check size={16} aria-hidden="true" /> Approve
        </button>
        <button type="button" className="btn-ghost" style={{ flex: 1, color: 'var(--hard)' }} disabled={busy} onClick={() => onReject(review)}>
          <X size={16} aria-hidden="true" /> Reject
        </button>
      </div>
    </article>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReviews(await getPendingReviews())
    } catch (e) {
      console.error(e)
      setError('Could not load pending reviews. Check Firestore rules / connection.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed, load])

  async function handleUnlock(e) {
    e.preventDefault()
    setError('')
    const hash = await sha256(password.trim())
    if (hash !== ADMIN_PASSWORD_SHA256) {
      setError('Wrong password.')
      return
    }
    sessionStorage.setItem(SESSION_KEY, '1')
    setAuthed(true)
    setPassword('')
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setReviews([])
  }

  async function handleApprove(review) {
    setBusyId(review.id)
    try {
      await approveReview(review)
      setReviews(list => list.filter(r => r.id !== review.id))
      setNotice(`Approved ${review.courseCode}`)
    } catch (e) {
      console.error(e)
      setError('Approve failed. Try again.')
    }
    setBusyId(null)
  }

  async function handleReject(review) {
    setBusyId(review.id)
    try {
      await rejectReview(review.id)
      setReviews(list => list.filter(r => r.id !== review.id))
      setNotice(`Rejected ${review.courseCode}`)
    } catch (e) {
      console.error(e)
      setError('Reject failed. Try again.')
    }
    setBusyId(null)
  }

  return (
    <div>
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <Shield size={16} aria-hidden="true" />
          R'Courses admin
        </div>
        {authed ? (
          <button type="button" onClick={logout} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={14} aria-hidden="true" /> Lock
          </button>
        ) : null}
      </header>

      <main className="admin-main">
        {!authed ? (
          <form className="form welcome" style={{ maxWidth: 440, margin: '48px auto 0', padding: 28 }} onSubmit={handleUnlock}>
            <h1 className="page-title" style={{ fontSize: 32 }}>Review moderation</h1>
            <p className="muted">Enter the admin password. This page is not linked from the public site.</p>
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error ? <div className="form-error" role="alert">{error}</div> : null}
            <button type="submit" className="btn-primary">Unlock</button>
          </form>
        ) : (
          <>
            <div className="page-head">
              <div>
                <h1 className="page-title" style={{ fontSize: 32 }}>Pending reviews</h1>
                <p className="page-sub">{reviews.length} waiting. Hidden from the site until you approve.</p>
              </div>
              <button type="button" className="btn-ghost" onClick={load} disabled={loading}>
                <RefreshCw size={14} aria-hidden="true" /> Refresh
              </button>
            </div>
            {notice ? <div className="notice" role="status" style={{ marginBottom: 12 }}>{notice}</div> : null}
            {error ? <div className="form-error" role="alert" style={{ marginBottom: 12 }}>{error}</div> : null}
            {loading ? (
              <div className="muted" style={{ textAlign: 'center', padding: 40 }}>Loading…</div>
            ) : reviews.length === 0 ? (
              <div className="empty">
                <h2>No pending reviews</h2>
                <p>New submissions will show up here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    busy={busyId === review.id}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
