import { useState, useEffect } from 'react'

function DonationPopup({ item, holdExpiresAt, onClose, onSuccess }) {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [formData, setFormData] = useState({
    receiptUrl: '',
    orderId: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate time remaining and update every second
  useEffect(() => {
    if (!holdExpiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const expires = new Date(holdExpiresAt)
      const diff = expires - now

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds, expired: false })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [holdExpiresAt])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login again.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.id,
          orderId: formData.orderId.trim() || undefined,
          proofUrl: formData.receiptUrl.trim() || undefined,
          notes: formData.notes.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit donation')
      }

      // Success - call onSuccess callback
      if (onSuccess) {
        onSuccess(data)
      }
      
      // Close popup
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit donation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = () => {
    if (!timeRemaining) return 'Loading...'
    if (timeRemaining.expired) return 'Expired'
    
    const { hours, minutes, seconds } = timeRemaining
    const h = String(hours).padStart(2, '0')
    const m = String(minutes).padStart(2, '0')
    const s = String(seconds).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: "'Red Hat Display', sans-serif",
              fontSize: '32px',
              fontWeight: 900,
              color: '#06404D',
              marginBottom: '8px',
            }}
          >
            Submit Donation
          </h2>
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#06404D',
            }}
          >
            {item.name}
          </p>
        </div>

        {/* Countdown Timer */}
        {timeRemaining && (
          <div
            style={{
              backgroundColor: timeRemaining.expired ? '#f8d7da' : '#E3F2FD',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#06404D',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Time Remaining
            </p>
            <p
              style={{
                fontFamily: "'Red Hat Display', sans-serif",
                fontSize: '36px',
                fontWeight: 900,
                color: timeRemaining.expired ? '#721c24' : '#06404D',
                letterSpacing: '2px',
              }}
            >
              {formatTime()}
            </p>
            {timeRemaining.expired && (
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#721c24',
                  marginTop: '8px',
                }}
              >
                Your hold has expired. Please hold the item again to submit.
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '24px',
              borderRadius: '8px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              htmlFor="receiptUrl"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#06404D',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Receipt URL
            </label>
            <input
              type="url"
              id="receiptUrl"
              name="receiptUrl"
              value={formData.receiptUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/receipt.jpg"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="orderId"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#06404D',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              placeholder="e.g., AMZ123456789"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#06404D',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information about your donation"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#06384D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#052A35'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#06384D'
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (timeRemaining && timeRemaining.expired)}
              style={{
                flex: 1,
                backgroundColor: loading || (timeRemaining && timeRemaining.expired) ? '#ccc' : '#EB8E89',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading || (timeRemaining && timeRemaining.expired) ? 'not-allowed' : 'pointer',
                opacity: loading || (timeRemaining && timeRemaining.expired) ? 0.6 : 1,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && (!timeRemaining || !timeRemaining.expired)) {
                  e.target.style.backgroundColor = '#D87A75'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && (!timeRemaining || !timeRemaining.expired)) {
                  e.target.style.backgroundColor = '#EB8E89'
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DonationPopup
