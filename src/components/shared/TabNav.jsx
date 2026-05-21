import React, { useState, useRef, useEffect } from 'react'

const TABS = [
  { id: 'journey', label: 'Journey' },
  { id: 'insights', label: 'Insights', countKey: 'insightCount' },
  { id: 'opportunities', label: 'Opportunities', countKey: 'oppCount' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'changelog', label: 'Changelog' },
]

const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pain', label: 'Pain' },
  { id: 'need', label: 'Need' },
  { id: 'gain', label: 'Gain' },
  { id: 'observation', label: 'Observation' },
  { id: 'opportunities', label: 'Opportunities' },
]

const SEV_OPTIONS = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

function FilterDropdown({ typeFilters, severityFilters, onTypeToggle, onSeverityToggle, activeCount }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  return (
    <div className="filter-dropdown-wrap" ref={ref}>
      <button
        className={`tabnav-action-btn${activeCount > 0 ? ' filter-btn-active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        Filter
        {activeCount > 0 && <span className="tab-count-badge">{activeCount}</span>}
        <span className="filter-chevron">▾</span>
      </button>

      {open && (
        <div className="filter-dropdown-panel">
          <div className="filter-dd-group-label">Type</div>
          {TYPE_OPTIONS.map(opt => (
            <label key={opt.id} className="filter-dd-option">
              <input
                type="checkbox"
                checked={typeFilters.has(opt.id)}
                onChange={() => onTypeToggle(opt.id)}
              />
              {opt.label}
            </label>
          ))}
          <div className="filter-dd-divider" />
          <div className="filter-dd-group-label">Severity</div>
          {SEV_OPTIONS.map(opt => (
            <label key={opt.id} className="filter-dd-option">
              <input
                type="checkbox"
                checked={severityFilters.has(opt.id)}
                onChange={() => onSeverityToggle(opt.id)}
              />
              {opt.label}
            </label>
          ))}
          {activeCount > 0 && (
            <>
              <div className="filter-dd-divider" />
              <button
                className="filter-dd-clear"
                onClick={() => { onTypeToggle('all'); SEV_OPTIONS.forEach(o => { if (severityFilters.has(o.id)) onSeverityToggle(o.id) }) }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function TabNav({ activeTab, onTabChange, insightCount, oppCount, filterProps }) {
  const counts = { insightCount, oppCount }

  let activeFilterCount = 0
  if (filterProps) {
    const { typeFilters, severityFilters } = filterProps
    if (!typeFilters.has('all')) activeFilterCount += typeFilters.size
    activeFilterCount += severityFilters.size
  }

  return (
    <div className="tabnav">
      <div className="tabnav-tabs">
        {TABS.map(tab => {
          const count = tab.countKey != null ? counts[tab.countKey] : null
          return (
            <button
              key={tab.id}
              className={`tabnav-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
              {count != null && count > 0 && (
                <span className="tab-count-badge">{count}</span>
              )}
            </button>
          )
        })}
        <button className="tabnav-tab">+</button>
      </div>
      <div className="tabnav-actions">
        {filterProps && (
          <FilterDropdown {...filterProps} activeCount={activeFilterCount} />
        )}
        <button className="tabnav-action-btn tabnav-desktop-only">⌕ Search</button>
        <button className="tabnav-action-btn tabnav-desktop-only">⚡ Mini insights</button>
        <button className="tabnav-action-btn tabnav-desktop-only">☰ Library</button>
      </div>
    </div>
  )
}
