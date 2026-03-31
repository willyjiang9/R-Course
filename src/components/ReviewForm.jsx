// src/components/ReviewForm.jsx
import React, { useState } from 'react'
import { StarInput } from './StarRating.jsx'
import { Send } from 'lucide-react'

const GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F','P','NP','W','—']

const TERMS = [
  'Spring 2026','Winter 2026','Fall 2025','Summer 2025',
  'Spring 2025','Winter 2025','Fall 2024','Summer 2024',
  'Spring 2024','Winter 2024','Fall 2023','Summer 2023',
  'Spring 2023','Winter 2023','Fall 2022','Summer 2022',
  'Spring 2022','Winter 2022','Fall 2021','Summer 2021',
]

const inputStyle = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '9px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  background: 'var(--surface)',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  display: 'block',
}

export default function ReviewForm({ courseCode, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    difficulty: 0,
    professorRating: 0,
    workload: '',
    wouldRecommend: null,
    gradeReceived: '',
    termTaken: '',
    professor: '',
    text: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.difficulty > 0 && form.professorRating > 0 && form.workload && form.wouldRecommend !== null && form.text.trim().length > 10

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valid) { setError('Please fill in all required fields.'); return }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError('Failed to submit. Check your Firebase config.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Write a Review</div>

      {/* Term taken */}
      <div>
        <label style={labelStyle}>Term Taken (optional)</label>
        <select
          value={form.termTaken}
          onChange={e => set('termTaken', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = 'var(--ucr-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          <option value="">Select term...</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Professor name */}
      <div>
        <label style={labelStyle}>Professor (optional)</label>
        <input
          type="text"
          placeholder="e.g. Dr. Smith"
          value={form.professor}
          onChange={e => set('professor', e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--ucr-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Difficulty */}
      <div>
        <label style={labelStyle}>Overall Difficulty <span style={{ color: '#dc2626' }}>*</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StarInput value={form.difficulty} onChange={v => set('difficulty', v)} />
          {form.difficulty > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {['','Very Easy','Easy','Moderate','Hard','Very Hard'][form.difficulty]}
            </span>
          )}
        </div>
      </div>

      {/* Professor rating */}
      <div>
        <label style={labelStyle}>Professor Rating <span style={{ color: '#dc2626' }}>*</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StarInput value={form.professorRating} onChange={v => set('professorRating', v)} />
          {form.professorRating > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {['','Terrible','Poor','Okay','Good','Excellent'][form.professorRating]}
            </span>
          )}
        </div>
      </div>

      {/* Workload */}
      <div>
        <label style={labelStyle}>Workload <span style={{ color: '#dc2626' }}>*</span></label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Light', 'Medium', 'Heavy'].map(w => (
            <button
              key={w} type="button" onClick={() => set('workload', w)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${form.workload === w ? 'var(--ucr-blue)' : 'var(--border)'}`,
                background: form.workload === w ? 'var(--ucr-blue-light)' : 'var(--surface)',
                color: form.workload === w ? 'var(--ucr-blue)' : 'var(--text-secondary)',
                fontWeight: form.workload === w ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{w}</button>
          ))}
        </div>
      </div>

      {/* Would recommend */}
      <div>
        <label style={labelStyle}>Would you recommend this course? <span style={{ color: '#dc2626' }}>*</span></label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ v: true, label: '👍 Yes' }, { v: false, label: '👎 No' }].map(({ v, label }) => (
            <button
              key={String(v)} type="button" onClick={() => set('wouldRecommend', v)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${form.wouldRecommend === v ? 'var(--ucr-blue)' : 'var(--border)'}`,
                background: form.wouldRecommend === v ? 'var(--ucr-blue-light)' : 'var(--surface)',
                color: form.wouldRecommend === v ? 'var(--ucr-blue)' : 'var(--text-secondary)',
                fontWeight: form.wouldRecommend === v ? 700 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Grade received */}
      <div>
        <label style={labelStyle}>Grade Received (optional)</label>
        <select
          value={form.gradeReceived}
          onChange={e => set('gradeReceived', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = 'var(--ucr-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          <option value="">Select grade...</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Review text */}
      <div>
        <label style={labelStyle}>Your Review <span style={{ color: '#dc2626' }}>*</span></label>
        <textarea
          placeholder="Share your experience — tips for future students, what the exams are like, how the professor teaches..."
          value={form.text}
          onChange={e => set('text', e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = 'var(--ucr-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {form.text.trim().length}/10 minimum characters
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#dc2626', background: '#fee2e2', borderRadius: 8, padding: '8px 12px' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button" onClick={onCancel}
          style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--surface)', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}
        >Cancel</button>
        <button
          type="submit" disabled={!valid || submitting}
          style={{
            flex: 2, padding: '10px 0', borderRadius: 'var(--radius-sm)',
            background: valid && !submitting ? 'var(--ucr-blue)' : 'var(--border)',
            color: valid && !submitting ? '#fff' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 700, cursor: valid && !submitting ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s',
          }}
        >
          <Send size={14} />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}
