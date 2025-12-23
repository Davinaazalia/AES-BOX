import React, { useEffect, useRef } from 'react'
import './HistogramChart.css'

export default function HistogramChart({ data, title, type = 'grayscale' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data) {
      console.log('❌ Missing canvas or data:', { canvas: !!canvasRef.current, data })
      return
    }

    console.log('📊 Rendering histogram:', { title, type, data })

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to actual display size
    const rect = canvas.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = rect.width * pixelRatio
    canvas.height = rect.height * pixelRatio
    ctx.scale(pixelRatio, pixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.fillStyle = '#0f0a1f'
    ctx.fillRect(0, 0, width, height)

    // Draw border
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2)

    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2
    
    // Get data based on type
    let dataPoints = []
    if (type === 'grayscale') {
      dataPoints = data && Array.isArray(data) ? data : []
    } else if (type === 'rgb') {
      dataPoints = (data && data.r && Array.isArray(data.r)) ? data.r : []
    }

    console.log('📈 Data points:', { type, count: dataPoints.length, sample: dataPoints.slice(0, 5) })

    if (!dataPoints || dataPoints.length === 0) {
      console.warn('⚠️ No data points to render')
      return
    }

    const maxValue = Math.max(...dataPoints)
    const barWidth = plotWidth / dataPoints.length

    console.log('📊 Render params:', { maxValue, barWidth, plotWidth, plotHeight })

    // Draw histogram bars
    if (type === 'grayscale') {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.7)'
      dataPoints.forEach((value, index) => {
        if (maxValue > 0) {
          const barHeight = (value / maxValue) * plotHeight
          const x = padding + index * barWidth
          const y = padding + plotHeight - barHeight
          ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight)
        }
      })
    } else {
      // RGB histogram - each channel has independent scaling for better visibility
      const colors = [
        { color: 'rgba(255, 0, 0, 0.5)', data: data.r || [] },
        { color: 'rgba(0, 255, 0, 0.5)', data: data.g || [] },
        { color: 'rgba(0, 0, 255, 0.5)', data: data.b || [] }
      ]

      colors.forEach((channel, channelIdx) => {
        if (!channel.data || channel.data.length === 0) {
          console.warn(`⚠️ Missing ${['R', 'G', 'B'][channelIdx]} channel data`)
          return
        }
        ctx.fillStyle = channel.color
        const maxChannel = Math.max(...channel.data)
        if (maxChannel === 0) {
          console.warn(`⚠️ Channel ${channelIdx} has no data`)
          return
        }
        channel.data.forEach((value, index) => {
          const barHeight = (value / maxChannel) * plotHeight
          const x = padding + index * barWidth + (barWidth / 3) * channelIdx
          const y = padding + plotHeight - barHeight
          ctx.fillRect(x, y, Math.max(barWidth / 3 - 1, 1), barHeight)
        })
      })
    }

    // Draw axes labels
    ctx.fillStyle = '#a78bfa'
    ctx.font = '12px Segoe UI'
    ctx.textAlign = 'center'
    
    // X-axis labels (0, 64, 128, 192, 255)
    const xLabels = [0, 64, 128, 192, 255]
    xLabels.forEach(val => {
      const x = padding + (val / 255) * plotWidth
      ctx.fillText(val.toString(), x, height - 10)
    })

    // Y-axis label
    ctx.save()
    ctx.translate(10, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Frequency', 0, 0)
    ctx.restore()

    console.log('✅ Histogram rendered successfully')

  }, [data, type])

  return (
    <div className="histogram-wrapper">
      <h4 className="histogram-title">{title}</h4>
      <canvas
        ref={canvasRef}
        className="histogram-canvas"
        style={{
          width: '100%',
          height: '250px',
          display: 'block'
        }}
      />
    </div>
  )
}
