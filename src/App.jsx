// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Navbar from './components/Navbar.jsx'
import DeptSidebar from './components/DeptSidebar.jsx'
import CourseCard from './components/CourseCard.jsx'
import CourseModal from './components/CourseModal.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import COURSES from './data/allCourses.json'
import { getBatchCourseStats } from './firebase.js'

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

export default function App() {
  const [search, setSearch]                   = useState('')
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedCourse, setSelectedCourse]   = useState(null)
  const [statsMap, setStatsMap]               = useState(() => {
    // Load cached stats immediately on first render
    try {
      const cached = localStorage.getItem('rcourses_stats')
      return cached ? JSON.parse(cached) : {}
    } catch (e) {
      return {}
    }
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [sortBy, setSortBy]             = useState('code')

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
  }, [search, selectedCollege, sortBy, statsMap])

  // Fetch fresh stats for visible courses in background
  useEffect(() => {
    const codes = filtered.slice(0, 50).map(c => c.fullCode)
    if (!codes.length) return
    setStatsLoading(true)
    getBatchCourseStats(codes)
      .then(map => {
        setStatsMap(prev => {
          const updated = { ...prev, ...map }
          try {
            localStorage.setItem('rcourses_stats', JSON.stringify(updated))
          } catch (e) {}
          return updated
        })
        setStatsLoading(false)
      })
      .catch(() => setStatsLoading(false))
  }, [search, selectedCollege])

  const handleCollegeSelect = useCallback(code => {
    setSelectedCollege(code)
    setSearch('')
  }, [])

  const sectionTitle = selectedCollege
    ? `${COLLEGE_ICONS[selectedCollege]} ${selectedCollege}`
    : search ? `Results for "${search}"` : 'All Courses'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar search={search} onSearch={setSearch} courseCount={COURSES.length} />
      <div style={{ display: 'flex', paddingTop: 60 }}>
        <DeptSidebar
          departments={DEPT_LIST}
          selected={selectedCollege}
          onSelect={handleCollegeSelect}
          counts={COLLEGE_COUNTS}
        />
        <main style={{ flex: 1, padding: '28px 28px 60px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{sectionTitle}</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                {!statsLoading && Object.keys(statsMap).length > 0 && <> · {Object.keys(statsMap).length} reviewed</>}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort:</span>
              <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {[{v:'code',label:'Code'},{v:'title',label:'Title'},{v:'difficulty',label:'Easiest'},{v:'rating',label:'Top Rated'}].map(({v,label}) => (
                  <button key={v} onClick={() => setSortBy(v)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: sortBy===v?700:400, color: sortBy===v?'var(--ucr-blue)':'var(--text-secondary)', background: sortBy===v?'var(--ucr-blue-light)':'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>No courses found</div>
              <div style={{ fontSize: 14 }}>Try a different search or department</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filtered.map((course, i) => (
                <div key={course.fullCode} style={{ animationDelay: `${Math.min(i*30,300)}ms` }}>
                  <CourseCard course={course} stats={statsMap[course.fullCode]} onClick={() => setSelectedCourse(course)} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
      <WelcomeModal />
    </div>
  )
}
