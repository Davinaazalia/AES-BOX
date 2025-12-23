import React from 'react'
import './MetricsCard.css'

export default function MetricsCard({ label, value, status }) {
  const getValueClass = () => {
    if (typeof status === 'boolean') {
      return status ? 'value-true' : 'value-false'
    }
    return ''
  }

  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${getValueClass()}`}>
        {value}
      </div>
    </div>
  )
}
