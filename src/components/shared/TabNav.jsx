import React from 'react'

const TABS = [
  { id: 'journey', label: 'Journey' },
  { id: 'insights', label: 'Insights', countKey: 'insightCount' },
  { id: 'opportunities', label: 'Opportunities', countKey: 'oppCount' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'changelog', label: 'Changelog' },
]

export default function TabNav({ activeTab, onTabChange, insightCount, oppCount }) {
  const counts = { insightCount, oppCount }

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
        <button className="tabnav-action-btn">⌕ Search</button>
        <button className="tabnav-action-btn">⚡ Mini insights</button>
        <button className="tabnav-action-btn">☰ Library</button>
      </div>
    </div>
  )
}
