function ChildInfoCard({ child, onClick }) {
  if (!child) {
    return null
  }

  const { firstName, age, gender, wishlist = [], interests } = child

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-6 cursor-pointer"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
      }}
    >
      {/* Name - 32px, all caps, Red Hat Display 900, 120% line height */}
      <h2
        className="mb-4"
        style={{
          fontFamily: "'Red Hat Display', sans-serif",
          fontSize: '32px',
          fontWeight: 900,
          lineHeight: '120%',
          color: '#06404D',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        {firstName?.toUpperCase() || 'CHILD'}
      </h2>

      {/* Age and Gender - 24px, Manrope 400, 140% line height */}
      <p
        className="mb-6"
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '24px',
          fontWeight: 400,
          lineHeight: '140%',
          color: '#06404D',
          marginBottom: '16px',
        }}
      >
        {age ? `${age} years old` : 'Age not specified'}
        {gender && `, ${gender}`}
      </p>

      {/* Wishlist Section */}
      {wishlist && wishlist.length > 0 && (
        <div className="mb-6" style={{ marginBottom: '16px' }}>
          {/* Eyebrow: WISHLIST - Red Hat Display 900, 100% line height, 0.42px letter spacing, #EB8E89 */}
          <p
            className="mb-2"
            style={{
              fontFamily: "'Red Hat Display', sans-serif",
              fontWeight: 900,
              lineHeight: '100%',
              letterSpacing: '0.42px',
              color: '#EB8E89',
              textTransform: 'uppercase',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            WISHLIST
          </p>

          {/* Wishlist Items - Manrope 400, 140% line height, #06404D, no bullets, each on own line */}
          <div>
            {wishlist.map((item, index) => (
              <p
                key={item.id || index}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '140%',
                  color: '#06404D',
                  marginBottom: '4px',
                }}
              >
                {item.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Interests Section */}
      {interests && (
        <div>
          {/* Eyebrow: INTERESTS - Red Hat Display 900, 100% line height, 0.42px letter spacing, #EB8E89 */}
          <p
            className="mb-2"
            style={{
              fontFamily: "'Red Hat Display', sans-serif",
              fontWeight: 900,
              lineHeight: '100%',
              letterSpacing: '0.42px',
              color: '#EB8E89',
              textTransform: 'uppercase',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            INTERESTS
          </p>

          {/* Interests Paragraph - Manrope 400, 140% line height, #06404D */}
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%',
              color: '#06404D',
            }}
          >
            {interests}
          </p>
        </div>
      )}
    </div>
  )
}

export default ChildInfoCard
