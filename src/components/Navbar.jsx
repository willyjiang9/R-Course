// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function Navbar({ search, onSearch, courseCount }) {
  const [focused, setFocused] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#003DA5',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
      gap: 12,
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        flexShrink: 0,
        userSelect: 'none',
      }}>
        {/* Book icon using emoji for crispness */}
        <span style={{ fontSize: 18, lineHeight: 1 }}>📖</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '-0.01em',
          color: '#fff',
          lineHeight: 1,
        }}>
          R'<span style={{ color: '#F1AB00' }}>Courses</span>
        </span>
      </div>

      {/* Search bar */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0, maxWidth: 500 }}>
        <Search size={14} style={{
          position: 'absolute', left: 11, top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.55)',
          pointerEvents: 'none',
          flexShrink: 0,
        }} />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: 34,
            background: focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)',
            border: `1.5px solid ${focused ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}`,
            borderRadius: 99,
            paddingLeft: 32,
            paddingRight: search ? 30 : 12,
            color: '#ffffff',
            fontSize: 13,
            outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            caretColor: '#fff',
            WebkitTextFillColor: '#ffffff',
          }}
        />
        {search && (
          <button
            onTouchEnd={e => { e.preventDefault(); onSearch('') }}
            onClick={() => onSearch('')}
            style={{
              position: 'absolute', right: 8, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: 99,
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', padding: 0,
              minHeight: 'unset',
            }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Course count — desktop only */}
      <div style={{
        flexShrink: 0,
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{ color: '#F1AB00', fontWeight: 700 }}>{courseCount?.toLocaleString()}</span>
        <span style={{ display: 'none' }} className="hide-mobile"> courses</span>
        <style>{`
          @media (min-width: 480px) { .hide-mobile { display: inline !important; } }
        `}</style>
      </div>
    </nav>
  )
}
