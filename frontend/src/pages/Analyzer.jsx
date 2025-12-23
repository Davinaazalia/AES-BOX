import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MetricsCard from '../components/MetricsCard'
import SboxTable from '../components/SboxTable'
import GenerateSection from '../components/GenerateSection'
import UploadForm from '../components/UploadForm'
import './Analyzer.css'

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('generate')
  const [generatedData, setGeneratedData] = useState(null)

  return (
    <div className="analyzer">
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="icon">🔐</span>
            <span className="brand">S-Box Analyzer</span>
          </Link>
          <Link to="/" className="btn-nav">← Back to Home</Link>
        </div>
      </nav>

      <div className="container">
        <div className="header">
          <h1 className="page-title">
            <span className="gradient-text">S-Box Analyzer</span>
          </h1>
          <p className="page-subtitle">Step 3 & 4: Upload/Generate S-Box → Test Properties → Final Selection</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            ⚡ Generate S-Box
          </button>
          <button
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload & Analyze
          </button>
        </div>

        <div className="content">
          {activeTab === 'generate' ? (
            <GenerateSection onDataGenerated={setGeneratedData} />
          ) : (
            <UploadForm />
          )}
        </div>

        {generatedData && activeTab === 'generate' && (
          <div className="results">
            <div className="results-header">
              <h2 className="section-title">Analysis Results</h2>
              <span className="badge">{generatedData.mode || 'Default'}</span>
            </div>

            {generatedData.metrics && (
              <div className="metrics-grid">
                <MetricsCard
                  label="Bijective"
                  value={generatedData.metrics.bijective ? 'True' : 'False'}
                  status={generatedData.metrics.bijective}
                />
                <MetricsCard
                  label="Balanced"
                  value={generatedData.metrics.balanced ? 'True' : 'False'}
                  status={generatedData.metrics.balanced}
                />
                <MetricsCard
                  label="SAC"
                  value={generatedData.metrics.sac ? 'True' : 'False'}
                  status={generatedData.metrics.sac}
                />
                <MetricsCard
                  label="Nonlinearity"
                  value={generatedData.metrics.nonlinearity || '-'}
                  status={true}
                />
                <MetricsCard
                  label="Diff. Uniformity"
                  value={generatedData.metrics.differential_uniformity || generatedData.metrics.diff_uniformity || '-'}
                  status={true}
                />
              </div>
            )}

            {generatedData.sbox && (
              <SboxTable sbox={generatedData.sbox} />
            )}

            {generatedData.raw && (
              <div className="card-glass code-section">
                <h3 className="subsection-title">📄 Raw JSON</h3>
                <pre className="code-block">{JSON.stringify(generatedData.raw, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
