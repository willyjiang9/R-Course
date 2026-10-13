// src/App.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue, startTransition } from 'react'
import Navbar from './components/Navbar.jsx'
import DeptSidebar from './components/DeptSidebar.jsx'
import CourseCard from './components/CourseCard.jsx'
import CourseModal from './components/CourseModal.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import COURSES from './data/allCourses.json'
import BUNDLED_STATS from './data/courseStats.json'
import { trackEvent } from './firebase.js'
import { X } from 'lucide-react'
import { formatCount } from './lib/format.js'

const SUBJECT_TO_COLLEGE = {
  "CS":"Engineering","CSE":"Engineering","EE":"Engineering","ENGR":"Engineering",
  "ME":"Engineering","ENVE":"Engineering","CEE":"Engineering","CHE":"Engineering",
  "MSE":"Engineering","BIEN":"Engineering","BENG":"Engineering","MASC":"Engineering",
  "BIOL":"Natural Sciences","CHEM":"Natural Sciences","PHYS":"Natural Sciences",
  "MATH":"Natural Sciences","STAT":"Natural Sciences","ENTM":"Natural Sciences",
  "NRSC":"Natural Sciences","CBNS":"Natural Sciences","MCBL":"Natural Sciences",
  "PLNT":"Natural Sciences","ENVS":"Natural Sciences","GEO":"Natural Sciences",
  "EEOB":"Natural Sciences","BPSC":"Natural Sciences","NEMA":"Natural Sciences",
  "PLPA":"Natural Sciences","SOILS":"Natural Sciences","APPM":"Natural Sciences",
  "NASC":"Natural Sciences","BCH":"Natural Sciences","AST":"Natural Sciences",
  "BCHM":"Natural Sciences","KINE":"Natural Sciences","EXSC":"Natural Sciences",
  "BIOC":"Natural Sciences","HNPG":"Natural Sciences","POSC":"Natural Sciences",
  "BUS":"Business","MGT":"Business","ACCT":"Business","FIN":"Business",
  "MKTG":"Business","OB":"Business","IS":"Business","SCM":"Business",
  "ECON":"Social Sciences","POLS":"Social Sciences","PSY":"Social Sciences",
  "PSYC":"Social Sciences","SOC":"Social Sciences","ANTH":"Social Sciences",
  "GEOG":"Social Sciences","PBPL":"Social Sciences","EDUC":"Social Sciences",
  "HIST":"Social Sciences","SOSC":"Social Sciences","LGBS":"Social Sciences",
  "GSST":"Social Sciences","ETST":"Social Sciences","CHIC":"Social Sciences",
  "AAS":"Social Sciences","INTL":"Social Sciences","WMST":"Social Sciences",
  "SOCI":"Social Sciences","GLBL":"Social Sciences","AFAM":"Social Sciences",
  "CRES":"Social Sciences","SWRK":"Social Sciences","CRJU":"Social Sciences",
  "GEOB":"Social Sciences",
  "ENGL":"Humanities & Arts","PHIL":"Humanities & Arts","ART":"Humanities & Arts",
  "CLA":"Humanities & Arts","CPLT":"Humanities & Arts","JPN":"Humanities & Arts",
  "RLST":"Humanities & Arts","HISE":"Social Sciences","HISA":"Social Sciences",
  "LABR":"Social Sciences",
  "MUS":"Humanities & Arts","THEA":"Humanities & Arts","DANCE":"Humanities & Arts",
  "FREN":"Humanities & Arts","SPAN":"Humanities & Arts","GERM":"Humanities & Arts",
  "JAPN":"Humanities & Arts","ITAL":"Humanities & Arts","CLAS":"Humanities & Arts",
  "LING":"Humanities & Arts","COGS":"Humanities & Arts","HPSC":"Humanities & Arts",
  "CPAC":"Humanities & Arts","WRIT":"Humanities & Arts","CRWT":"Humanities & Arts",
  "CHIN":"Humanities & Arts","ARAB":"Humanities & Arts","RUSS":"Humanities & Arts",
  "HEBR":"Humanities & Arts","PORT":"Humanities & Arts","LATN":"Humanities & Arts",
  "GREK":"Humanities & Arts","MUSC":"Humanities & Arts","AHS":"Humanities & Arts",
  "UNIV":"Humanities & Arts",
}

const COLLEGES = ["Engineering","Natural Sciences","Business","Social Sciences","Humanities & Arts","Other"]

function getCollege(s) { return SUBJECT_TO_COLLEGE[s] || "Other" }

const COLLEGE_COUNTS = COURSES.reduce((acc, c) => {
  const col = getCollege(c.subject)
  acc[col] = (acc[col] || 0) + 1
  return acc
}, {})

const DEPT_LIST = COLLEGES.map(name => ({
  code: name, name, isCollege: true,
}))

const REVIEWED_COUNT = Object.keys(BUNDLED_STATS).length
const PAGE_SIZE = 50 // load 50 cards at a time

