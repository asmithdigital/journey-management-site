import React from 'react'

const TABS = [
  { id: 'journey', label: 'Journey' },
  { id: 'insights', label: 'Insights' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'changelog', label: 'Changelog' },
]

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div className="tabnav">
      <div className="tabnav-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tabnav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
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
