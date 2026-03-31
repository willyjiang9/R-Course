// src/components/Navbar.jsx
import React from 'react'
import { Search, BookOpen } from 'lucide-react'

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(0, 61, 165, 0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    height: 60,
    display: 'flex', alignItems: 'center',
    padding: '0 24px',
    gap: 16,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 9,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 20,
    color: '#fff',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  logoAccent: { color: '#F1AB00' },
  searchWrap: {
    flex: 1, maxWidth: 520,
    position: 'relative',
    marginLeft: 8,
  },
  searchIcon: {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: 38,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 99,
    paddingLeft: 38,
    paddingRight: 16,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'background 0.2s, border-color 0.2s',
  },
  badge: {
    marginLeft: 'auto',
    background: 'rgba(241,171,0,0.2)',
    border: '1px solid rgba(241,171,0,0.4)',
    borderRadius: 99,
    padding: '4px 12px',
    fontSize: 12,
    color: '#F1AB00',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  }
}

export default function Navbar({ search, onSearch, courseCount }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <BookOpen size={20} color="#F1AB00" />
        R'<span style={styles.logoAccent}>Courses</span>
      </div>

      <div style={styles.searchWrap}>
        <Search size={15} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search courses, titles, descriptions..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={styles.searchInput}
          onFocus={e => {
            e.target.style.background = 'rgba(255,255,255,0.18)'
            e.target.style.borderColor = 'rgba(255,255,255,0.4)'
          }}
          onBlur={e => {
            e.target.style.background = 'rgba(255,255,255,0.12)'
            e.target.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        />
      </div>

      {courseCount != null && (
        <div style={styles.badge}>{courseCount.toLocaleString()} courses</div>
      )}
    </nav>
  )
}
