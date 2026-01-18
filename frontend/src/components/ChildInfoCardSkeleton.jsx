export default function ChildInfoCardSkeleton() {
  return (
    <div
      className="bg-white rounded-3xl p-6"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        height: 'auto',
        minHeight: 'auto',
      }}
    >
      {/* Top Section: Name and Age/Gender */}
      <div>
        <div 
          className="rounded mb-4 animate-pulse"
          style={{ 
            height: '24px', 
            width: '50%', 
            backgroundColor: '#E0E0E0' 
          }}
        ></div>
        <div 
          className="rounded animate-pulse"
          style={{ 
            height: '16px', 
            width: '33%', 
            backgroundColor: '#E0E0E0' 
          }}
        ></div>
      </div>

      {/* Bottom Section: Wishlist and Interests */}
      <div style={{ marginTop: '64px' }}>
        <div 
          className="rounded mb-2 animate-pulse"
          style={{ 
            height: '14px', 
            width: '80px', 
            backgroundColor: '#E0E0E0' 
          }}
        ></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div 
            className="rounded animate-pulse"
            style={{ 
              height: '16px', 
              width: '100%', 
              backgroundColor: '#E0E0E0' 
            }}
          ></div>
          <div 
            className="rounded animate-pulse"
            style={{ 
              height: '16px', 
              width: '75%', 
              backgroundColor: '#E0E0E0' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
