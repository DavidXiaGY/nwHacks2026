import { Paperclip } from 'lucide-react'

function WishlistItemRow({ item, onDonateItem, onDropDonation, currentUserId }) {
  // Check if item is held by current user
  const isHeldByCurrentUser = item.status === 'HELD' && item.heldByUserId === currentUserId

  // Determine background color and text based on status
  const getStatusStyles = (status) => {
    switch (status) {
      case 'HELD':
        // If held by current user, show different styling
        if (isHeldByCurrentUser) {
          return {
            backgroundColor: '#FFF4E6', // Light orange/yellow for user's own hold
            color: '#06404D',
            message: null // No message, show button instead
          }
        }
        return {
          backgroundColor: '#E3F2FD', // Light blue
          color: '#06404D',
          message: 'Someone is currently working on this order!'
        }
      case 'PURCHASED':
        return {
          backgroundColor: '#E8F5E9', // Light green
          color: '#06404D',
          message: 'This order has been fulfilled!'
        }
      case 'VERIFYING':
        // VERIFYING shows as fulfilled (green) from donor's perspective
        return {
          backgroundColor: '#E8F5E9', // Light green - same as PURCHASED
          color: '#06404D',
          message: 'This order has been fulfilled!'
        }
      default: // AVAILABLE
        return {
          backgroundColor: '#FFFFFF',
          color: '#06404D',
          message: null
        }
    }
  }

  const statusStyles = getStatusStyles(item.status)

  return (
    <div
      style={{
        backgroundColor: statusStyles.backgroundColor,
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <Paperclip 
          size={16} 
          style={{ 
            color: statusStyles.color,
            flexShrink: 0
          }} 
        />
        <span
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '140%',
            color: statusStyles.color,
          }}
        >
          {item.name}
        </span>
      </div>
      
      {statusStyles.message ? (
        <span
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: statusStyles.color,
            marginLeft: '12px',
          }}
        >
          {statusStyles.message}
        </span>
      ) : isHeldByCurrentUser ? (
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <button
            onClick={() => onDonateItem && onDonateItem(item)}
            style={{
              backgroundColor: '#EB8E89',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D87A75'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EB8E89'
            }}
          >
            Continue Donation
          </button>
          <button
            onClick={() => onDropDonation && onDropDonation(item)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#EB8E89',
              border: '1px solid #EB8E89',
              borderRadius: '6px',
              padding: '6px 12px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FFF5F5'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FFFFFF'
            }}
          >
            Drop Donation
          </button>
        </div>
      ) : (
        <button
          onClick={() => onDonateItem && onDonateItem(item)}
          style={{
            backgroundColor: '#EB8E89',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '12px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#D87A75'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#EB8E89'
          }}
        >
          Donate Item
        </button>
      )}
    </div>
  )
}

export default WishlistItemRow
