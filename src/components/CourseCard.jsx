// src/components/CourseCard.jsx
import React from 'react'
import { StarDisplay } from './StarRating.jsx'
import { MessageSquare, Users } from 'lucide-react'

function DifficultyBar({ value }) {
  if (!value) return null
  const pct = ((value - 1) / 4) * 100
  const color = value <= 2 ? 'var(--easy)' : value <= 3.5 ? 'var(--medium)' : 'var(--hard)'
  const label = value <= 2 ? 'Easy' : value <= 3.5 ? 'Medium' : 'Hard'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Difficulty</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label} · {value.toFixed(1)}</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

export default function CourseCard({ course, stats, onClick }) {
  const hasStats = stats && stats.reviewCount > 0

  return (
    <button
      onClick={onClick}
      className="fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '18px 20px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'rgba(0,61,165,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--ucr-blue)',
            background: 'var(--ucr-blue-light)',
            borderRadius: 6,
            padding: '2px 8px',
            marginBottom: 6,
            letterSpacing: '0.02em',
          }}>
            {course.fullCode}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: 'var(--text-primary)' }}>
            {course.title}
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          fontWeight: 700,
          fontSize: 13,
          color: 'var(--text-muted)',
          background: 'var(--bg)',
          borderRadius: 8,
          padding: '3px 9px',
          whiteSpace: 'nowrap',
        }}>
          {course.units} units
        </div>
      </div>

      {/* Stats */}
      {hasStats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
          <DifficultyBar value={stats.avgDifficulty} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarDisplay value={stats.avgProfRating} size={13} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prof rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <MessageSquare size={12} />
              {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
            </div>
          </div>
          {stats.recommendPct != null && (
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: stats.recommendPct >= 70 ? 'var(--easy)' : stats.recommendPct >= 40 ? 'var(--medium)' : 'var(--hard)',
            }}>
              👍 {stats.recommendPct}% would recommend
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MessageSquare size={12} />
          No reviews yet — be the first!
        </div>
      )}

      {/* Prerequisites */}
      {course.prerequisites && course.prerequisites !== 'None' && (
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          background: 'var(--surface-2)',
          borderRadius: 8,
          padding: '6px 10px',
          borderLeft: '3px solid var(--border)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Prereqs: </span>
          {course.prerequisites}
        </div>
      )}
    </button>
  )
}
