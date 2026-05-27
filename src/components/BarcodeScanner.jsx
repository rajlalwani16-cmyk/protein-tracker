import { useEffect, useRef, useState } from 'react'

export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectingRef = useRef(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('Starting camera…')

  useEffect(() => {
    let detector = null
    let animId = null

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        if ('BarcodeDetector' in window) {
          detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          })
          setStatus('Point at a barcode')
          scan()
        } else {
          setStatus('Barcode detection not supported on this device. Try manual search.')
        }
      } catch (err) {
        setError(err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Could not access camera: ' + err.message)
      }
    }

    async function scan() {
      if (!detectingRef.current || !videoRef.current || !detector) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          detectingRef.current = false
          if ('vibrate' in navigator) navigator.vibrate([50, 30, 50])
          onDetect(barcodes[0].rawValue)
          return
        }
      } catch { /* continue scanning */ }
      animId = requestAnimationFrame(scan)
    }

    start()

    return () => {
      detectingRef.current = false
      cancelAnimationFrame(animId)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [onDetect])

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <button className="scanner-close" onClick={onClose} aria-label="Close scanner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="scanner-title">Scan Barcode</span>
      </div>

      {error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 32, textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📷</div>
          <p style={{ lineHeight: 1.6 }}>{error}</p>
          <button className="btn btn--ghost" style={{ marginTop: 24 }} onClick={onClose}>
            Go back
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="scanner-video"
            playsInline
            muted
            autoPlay
          />
          <div className="scanner-frame">
            <div className="scanner-box">
              <div className="scanner-line" />
            </div>
          </div>
          <div className="scanner-hint">{status}</div>
        </>
      )}
    </div>
  )
}
