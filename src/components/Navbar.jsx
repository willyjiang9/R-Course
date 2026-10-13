import React from 'react'
import { Search, X, Menu } from 'lucide-react'
import { formatCount } from '../lib/format.js'

export default function Navbar({ search, onSearch, courseCount, onOpenColleges, collegesOpen }) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to courses</a>
      <div className="brand" translate="no">
        <span className="brand-mark">R<em>'</em>Courses</span>
        <span className="brand-sub">UCR catalog</span>
      </div>

      <div className="search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          name="q"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search courses"
          placeholder="Search courses…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        {search ? (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => onSearch('')}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="header-meta desktop-only">
        <strong>{formatCount(courseCount)}</strong> courses
      </div>

      <button
        type="button"
        className="header-colleges"
        onClick={onOpenColleges}
        aria-label="Open college list"
        aria-expanded={collegesOpen}
      >
        <Menu size={16} aria-hidden="true" />
        <span className="header-colleges-label">Colleges</span>
      </button>
    </header>
  )
}
