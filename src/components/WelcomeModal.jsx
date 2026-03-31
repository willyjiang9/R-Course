// src/components/WelcomeModal.jsx
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('rcourses_welcome')
    if (!seen) {
      setTimeout(() => setVisible(true), 600)
    }
  }, [])

  function close() {
    sessionStorage.setItem('rcourses_welcome', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(15,17,23,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 301,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 480,
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeUp 0.4s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003DA5 0%, #002a73 100%)',
            padding: '28px 28px 24px',
            position: 'relative',
          }}>
            <button
              onClick={close}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 99, padding: 6,
                color: '#fff', cursor: 'pointer', display: 'flex',
              }}
            ><X size={15} /></button>

            <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 24,
              color: '#fff', lineHeight: 1.2, marginBottom: 8,
            }}>
              Welcome to R'Courses!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              The UCR student-built course review platform.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: '#5a6273', lineHeight: 1.7 }}>
              We just got a big upgrade! 🚀 We've added thousands more UCR courses and imported hundreds of real student reviews so you can start getting useful insights right away. Our goal is simple — help Highlanders make smarter decisions about which classes to take.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔍', text: 'Browse all 4,700+ UCR courses and filter by units' },
                { icon: '⭐', text: 'See real difficulty ratings from past students' },
                { icon: '💬', text: 'Leave honest reviews to help future Highlanders' },
                { icon: '📣', text: 'Share with friends to grow the community' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: '#fff8e1',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: '#92580a',
              lineHeight: 1.6,
            }}>
              🙏 We now have real student reviews already loaded — but the more you add, the better it gets. Share your experience to help future Highlanders!
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={close}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 10,
                  background: '#003DA5', color: '#fff',
                  border: 'none', fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#002a73'}
                onMouseLeave={e => e.target.style.background = '#003DA5'}
              >
                Let's Go! 🚀
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('https://rcourses.org')
                  alert('Link copied! Share it with your friends 🎉')
                }}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 10,
                  background: '#f4f5f7', color: '#374151',
                  border: '1.5px solid #e2e5ea',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
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
