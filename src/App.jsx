import React, { createContext, useContext, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import JourneyMap from './pages/JourneyMap.jsx'
import OpportunityMatrix from './components/matrix/OpportunityMatrix.jsx'
import Search from './pages/Search.jsx'
import WhatsNew from './pages/WhatsNew.jsx'
import GlobalInsights from './pages/GlobalInsights.jsx'
import GlobalOpportunities from './pages/GlobalOpportunities.jsx'
import GlobalSolutions from './pages/GlobalSolutions.jsx'
import GlobalMetrics from './pages/GlobalMetrics.jsx'
import Personas from './pages/Personas.jsx'
import MetricsDashboard from './pages/MetricsDashboard.jsx'
import MetricsDetail from './pages/MetricsDetail.jsx'

export const DataContext = createContext(null)
export const SidebarContext = createContext({ sidebarOpen: false, openSidebar: () => {}, closeSidebar: () => {} })

export function useData() {
  return useContext(DataContext)
}

const BASE = import.meta.env.BASE_URL

function collectAllIds(nodes) {
  return nodes.flatMap(node => [node.id, ...collectAllIds(node.children || [])])
}

function MobileAppBar() {
  const location = useLocation()
  const { openSidebar } = useContext(SidebarContext)
  if (location.pathname.startsWith('/journey/')) return null
  return (
    <div className="mobile-app-bar">
      <button className="hamburger-btn" onClick={openSidebar} aria-label="Open menu">
        ☰
      </button>
    </div>
  )
}

export default function App() {
  const [index, setIndex] = useState(null)
  const [journeys, setJourneys] = useState({})
  const [benchmarking, setBenchmarking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${BASE}data/index.json`)
        if (!res.ok) throw new Error('Failed to load index.json')
        const idx = await res.json()
        setIndex(idx)

        const journeyIds = collectAllIds(idx.hierarchy)

        const [journeyResults, benchRes] = await Promise.all([
          Promise.all(
            journeyIds.map(async id => {
              try {
                const r = await fetch(`${BASE}data/journeys/${id}.json`)
                if (r.ok) return [id, await r.json()]
              } catch {}
              return null
            })
          ),
          fetch(`${BASE}data/benchmarking.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),
        ])

        const loaded = {}
        journeyResults.forEach(result => {
          if (result) loaded[result[0]] = result[1]
        })
        setJourneys(loaded)
        setBenchmarking(benchRes)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-state" style={{ flex: 1 }}>Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="error-state">Error: {error}</div>
      </div>
    )
  }

  return (
    <DataContext.Provider value={{ index, journeys, benchmarking }}>
      <SidebarContext.Provider value={{ sidebarOpen, openSidebar, closeSidebar }}>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">
            <MobileAppBar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/journey/:journeyId" element={<JourneyMap />} />
              <Route path="/matrix" element={
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <OpportunityMatrix allJourneys={journeys} />
                </div>
              } />
              <Route path="/search" element={<Search />} />
              <Route path="/whats-new" element={<WhatsNew />} />
              <Route path="/insights" element={<GlobalInsights />} />
              <Route path="/opportunities" element={<GlobalOpportunities />} />
              <Route path="/solutions" element={<GlobalSolutions />} />
              <Route path="/metrics" element={<GlobalMetrics />} />
              <Route path="/personas" element={<Personas />} />
              <Route path="/metrics-dashboard" element={<MetricsDashboard />} />
              <Route path="/metrics-dashboard/:productId" element={<MetricsDetail />} />
            </Routes>
          </main>
        </div>
      </SidebarContext.Provider>
    </DataContext.Provider>
  )
}
