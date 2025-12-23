import React, { useState } from 'react'
import './SboxTable.css'

export default function SboxTable({ sbox }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!sbox || sbox.length !== 256) return

    let csv = ''
    for (let row = 0; row < 16; row++) {
      const rowData = []
      for (let col = 0; col < 16; col++) {
        const val = sbox[row * 16 + col]
        rowData.push(val.toString(16).toUpperCase().padStart(2, '0'))
      }
      csv += rowData.join(',') + '\n'
    }

    try {
      await navigator.clipboard.writeText(csv)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy')
    }
  }

  if (!sbox || sbox.length !== 256) {
    return (
      <div className="card-glass">
        <p className="text-muted">Invalid S-Box data</p>
      </div>
    )
  }

  return (
    <div className="card-glass sbox-section">
      <div className="sbox-header">
        <h3 className="subsection-title">🔢 S-Box Matrix (16×16)</h3>
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy CSV'}
        </button>
      </div>
      <div className="sbox-table-wrapper">
        <table className="sbox-table">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: 16 }, (_, i) => (
                <th key={i}>{i.toString(16).toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 16 }, (_, row) => (
              <tr key={row}>
                <th>{row.toString(16).toUpperCase()}</th>
                {Array.from({ length: 16 }, (_, col) => {
                  const val = sbox[row * 16 + col]
                  return (
                    <td key={col}>
                      {val.toString(16).toUpperCase().padStart(2, '0')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
