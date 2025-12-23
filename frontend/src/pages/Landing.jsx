import React from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <span className="icon">🔐</span>
            <span className="brand">S-Box Analyzer</span>
          </div>
          <Link to="/analyzer" className="btn-nav">Launch App</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Analyze & Generate
              <br />
              <span className="gradient-text">AES S-Box</span>
            </h1>
            <p className="hero-subtitle">
              Powerful cryptographic S-Box analysis tool with matrix exploration,
              validation, and image encryption testing capabilities.
            </p>
            <div className="hero-actions">
              <Link to="/analyzer" className="btn-primary">
                Get Started
                <span className="arrow">→</span>
              </Link>
              <a href="#features" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="sbox-preview">
              <div className="matrix-glow"></div>
              <div className="matrix-text">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="matrix-row">
                    {Array.from({ length: 8 }, (_, j) => (
                      <span key={j} className="hex-digit">
                        {Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Generation</h3>
              <p>Generate S-Box instantly with default or random affine matrix transformations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Deep Analysis</h3>
              <p>Validate bijective, balanced, SAC, nonlinearity, and differential uniformity properties.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧪</div>
              <h3>Matrix Explorer</h3>
              <p>Explore candidate affine matrices and rank by cryptographic strength.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Visual Metrics</h3>
              <p>Interactive visualization of S-Box tables, bit balance, and avalanche effect.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h3>Image Testing</h3>
              <p>Test S-Box with image encryption and calculate NPCR, entropy metrics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📥</div>
              <h3>Import/Export</h3>
              <p>Upload Excel files or download generated S-Box for further analysis.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-container">
          <h2 className="cta-title">Ready to Analyze?</h2>
          <p className="cta-subtitle">Start exploring cryptographic S-Box properties now</p>
          <Link to="/analyzer" className="btn-primary btn-large">
            Launch Analyzer
            <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 S-Box Analyzer. Built for cryptographic research.</p>
        </div>
      </footer>
    </div>
  )
}