export default function App() {
  const [search, setSearch]                   = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedCourse, setSelectedCourse]   = useState(null)
  const [unitsFilter, setUnitsFilter]         = useState('All')
  const [sortBy, setSortBy]                   = useState('code')
  const [sidebarOpen, setSidebarOpen]         = useState(false)
  const [liveStats]                           = useState({})
  const [visibleCount, setVisibleCount]       = useState(PAGE_SIZE)
  const loaderRef = useRef(null)

  const statsMap = useMemo(() => ({ ...BUNDLED_STATS, ...liveStats }), [liveStats])

  const filtered = useMemo(() => {
    let list = COURSES

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase()
      list = list.filter(c =>
        c.fullCode.toLowerCase().includes(q) ||
        c.fullCode.toLowerCase().replace(/\s+/g, '').includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.prerequisites || '').toLowerCase().includes(q)
      )
    }
    if (selectedCollege) {
      list = list.filter(c => getCollege(c.subject) === selectedCollege)
    }

    if (unitsFilter !== 'All') {
      list = list.filter(c => {
        const u = parseFloat(c.units)
        if (isNaN(u)) return false
        if (unitsFilter === '5+') return u >= 5
        return u === parseFloat(unitsFilter)
      })
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'difficulty') {
        return (statsMap[a.fullCode]?.avgDifficulty ?? 99) - (statsMap[b.fullCode]?.avgDifficulty ?? 99)
      }
      if (sortBy === 'rating') {
        return (statsMap[b.fullCode]?.avgProfRating ?? 0) - (statsMap[a.fullCode]?.avgProfRating ?? 0)
      }
      return a.fullCode.localeCompare(b.fullCode)
    })

    return list
  }, [deferredSearch, selectedCollege, sortBy, statsMap, unitsFilter])

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [deferredSearch, selectedCollege, sortBy, unitsFilter])

  // Infinite scroll — load more as user scrolls down
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length))
      }
    }, { threshold: 0.1 })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [filtered.length])

  const visibleCourses = filtered.slice(0, visibleCount)

  useEffect(() => {
    if (!selectedCourse) return
    trackEvent('view_item', {
      item_id: selectedCourse.fullCode,
      item_name: selectedCourse.title,
      item_category: selectedCourse.subject,
    })
  }, [selectedCourse])

  const handleCollegeSelect = useCallback(code => {
    startTransition(() => {
      setSelectedCollege(code)
      setSearch('')
      setSidebarOpen(false)
    })
  }, [])

  const sectionTitle = deferredSearch.trim()
    ? `Results for “${deferredSearch.trim()}”`
    : selectedCollege || 'All courses'

  return (
    <div>
      <Navbar
        search={search}
        onSearch={setSearch}
        courseCount={COURSES.length}
        onOpenColleges={() => setSidebarOpen(true)}
        collegesOpen={sidebarOpen}
      />

      {sidebarOpen ? (
        <div className="drawer-backdrop mobile-only" onClick={e => { if (e.target === e.currentTarget) setSidebarOpen(false) }}>
          <div className="drawer" role="dialog" aria-label="Colleges">
            <div className="drawer-head">
              <span>Colleges</span>
              <button type="button" className="welcome-close" aria-label="Close college list" onClick={() => setSidebarOpen(false)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <DeptSidebar
              embedded
              departments={DEPT_LIST}
              selected={selectedCollege}
              onSelect={handleCollegeSelect}
              counts={COLLEGE_COUNTS}
            />
          </div>
        </div>
      ) : null}

      <div className="shell">
        <div className="desktop-only">
          <DeptSidebar
            departments={DEPT_LIST}
            selected={selectedCollege}
            onSelect={handleCollegeSelect}
            counts={COLLEGE_COUNTS}
          />
        </div>

        <main id="main" className="main">
          <div className="page-head">
            <div>
              <div className="page-kicker">UCR undergraduate catalog</div>
              <h1 className="page-title">{sectionTitle}</h1>
              <p className="page-sub">
                {formatCount(filtered.length)} course{filtered.length === 1 ? '' : 's'} · {formatCount(REVIEWED_COUNT)} with reviews
              </p>
            </div>

            <div className="toolbar">
              <div className="seg">
                <div className="seg-label">Units</div>
                <div className="seg-group" role="group" aria-label="Filter by units">
                  {['All','1','2','3','4','5+'].map(u => (
                    <button
                      key={u}
                      type="button"
                      className={unitsFilter === u ? 'is-on' : undefined}
                      onClick={() => startTransition(() => setUnitsFilter(u))}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="seg">
                <div className="seg-label">Sort</div>
                <div className="seg-group" role="group" aria-label="Sort courses">
                  {[
                    { v: 'code', label: 'Code' },
                    { v: 'title', label: 'Title' },
                    { v: 'difficulty', label: 'Easiest' },
                    { v: 'rating', label: 'Top rated' },
                  ].map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      className={sortBy === v ? 'is-on' : undefined}
                      onClick={() => startTransition(() => setSortBy(v))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <h2>No courses match</h2>
              <p>Change the search, college, or units filter.</p>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {visibleCourses.map(course => (
                  <CourseCard
                    key={course.fullCode}
                    course={course}
                    stats={statsMap[course.fullCode]}
                    onClick={() => setSelectedCourse(course)}
                  />
                ))}
              </div>
              {visibleCount < filtered.length ? (
                <div ref={loaderRef} className="more">Loading more…</div>
              ) : null}
            </>
          )}
        </main>
      </div>

      {selectedCourse ? (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      ) : null}
      <WelcomeModal />
    </div>
  )
}
