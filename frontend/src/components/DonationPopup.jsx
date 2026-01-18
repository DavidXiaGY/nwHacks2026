import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'

function DonationPopup({ item, childName, isOpen, onClose, onConfirm }) {
  const [proofFile, setProofFile] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Calculate time remaining based on holdExpiresAt
  useEffect(() => {
    if (!isOpen || !item?.holdExpiresAt) return

    const calculateTimeRemaining = () => {
      const now = new Date()
      const expiresAt = new Date(item.holdExpiresAt)
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeRemaining(null)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [isOpen, item?.holdExpiresAt])

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
    }
  }

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setProofFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Handle confirmation
  const handleConfirm = async () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number')
      return
    }

    setIsUploading(true)
    try {
      // Upload proof file if provided
      let proofUrl = null
      if (proofFile) {
        // TODO: Implement file upload to storage service
        // For now, we'll use a placeholder or base64
        // In production, upload to S3, Cloudinary, etc.
        proofUrl = URL.createObjectURL(proofFile)
      }

      await onConfirm({
        itemId: item.id,
        orderId: trackingNumber,
        proofUrl,
        proofFile // Pass file separately if needed for upload
      })
      
      // Reset form
      setProofFile(null)
      setTrackingNumber('')
    } catch (error) {
      console.error('Error confirming donation:', error)
      alert('Failed to confirm donation. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  const formatTime = (time) => {
    if (!time) return '00:00:00'
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
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
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row - Proof of Purchase (left) and Timer (right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0px',
          }}
        >
          {/* Proof of Purchase - Top Left */}
          <h2
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#06404D',
              margin: 0,
            }}
          >
            Proof of Purchase
          </h2>

          {/* Timer - Top Right */}
          {timeRemaining ? (
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#F2ABA7',
                margin: 0,
              }}
            >
              {formatTime(timeRemaining)} left
            </p>
          ) : (
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#F2ABA7',
                margin: 0,
              }}
            >
              Expired
            </p>
          )}
        </div>

        {/* Title - Item Name */}
        <h1
          style={{
            fontFamily: "'Red Hat Display', sans-serif",
            fontSize: '32px',
            fontWeight: 900,
            color: '#06404D',
            marginBottom: '24px',
          }}
        >
          {item?.name || 'Item'}
        </h1>

        {/* Upload Heading */}
        <h3
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#EB8E89',
            marginBottom: '8px',
          }}
        >
          Upload your proof of purchase
        </h3>

        {/* Upload Area */}
        <div
          style={{
            border: '1px solid #EB8E89',
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: proofFile ? '#FFF5F5' : '#FFFFFF',
            transition: 'background-color 0.2s',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('proof-upload').click()}
        >
          <input
            id="proof-upload"
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload
            size={32}
            style={{
              color: '#EB8E89',
              marginBottom: '8px',
              display: 'block',
              margin: '0 auto 8px',
            }}
          />
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: '#EB8E89',
            }}
          >
            {proofFile ? proofFile.name : 'Accept PNG, JPG, PDF'}
          </p>
        </div>

        {/* Tracking Number Heading */}
        <h3
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#EB8E89',
            marginBottom: '8px',
          }}
        >
          Enter Your Tracking Number
        </h3>

        {/* Tracking Number Input */}
        <div style={{ marginBottom: '24px' }}>
          <style>
            {`
              #tracking-number-input::placeholder {
                color: #EB8E89;
              }
            `}
          </style>
          <input
            id="tracking-number-input"
            type="text"
            placeholder="Eg. 1Z9999999999999999"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #EB8E89',
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              color: '#06404D',
              outline: 'none',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              border: '1px solid #EB8E89',
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#EB8E89',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            BACK
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUploading || !timeRemaining}
            style={{
              flex: 1,
              backgroundColor: '#EB8E89',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: isUploading || !timeRemaining ? 'not-allowed' : 'pointer',
              opacity: isUploading || !timeRemaining ? 0.6 : 1,
            }}
          >
            {isUploading ? 'PROCESSING...' : 'CONFIRM PURCHASE'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DonationPopup
