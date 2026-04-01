// src/components/WelcomeModal.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('rcourses_welcome')
    if (!seen) {
      setTimeout(() => setVisible(true), 800)
    }
  }, [])

  const close = useCallback(() => {
    sessionStorage.setItem('rcourses_welcome', 'true')
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onTouchStart={e => { e.stopPropagation(); e.preventDefault() }}
        onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); close() }}
        onClick={e => { e.stopPropagation(); close() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(15,17,23,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          touchAction: 'none',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 301,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          pointerEvents: 'none',
        }}
      >
        <div
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 460,
            maxHeight: 'calc(100vh - 40px)',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003DA5 0%, #002a73 100%)',
            padding: '24px 24px 20px',
            position: 'relative',
            flexShrink: 0,
          }}>
            <button
              onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); close() }}
              onClick={e => { e.stopPropagation(); close() }}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'rgba(255,255,255,0.2)',
                border: 'none', borderRadius: 99,
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <X size={16} />
            </button>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 22,
              color: '#fff', lineHeight: 1.2, marginBottom: 6,
            }}>
              Welcome to R'Courses!
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              The UCR student-built course review platform.
            </p>
          </div>

          {/* Scrollable body */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '20px 24px 24px',
            display: 'flex', flexDirection: 'column', gap: 14,
            WebkitOverflowScrolling: 'touch',
          }}>
            <p style={{ fontSize: 14, color: '#5a6273', lineHeight: 1.65 }}>
              We just got a big upgrade! 🚀 We've added thousands more UCR courses and imported hundreds of real student reviews so you can start getting useful insights right away.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔍', text: 'Browse 4,700+ UCR courses and filter by units' },
                { icon: '⭐', text: 'See real difficulty ratings from past students' },
                { icon: '💬', text: 'Leave honest reviews to help future Highlanders' },
                { icon: '📣', text: 'Share with friends to grow the community' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: '#fff8e1',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              color: '#92580a',
              lineHeight: 1.55,
            }}>
              🙏 We now have real student reviews already loaded — but the more you add, the better it gets!
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); close() }}
                onClick={e => { e.stopPropagation(); close() }}
                style={{
                  flex: 2, padding: '14px 0',
                  borderRadius: 12,
                  background: '#003DA5', color: '#fff',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 15,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                Let's Go! 🚀
              </button>
              <button
                onTouchEnd={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  navigator.clipboard?.writeText('https://rcourses.org')
                  alert('Link copied! Share it with your friends 🎉')
                }}
                onClick={e => {
                  e.stopPropagation()
                  navigator.clipboard?.writeText('https://rcourses.org')
                  alert('Link copied! Share it with your friends 🎉')
                }}
                style={{
                  flex: 1, padding: '14px 0',
                  borderRadius: 12,
                  background: '#f4f5f7', color: '#374151',
                  border: '1.5px solid #e2e5ea',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 15,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                Share 📣
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
