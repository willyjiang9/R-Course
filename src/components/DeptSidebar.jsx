// src/components/DeptSidebar.jsx
import React from 'react'
import { LayoutGrid } from 'lucide-react'

export default function DeptSidebar({ departments, selected, onSelect, counts }) {
  return (
    <aside style={{
      width: 230,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      height: 'calc(100vh - 60px)',
      position: 'sticky',
      top: 60,
      overflowY: 'auto',
      padding: '16px 0',
    }}>
      <div style={{ padding: '0 16px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Browse by Major
      </div>

      {/* All button */}
      <SidebarItem
        label="All Departments"
        count={Object.values(counts).reduce((a, b) => a + b, 0)}
        active={selected === null}
        onClick={() => onSelect(null)}
        icon={<LayoutGrid size={14} />}
      />

      <div style={{ height: 1, background: 'var(--border)', margin: '8px 16px' }} />

      {departments.map(({ code, name }) => (
        <SidebarItem
          key={code}
          label={name}
          sublabel={code}
          count={counts[code] || 0}
          active={selected === code}
          onClick={() => onSelect(code)}
        />
      ))}
    </aside>
  )
}

function SidebarItem({ label, sublabel, count, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 16px',
        background: active ? 'var(--ucr-blue-light)' : 'transparent',
        borderLeft: active ? '3px solid var(--ucr-blue)' : '3px solid transparent',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f4f5f7' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon && <span style={{ color: active ? 'var(--ucr-blue)' : 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--ucr-blue)' : 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sublabel}</div>}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: active ? 'var(--ucr-blue)' : 'var(--text-muted)',
        background: active ? 'rgba(0,61,165,0.1)' : 'var(--bg)',
        borderRadius: 99, padding: '1px 7px', flexShrink: 0,
      }}>{count}</span>
    </button>
  )
}
