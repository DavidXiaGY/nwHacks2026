import { Paperclip } from 'lucide-react'

function WishlistItemRow({ item, onDonateItem, onDropDonation, currentUserId, isLast }) {
  // Check if item is held by current user
  const isHeldByCurrentUser = item.status === 'HELD' && item.heldByUserId === currentUserId

  // Check if item is held by someone else
  const isHeldBySomeoneElse = item.status === 'HELD' && item.heldByUserId !== currentUserId

  // Check if item is fulfilled
  const isFulfilled = item.status === 'PURCHASED' || item.status === 'VERIFYING'

  // Determine if item is available for donation
  const isAvailable = item.status === 'AVAILABLE' || isHeldByCurrentUser

  // Determine background and text colors based on state
  let backgroundColor = 'transparent'
  let textColor = '#06404D'
  
  if (isFulfilled) {
    backgroundColor = '#DEFFEB'
    textColor = '#648E9F'
  } else if (isHeldBySomeoneElse) {
    backgroundColor = '#DBF4FF'
    textColor = '#648E9F'
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: isLast ? 'none' : '1px solid #EB8E89',
          backgroundColor: backgroundColor
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Paperclip 
            size={16} 
            style={{ 
              color: textColor,
              flexShrink: 0
            }} 
          />
          {isFulfilled ? (
            // Fulfilled state: no link, just text
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '140%',
                color: textColor
              }}
            >
              {item.name}
            </span>
          ) : item.externalLink ? (
            <a
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '140%',
                color: textColor,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {item.name}
            </a>
          ) : (
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '140%',
                color: textColor,
                textDecoration: 'underline'
              }}
            >
              {item.name}
            </span>
          )}
        </div>
        
        {isAvailable && onDonateItem && (
          <button
            onClick={() => onDonateItem(item)}
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
              whiteSpace: 'nowrap',
              transition: 'background-color 300ms ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#06404D'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EB8E89'
            }}
          >
            DONATE ITEM
          </button>
        )}
        {isHeldByCurrentUser && onDropDonation && (
          <button
            onClick={() => onDropDonation(item)}
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
              marginLeft: '12px',
              whiteSpace: 'nowrap',
              transition: 'background-color 300ms ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FFF5F5'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FFFFFF'
            }}
          >
            DROP DONATION
          </button>
        )}
        {isFulfilled && (
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: textColor,
              marginLeft: '12px'
            }}
          >
            This order has been fulfilled!
          </span>
        )}
        {isHeldBySomeoneElse && (
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: textColor,
              marginLeft: '12px'
            }}
          >
            Someone is currently working on this order!
          </span>
        )}
      </div>
    </div>
  )
}

export default WishlistItemRow
