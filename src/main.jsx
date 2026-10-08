import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPage from './components/AdminPage.jsx'
import './index.css'

function isAdminLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const hash = window.location.hash.replace(/^#\/?/, '')
  return path === '/admin' || hash === 'admin'
}

function Root() {
  const [admin, setAdmin] = useState(isAdminLocation)
  useEffect(() => {
    const sync = () => setAdmin(isAdminLocation())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])
  return admin ? <AdminPage /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
