import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('rcourses_welcome_20261007')
    if (!seen) setVisible(true)
  }, [])

  const close = useCallback(() => {
    sessionStorage.setItem('rcourses_welcome_20261007', 'true')
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = e => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, close])

  const share = useCallback(async () => {
    const url = 'https://rcourses.org'
    try {
      if (navigator.share) {
        await navigator.share({
          title: "R'Courses",
          text: 'UCR course reviews from students.',
          url,
        })
        return
      }
    } catch {
      /* cancelled */
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      <div className="backdrop" style={{ zIndex: 300 }} onClick={close} />
      <div className="welcome-wrap" role="presentation">
        <div
          className="welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={e => e.stopPropagation()}
        >
          <div className="welcome-bar" />
          <div className="welcome-body">
            <button type="button" className="welcome-close" aria-label="Close" onClick={close}>
              <X size={16} aria-hidden="true" />
            </button>
            <p className="page-kicker">Updated 10/07/2026</p>
            <h2 id="welcome-title">Welcome to R'Courses</h2>
            <p>
              A UCR student catalog of course reviews. Search a code or title, then open a class to see how hard it was for people who already took it.
            </p>
            <p>
              New reviews are checked before they go live. If you took a class, add yours. If a friend is building a schedule, send them the site.
            </p>
            {copied ? (
              <div className="notice" role="status" aria-live="polite">Link copied to the clipboard.</div>
            ) : null}
            <div className="welcome-actions">
              <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={close}>
                Browse courses
              </button>
              <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={share}>
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
