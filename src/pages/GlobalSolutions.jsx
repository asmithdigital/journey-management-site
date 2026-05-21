import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  proposed:      { bg: '#F4F5F7', text: '#5E6C84' },
  'in-progress': { bg: '#EAF0FF', text: '#0052CC' },
  shipped:       { bg: '#E3FCEF', text: '#006644' },
  rejected:      { bg: '#FFEBE6', text: '#BF2600' },
}

const STATUS_LABELS = {
  proposed:      'Proposed',
  'in-progress': 'In Progress',
  shipped:       'Shipped',
  rejected:      'Rejected',
}

const DEMO_SOLUTIONS = [
  {
    id: 'sol-1',
    name: 'Social Login (Google & Apple)',
    linkedOpp: 'Add social login to reduce friction and eliminate password management',
    status: 'in-progress',
    owner: 'Marcus Webb',
    journeyName: 'My Account',
    journeyId: 'my-account',
  },
  {
    id: 'sol-2',
    name: 'Address Sync Across All Policies',
    linkedOpp: 'Sync address changes across membership and all policies in a single update',
    status: 'proposed',
    owner: 'Sarah Chen',
    journeyName: 'My Account',
    journeyId: 'my-account',
  },
  {
    id: 'sol-3',
    name: 'Renewal Email with Premium Amount',
    linkedOpp: 'Include the new premium amount and year-on-year change in renewal email',
    status: 'shipped',
    owner: 'Priya Patel',
    journeyName: 'Renewals',
    journeyId: 'renewals',
  },
  {
    id: 'sol-4',
    name: 'Year-on-Year Renewal Comparison',
    linkedOpp: 'Show a side-by-side comparison of last year vs this year premium and coverage',
    status: 'in-progress',
    owner: 'Jordan Liu',
    journeyName: 'Renewals',
    journeyId: 'renewals',
  },
  {
    id: 'sol-5',
    name: 'Password Requirements Live Checklist',
    linkedOpp: 'Show requirements upfront as a live checklist that ticks off as the user types',
    status: 'shipped',
    owner: 'Marcus Webb',
    journeyName: 'Account Creation',
    journeyId: 'account-creation',
  },
  {
    id: 'sol-6',
    name: 'Deep-Link Email Verification',
    linkedOpp: 'Use a deep link in the verification email to open directly in the app',
    status: 'proposed',
    owner: 'Sarah Chen',
    journeyName: 'Account Creation',
    journeyId: 'account-creation',
  },
  {
    id: 'sol-7',
    name: 'Claim Status Push Notifications',
    linkedOpp: 'Automated status updates via push at each claim milestone',
    status: 'in-progress',
    owner: 'Priya Patel',
    journeyName: 'Claims',
    journeyId: 'claims',
  },
  {
    id: 'sol-8',
    name: 'Illustrated Quote Flow',
    linkedOpp: 'Redesign quote flow with visual progress indicator and fewer steps',
    status: 'rejected',
    owner: 'Jordan Liu',
    journeyName: 'Quote to Buy',
    journeyId: 'quote-to-buy',
  },
  {
    id: 'sol-9',
    name: 'Google & Apple Calendar Sync',
    linkedOpp: 'Google Calendar and Apple Calendar integration for task due dates',
    status: 'proposed',
    owner: 'Marcus Webb',
    journeyName: 'Taskly Lifecycle',
    journeyId: 'taskly-lifecycle',
  },
  {
    id: 'sol-10',
    name: 'Referral Rewards Programme',
    linkedOpp: 'Built-in referral rewards — one month of premium per successful referral',
    status: 'in-progress',
    owner: 'Sarah Chen',
    journeyName: 'Taskly Lifecycle',
    journeyId: 'taskly-lifecycle',
  },
]

export default function GlobalSolutions() {
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all'
    ? DEMO_SOLUTIONS
    : DEMO_SOLUTIONS.filter(s => s.status === statusFilter)

  return (
    <div className="global-page">
      <div className="global-page-header">
        <div className="page-heading">Solutions</div>
        <div className="page-subheading">{DEMO_SOLUTIONS.length} solutions tracked across journeys</div>
      </div>

      <div className="global-filters">
        <div className="global-filter-group">
          <label className="global-filter-label">Status</label>
          <select
            className="global-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="proposed">Proposed</option>
            <option value="in-progress">In Progress</option>
            <option value="shipped">Shipped</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="global-table-scroll">
        <div className="global-table global-sol-table">
          <div className="global-table-head">
            <span className="gtc-sol-name">Solution</span>
            <span className="gtc-sol-opp">Linked Opportunity</span>
            <span className="gtc-sol-status">Status</span>
            <span className="gtc-sol-owner">Owner</span>
            <span className="gtc-sol-journey">Journey</span>
          </div>

          {filtered.map(sol => {
            const style = STATUS_STYLES[sol.status] ?? STATUS_STYLES.proposed
            return (
              <div key={sol.id} className="global-table-row">
                <span className="gtc-sol-name global-text-cell">{sol.name}</span>
                <span className="gtc-sol-opp global-meta-cell">{sol.linkedOpp}</span>
                <span className="gtc-sol-status">
                  <span className="global-badge" style={{ background: style.bg, color: style.text }}>
                    {STATUS_LABELS[sol.status]}
                  </span>
                </span>
                <span className="gtc-sol-owner global-meta-cell">{sol.owner}</span>
                <span className="gtc-sol-journey">
                  <Link to={`/journey/${sol.journeyId}`} className="global-journey-link">
                    {sol.journeyName}
                  </Link>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
