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
        height: 'auto',
        minHeight: 'auto',
        transition: 'background-color 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#E8E8E8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF'
      }}
    >
      {/* Top Section: Name and Age/Gender */}
      <div>
        {/* Name - 32px, all caps, Red Hat Display 900, 120% line height */}
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Red Hat Display', sans-serif",
            fontSize: '24px',
            fontWeight: 900,
            lineHeight: '120%',
            color: '#06404D',
            textTransform: 'uppercase',
            marginBottom: '0px',
          }}
        >
          {firstName?.toUpperCase() || 'CHILD'}
        </h2>

        {/* Age and Gender - 16px, Manrope 400, 140% line height */}
        {(age != null || (gender != null && String(gender).trim() !== '')) && (
          <p
            className="mb-6"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%',
              color: '#06404D',
              marginBottom: '0px',
            }}
          >
            {age != null ? `${age} years old` : ''}
            {age != null && gender != null && String(gender).trim() !== '' ? ', ' : ''}
            {gender != null && String(gender).trim() !== '' ? String(gender) : ''}
          </p>
        )}
      </div>

      {/* Bottom Section: Wishlist and Interests - 64px gap from top section */}
      {((wishlist && wishlist.length > 0) || (interests != null && String(interests).trim() !== '')) && (
        <div style={{ marginTop: '64px' }}>
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
                  marginBottom: '4px',
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
          {interests != null && String(interests).trim() !== '' && (
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
                  marginBottom: '4px',
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
      )}
    </div>
  )
}

export default ChildInfoCard
