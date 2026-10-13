import React from 'react'
import { formatCount } from '../lib/format.js'

export default function DeptSidebar({ departments, selected, onSelect, counts, embedded }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <nav className={embedded ? undefined : 'sidebar'} aria-label="Colleges">
      <div className="sidebar-label">Colleges</div>
      <NavItem
        label="All courses"
        count={total}
        active={selected === null}
        onClick={() => onSelect(null)}
      />
      <div className="nav-rule" />
      {departments.map(({ code, name }) => (
        <NavItem
          key={code}
          label={name}
          count={counts[code] || 0}
          active={selected === code}
          onClick={() => onSelect(code)}
        />
      ))}
    </nav>
  )
}

function NavItem({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      className={`nav-item${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
    >
      <span className="nav-item-label">{label}</span>
      <span className="nav-count">{formatCount(count)}</span>
    </button>
  )
}
