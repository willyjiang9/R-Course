// src/components/StarRating.jsx
import React, { useState } from 'react'

export function StarDisplay({ value, size = 16, color = '#F1AB00' }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.round(value) ? color : '#e2e5ea'
    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={fill} style={{ display: 'block' }}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {stars}
      {value != null && (
        <span style={{ marginLeft: 5, fontSize: 13, color: '#5a6273', fontWeight: 500 }}>
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  )
}

export function StarInput({ value, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const active = i <= (hovered || value)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' ,transform: active ? 'scale(1.15)' : 'scale(1)' }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#F1AB00' : '#e2e5ea'} style={{ display: 'block', transition: 'fill 0.1s' }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
