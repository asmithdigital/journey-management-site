import React, { createContext, useContext, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import JourneyMap from './pages/JourneyMap.jsx'
import OpportunityMatrix from './components/matrix/OpportunityMatrix.jsx'
import Search from './pages/Search.jsx'
import WhatsNew from './pages/WhatsNew.jsx'

export const DataContext = createContext(null)

export function useData() {
  return useContext(DataContext)
}

const BASE = import.meta.env.BASE_URL

function collectAllIds(nodes) {
  return nodes.flatMap(node => [node.id, ...collectAllIds(node.children || [])])
}

export default function App() {
  const [index, setIndex] = useState(null)
  const [journeys, setJourneys] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${BASE}data/index.json`)
        if (!res.ok) throw new Error('Failed to load index.json')
        const idx = await res.json()
        setIndex(idx)

        const journeyIds = collectAllIds(idx.hierarchy)

        const loaded = {}
        await Promise.all(
          journeyIds.map(async id => {
            try {
              const r = await fetch(`${BASE}data/journeys/${id}.json`)
              if (r.ok) loaded[id] = await r.json()
            } catch {
              // journey file doesn't exist yet — expected
            }
          })
        )
        setJourneys(loaded)
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
    <DataContext.Provider value={{ index, journeys }}>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
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
          </Routes>
        </main>
      </div>
    </DataContext.Provider>
  )
}
