import React, { memo } from 'react'
import { StarDisplay } from './StarRating.jsx'
import { displayTitle } from '../lib/format.js'

function tone(value) {
  if (value <= 2) return 'easy'
  if (value <= 3.5) return 'medium'
  return 'hard'
}

function difficultyLabel(value) {
  if (value <= 2) return 'Low'
  if (value <= 3.5) return 'Moderate'
  return 'High'
}

function CourseCard({ course, stats, onClick }) {
  const hasStats = stats && stats.reviewCount > 0
  const dTone = hasStats ? tone(stats.avgDifficulty) : ''
  const rTone = hasStats && stats.recommendPct != null
    ? (stats.recommendPct >= 70 ? 'easy' : stats.recommendPct >= 40 ? 'medium' : 'hard')
    : ''

  return (
    <button type="button" className="course-card" onClick={onClick}>
      <div className="course-card-top">
        <div style={{ minWidth: 0 }}>
          <div className="course-code">{course.fullCode}</div>
          <div className="course-title">{displayTitle(course.title)}</div>
        </div>
        <div className="course-units">{course.units ? `${course.units} units` : ''}</div>
      </div>

      {hasStats ? (
        <div className="meter">
          <div className="meter-row">
            <span>Difficulty</span>
            <b className={dTone}>{difficultyLabel(stats.avgDifficulty)} {stats.avgDifficulty.toFixed(1)}</b>
          </div>
          <div className="meter-track">
            <div
              className={`meter-fill ${dTone}`}
              style={{ width: `${((stats.avgDifficulty - 1) / 4) * 100}%` }}
            />
          </div>
          <div className="card-meta">
            <StarDisplay value={stats.avgProfRating} size={12} />
            <span>
              {stats.reviewCount} review{stats.reviewCount === 1 ? '' : 's'}
            </span>
          </div>
          {stats.recommendPct != null ? (
            <div className={`reco ${rTone}`}>{stats.recommendPct}% recommend</div>
          ) : null}
        </div>
      ) : (
        <div className="muted">No student reviews yet</div>
      )}

      {course.prerequisites && course.prerequisites !== 'None' ? (
        <div className="prereq">
          <span>Prereqs: </span>
          {course.prerequisites}
        </div>
      ) : null}
    </button>
  )
}

export default memo(CourseCard)
