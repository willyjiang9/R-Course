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
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ucr-blue)' }}>
            {review.courseCode}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {parseDate(review)}
            {review.termTaken ? ` · ${review.termTaken}` : ''}
            {review.professor ? ` · ${review.professor}` : ''}
            {review.gradeReceived ? ` · Grade ${review.gradeReceived}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {review.workload && (
            <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--bg)', borderRadius: 6, padding: '3px 8px' }}>
              {review.workload} workload
            </span>
          )}
          {review.wouldRecommend != null && (
            <span style={{ fontSize: 12, fontWeight: 600, color: review.wouldRecommend ? 'var(--easy)' : 'var(--hard)' }}>
              {review.wouldRecommend ? 'Recommends' : "Doesn't recommend"}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Difficulty</div>
          <StarDisplay value={review.difficulty} size={14} color="#dc2626" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Professor</div>
          <StarDisplay value={review.professorRating} size={14} />
        </div>
      </div>

      {review.text && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {review.text}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button
          disabled={busy}
          onClick={() => onApprove(review)}
          style={{
            flex: 1, minHeight: 44, borderRadius: 10, border: 'none',
            background: busy ? 'var(--border)' : '#16a34a', color: '#fff',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <Check size={16} /> Approve
        </button>
        <button
          disabled={busy}
          onClick={() => onReject(review)}
          style={{
            flex: 1, minHeight: 44, borderRadius: 10, border: '1.5px solid #fecaca',
            background: '#fff', color: '#dc2626',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <X size={16} /> Reject
        </button>
      </div>
    </div>
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        background: '#003DA5', color: '#fff',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <Shield size={18} />
          R'Courses Admin
        </div>
        {authed && (
          <button
            onClick={logout}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <LogOut size={14} /> Lock
          </button>
        )}
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        {!authed ? (
          <form
            onSubmit={handleUnlock}
            style={{
              marginTop: 40, background: '#fff', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
              Review moderation
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Enter the admin password. This page is not linked from the public site.
            </p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
                padding: '12px 14px', fontSize: 16, outline: 'none',
              }}
            />
            {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
            <button
              type="submit"
              style={{
                background: 'var(--ucr-blue)', color: '#fff', borderRadius: 10,
                padding: '12px 0', fontWeight: 700, fontSize: 15,
              }}
            >
              Unlock
            </button>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
                  Pending reviews
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {reviews.length} waiting · they are hidden from the site until you approve
                </p>
              </div>
              <button
                onClick={load}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#fff', border: '1.5px solid var(--border)',
                  borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 600,
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {notice && (
              <div style={{ background: 'var(--easy-bg)', color: 'var(--easy)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                {notice}
              </div>
            )}
            {error && (
              <div style={{ background: 'var(--hard-bg)', color: 'var(--hard)', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</div>
            ) : reviews.length === 0 ? (
              <div style={{
                textAlign: 'center', background: '#fff', border: '1px solid var(--border)',
                borderRadius: 16, padding: 40, color: 'var(--text-muted)',
              }}>
                No pending reviews. Nice.
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
