import React, { useState } from 'react'
import MetricsCard from './MetricsCard'
import SboxTable from './SboxTable'
import HistogramChart from './HistogramChart'
import './UploadForm.css'

export default function UploadForm() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setResult(null)
    setAnalysisData(null)

    const formData = new FormData(e.target)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await res.json()
      
      if (!data.valid) {
        setResult({
          success: false,
          message: data.message || 'S-Box validation failed'
        })
        return
      }

      setAnalysisData(data)
      setResult({
        success: true,
        message: 'S-Box uploaded and analyzed successfully!'
      })

    } catch (err) {
      setResult({
        success: false,
        message: 'Error: ' + err.message
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-section">
      <div className="card-glass">
        <h3 className="subsection-title">📤 Upload S-Box</h3>
        <p className="text-muted mb-4">
          Upload S-Box file (Excel 16×16 matrix, CSV, TXT, or JSON) for complete analysis with optional image encryption test
        </p>

        {!analysisData && (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label className="form-label">S-Box File *</label>
              <input
                type="file"
                name="sbox"
                accept=".xlsx,.xls,.csv,.txt,.json"
                className="form-input"
                required
              />
              <small className="form-hint">Formats: Excel (.xlsx/.xls), CSV, TXT, JSON | Must contain 256 unique values</small>
            </div>

            <div className="form-group">
              <label className="form-label">Sample Image (Optional)</label>
              <input
                type="file"
                name="sample_img"
                accept="image/*"
                className="form-input"
              />
              <small className="form-hint">For NPCR and entropy testing</small>
            </div>

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analyze S-Box
                </>
              )}
            </button>
          </form>
        )}

        {result && (
          <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
            {result.message}
          </div>
        )}
      </div>

      {analysisData && (
        <div className="results">
          <div className="results-header">
            <h2 className="section-title">Analysis Results</h2>
            <button 
              className="btn-secondary"
              onClick={() => {
                setAnalysisData(null)
                setResult(null)
              }}
            >
              ← Upload New
            </button>
          </div>

          {analysisData.metrics && (
            <div className="metrics-grid">
              <MetricsCard
                label="Bijective"
                value={analysisData.bijective ? 'True' : 'False'}
                status={analysisData.bijective}
              />
              <MetricsCard
                label="Balanced"
                value={analysisData.balanced ? 'True' : 'False'}
                status={analysisData.balanced}
              />
              <MetricsCard
                label="SAC"
                value={analysisData.sac ? 'True' : 'False'}
                status={analysisData.sac}
              />
              <MetricsCard
                label="Nonlinearity"
                value={analysisData.nonlinearity || '-'}
                status={true}
              />
              <MetricsCard
                label="Diff. Uniformity"
                value={analysisData.differential_uniformity || '-'}
                status={true}
              />
            </div>
          )}

          {analysisData.sbox && (
            <SboxTable sbox={analysisData.sbox} />
          )}

          {analysisData.image_analysis && (
            <div className="card-glass">
              <h3 className="subsection-title">🖼️ Image Analysis</h3>
              <div className="metrics-grid">
                <MetricsCard
                  label="Entropy"
                  value={analysisData.image_analysis.entropy}
                  status={true}
                />
                <MetricsCard
                  label="NPCR (%)"
                  value={analysisData.image_analysis.npcr}
                  status={true}
                />
              </div>

              {/* Grayscale Histogram */}
              {analysisData.image_analysis.hist_plain && analysisData.image_analysis.hist_cipher && (
                <div className="histogram-grid">
                  <HistogramChart
                    data={analysisData.image_analysis.hist_plain}
                    title="Grayscale Histogram - Plaintext"
                    type="grayscale"
                  />
                  <HistogramChart
                    data={analysisData.image_analysis.hist_cipher}
                    title="Grayscale Histogram - Ciphertext"
                    type="grayscale"
                  />
                </div>
              )}

              {/* RGB Histogram */}
              {analysisData.image_analysis.hist_rgb_plain && analysisData.image_analysis.hist_rgb_cipher && (
                <div className="histogram-grid">
                  <HistogramChart
                    data={analysisData.image_analysis.hist_rgb_plain}
                    title="RGB Histogram - Plaintext"
                    type="rgb"
                  />
                  <HistogramChart
                    data={analysisData.image_analysis.hist_rgb_cipher}
                    title="RGB Histogram - Ciphertext"
                    type="rgb"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
