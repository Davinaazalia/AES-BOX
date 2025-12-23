import React, { useState } from 'react'
import './GenerateSection.css'

export default function GenerateSection({ onDataGenerated }) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('default')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const url = mode === 'random' ? '/api/generate-sbox?random=true' : '/api/generate-sbox'
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(await res.text())
      }
      
      const data = await res.json()
      
      // Get metrics if not included
      let metrics = data.metrics
      if (!metrics && data.sbox) {
        const vres = await fetch('/api/validate-sbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sbox: data.sbox })
        })
        if (vres.ok) {
          metrics = await vres.json()
        }
      }
      
      onDataGenerated({
        sbox: data.sbox,
        metrics: metrics,
        mode: mode === 'random' ? 'Random Matrix' : 'Default Matrix',
        raw: data
      })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExcel = () => {
    const url = mode === 'random' ? '/api/generate-sbox-excel?random=true' : '/api/generate-sbox-excel'
    window.location.href = url
  }

  return (
    <div className="generate-section">
      <div className="grid-2">
        <div className="card-glass">
          <h3 className="subsection-title">⚡ Quick Generate</h3>
          <p className="text-muted mb-4">Generate S-Box with affine transformation</p>
          
          <div className="mode-selector">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="default"
                checked={mode === 'default'}
                onChange={(e) => setMode(e.target.value)}
              />
              <span>Default Matrix</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="random"
                checked={mode === 'random'}
                onChange={(e) => setMode(e.target.value)}
              />
              <span>Random Matrix</span>
            </label>
          </div>

          <button
            className="btn-primary btn-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span>⚡</span>
                Generate S-Box
              </>
            )}
          </button>

          <button
            className="btn-secondary btn-full"
            onClick={handleDownloadExcel}
          >
            📥 Download Excel
          </button>
        </div>

        <div className="card-glass">
          <h3 className="subsection-title">📦 Sample S-Boxes</h3>
          <p className="text-muted mb-4">Download example S-Boxes from research paper</p>
          
          <div className="sample-links">
            <a href="/download-example/sbox1" className="sample-btn">
              📄 Sample S-Box 1
            </a>
            <a href="/download-example/sbox2" className="sample-btn">
              📄 Sample S-Box 2
            </a>
            <a href="/download-example/sbox3" className="sample-btn">
              📄 Sample S-Box 3
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
