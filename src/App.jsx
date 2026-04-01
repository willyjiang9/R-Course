// src/App.jsx
import React, { useState, useMemo, useCallback } from 'react'
import Navbar from './components/Navbar.jsx'
import DeptSidebar from './components/DeptSidebar.jsx'
import CourseCard from './components/CourseCard.jsx'
import CourseModal from './components/CourseModal.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import COURSES from './data/allCourses.json'
import BUNDLED_STATS from './data/courseStats.json'
import { Menu, X } from 'lucide-react'

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

const COLLEGES = ["Engineering", "Natural Sciences", "Business", "Social Sciences", "Humanities & Arts", "Other"]
const COLLEGE_ICONS = {
  "Engineering":       "⚙️",
  "Natural Sciences":  "🔬",
  "Business":          "📊",
  "Social Sciences":   "🌍",
  "Humanities & Arts": "🎨",
  "Other":             "📚",
}

function getCollege(subject) {
  return SUBJECT_TO_COLLEGE[subject] || "Other"
}

const COLLEGE_COUNTS = COURSES.reduce((acc, c) => {
  const col = getCollege(c.subject)
  acc[col] = (acc[col] || 0) + 1
  return acc
}, {})

const DEPT_LIST = COLLEGES.map(name => ({
  code: name,
  name: `${COLLEGE_ICONS[name]} ${name}`,
  isCollege: true,
}))

const REVIEWED_COUNT = Object.keys(BUNDLED_STATS).length

export default function App() {
  const [search, setSearch]                   = useState('')
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedCourse, setSelectedCourse]   = useState(null)
  const [unitsFilter, setUnitsFilter]         = useState('All')
  const [sortBy, setSortBy]                   = useState('code')
  const [sidebarOpen, setSidebarOpen]         = useState(false)
  const [liveStats, setLiveStats]             = useState({})

  const statsMap = useMemo(() => ({ ...BUNDLED_STATS, ...liveStats }), [liveStats])

  const filtered = useMemo(() => {
    let list = COURSES

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.fullCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.prerequisites || '').toLowerCase().includes(q)
      )
    } else if (selectedCollege) {
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
        const da = statsMap[a.fullCode]?.avgDifficulty ?? 99
        const db = statsMap[b.fullCode]?.avgDifficulty ?? 99
        return da - db
      }
      if (sortBy === 'rating') {
        const ra = statsMap[a.fullCode]?.avgProfRating ?? 0
        const rb = statsMap[b.fullCode]?.avgProfRating ?? 0
        return rb - ra
      }
      return a.fullCode.localeCompare(b.fullCode)
    })

    return list
  }, [search, selectedCollege, sortBy, statsMap, unitsFilter])

  const handleCollegeSelect = useCallback(code => {
    setSelectedCollege(code)
    setSearch('')
    setSidebarOpen(false) // close sidebar on mobile after selection
  }, [])

  function handleNewStats(courseCode, newStats) {
    setLiveStats(prev => ({ ...prev, [courseCode]: newStats }))
  }

  const sectionTitle = selectedCollege
    ? `${COLLEGE_ICONS[selectedCollege]} ${selectedCollege}`
    : search ? `Results for "${search}"` : 'All Courses'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .filter-bar { flex-direction: column !important; align-items: flex-start !important; }
          .course-grid { grid-template-columns: 1fr !important; }
          .main-content { padding: 16px 16px 80px !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-sidebar-overlay { display: none !important; }
        }
      `}</style>

      <Navbar search={search} onSearch={setSearch} courseCount={COURSES.length} />

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', bottom: 24, right: 24, zIndex: 150,
          background: 'var(--ucr-blue)', color: '#fff',
          border: 'none', borderRadius: 99,
          padding: '14px 20px',
          alignItems: 'center', gap: 8,
          fontSize: 14, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,61,165,0.4)',
          cursor: 'pointer',
        }}
      >
        <Menu size={18} /> Browse Major
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 280, background: 'var(--surface)',
            overflowY: 'auto',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Browse by Major</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <DeptSidebar
              departments={DEPT_LIST}
              selected={selectedCollege}
              onSelect={handleCollegeSelect}
              counts={COLLEGE_COUNTS}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', paddingTop: 60 }}>
        {/* Desktop sidebar */}
        <div className="desktop-sidebar">
          <DeptSidebar
            departments={DEPT_LIST}
            selected={selectedCollege}
            onSelect={handleCollegeSelect}
            counts={COLLEGE_COUNTS}
          />
        </div>

        <main className="main-content" style={{ flex: 1, padding: '28px 28px 60px', minWidth: 0 }}>
          <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{sectionTitle}</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} · {REVIEWED_COUNT} reviewed
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Units:</span>
                <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {['All', '1', '2', '3', '4', '5+'].map(u => (
                    <button key={u} onClick={() => setUnitsFilter(u)} style={{ padding: '8px 10px', fontSize: 12, fontWeight: unitsFilter===u?700:400, color: unitsFilter===u?'var(--ucr-blue)':'var(--text-secondary)', background: unitsFilter===u?'var(--ucr-blue-light)':'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>{u}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort:</span>
                <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {[{v:'code',label:'Code'},{v:'title',label:'Title'},{v:'difficulty',label:'Easiest'},{v:'rating',label:'Top Rated'}].map(({v,label}) => (
                    <button key={v} onClick={() => setSortBy(v)} style={{ padding: '8px 12px', fontSize: 12, fontWeight: sortBy===v?700:400, color: sortBy===v?'var(--ucr-blue)':'var(--text-secondary)', background: sortBy===v?'var(--ucr-blue-light)':'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>No courses found</div>
              <div style={{ fontSize: 14 }}>Try a different search, department, or units filter</div>
            </div>
          ) : (
            <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filtered.map((course, i) => (
                <div key={course.fullCode} style={{ animationDelay: `${Math.min(i*30,300)}ms` }}>
                  <CourseCard
                    course={course}
                    stats={statsMap[course.fullCode]}
                    onClick={() => setSelectedCourse(course)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onNewStats={handleNewStats}
        />
      )}
      <WelcomeModal />
    </div>
  )
}
