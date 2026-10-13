import React, { useState } from 'react'
import { StarInput } from './StarRating.jsx'

const GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F','P','NP','W']
const TERMS = [
  'Spring 2026','Winter 2026','Fall 2025','Summer 2025',
  'Spring 2025','Winter 2025','Fall 2024','Summer 2024',
  'Spring 2024','Winter 2024','Fall 2023','Summer 2023',
  'Spring 2023','Winter 2023','Fall 2022','Summer 2022',
  'Spring 2022','Winter 2022','Fall 2021','Summer 2021',
]

export default function ReviewForm({ onSubmit, onCancel }) {
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
    if (!valid) {
      setError('Fill in difficulty, professor rating, workload, recommend, and a short written review.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(form)
    } catch {
      setError('Review did not send. Try again in a moment.')
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>

      <div className="field">
        <label htmlFor="termTaken">Term taken</label>
        <select id="termTaken" name="termTaken" value={form.termTaken} onChange={e => set('termTaken', e.target.value)}>
          <option value="">Select term…</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="professor">Professor</label>
        <input
          id="professor"
          name="professor"
          autoComplete="off"
          placeholder="e.g. Dr. Smith"
          value={form.professor}
          onChange={e => set('professor', e.target.value)}
        />
      </div>

      <div className="field">
        <label>Overall difficulty <span className="req">*</span></label>
        <StarInput value={form.difficulty} onChange={v => set('difficulty', v)} />
      </div>

      <div className="field">
        <label>Professor rating <span className="req">*</span></label>
        <StarInput value={form.professorRating} onChange={v => set('professorRating', v)} />
      </div>

      <div className="field">
        <label>Workload <span className="req">*</span></label>
        <div className="choice-row">
          {['Light', 'Medium', 'Heavy'].map(w => (
            <button
              key={w}
              type="button"
              className={`choice${form.workload === w ? ' is-on' : ''}`}
              onClick={() => set('workload', w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Would you recommend this course? <span className="req">*</span></label>
        <div className="choice-row">
          {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map(({ v, label }) => (
            <button
              key={label}
              type="button"
              className={`choice${form.wouldRecommend === v ? ' is-on' : ''}`}
              onClick={() => set('wouldRecommend', v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="gradeReceived">Grade received</label>
        <select id="gradeReceived" name="gradeReceived" value={form.gradeReceived} onChange={e => set('gradeReceived', e.target.value)}>
          <option value="">Select grade…</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="reviewText">Your review <span className="req">*</span></label>
        <textarea
          id="reviewText"
          name="text"
          placeholder="What were exams like, how the professor taught, what you would tell the next student…"
          value={form.text}
          onChange={e => set('text', e.target.value)}
          rows={4}
        />
        <div className="muted">{form.text.trim().length}/10 minimum characters</div>
      </div>

      {error ? <div className="form-error" role="alert">{error}</div> : null}

      <div className="form-actions">
        <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={!valid || submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </form>
  )
}
