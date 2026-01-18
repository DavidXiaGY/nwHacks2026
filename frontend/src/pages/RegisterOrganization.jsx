import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterBackground from '../assets/RegisterBackground.png'

// Styles for placeholder text
const placeholderStyle = `
  .signup-input::placeholder {
    color: #12707C;
    font-family: 'Manrope', sans-serif;
    font-size: 16px;
    font-weight: 400;
    opacity: 1;
  }
  .signup-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2306384D' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }
  button:visited {
    color: inherit;
  }
  a:visited {
    color: inherit;
  }
`

function RegisterOrganization() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'ORGANIZER'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role
        })
      })

      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || 'Server error: Invalid response')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Sign-up failed')
      }

      // Store token if provided
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      console.log('Sign-up successful:', data)
      setSuccess(`Welcome, ${data.user.displayName}! Your account has been created successfully.`)
      
      // Redirect to organizer upload
      setTimeout(() => {
        navigate('/organizer-upload')
      }, 1000)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please ensure the backend is running.')
      } else {
        setError(err.message || 'An error occurred. Please try again.')
      }
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{placeholderStyle}</style>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#F3F3F3',
          backgroundImage: `url(${RegisterBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
        }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #06384D',
        borderRadius: 0,
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <h1 style={{
          color: '#06384D',
          fontSize: '32px',
          fontWeight: 700,
          textAlign: 'center',
          margin: 0,
          fontFamily: "'Red Hat Display', sans-serif",
        }}>
          Register Your Organization Today
        </h1>
        
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #06384D',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: "'Manrope', sans-serif",
                color: '#06384D',
                boxSizing: 'border-box',
              }}
              className="signup-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your 6 character password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #06384D',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: "'Manrope', sans-serif",
                color: '#06384D',
                boxSizing: 'border-box',
              }}
              className="signup-input"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="sr-only">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              required
              placeholder="Enter your display name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #06384D',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: "'Manrope', sans-serif",
                color: '#06384D',
                boxSizing: 'border-box',
              }}
              className="signup-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: 'auto',
              padding: '12px 24px',
              backgroundColor: '#12707C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: "'Red Hat Display', sans-serif",
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              alignSelf: 'center',
            }}
          >
            {loading ? 'Processing...' : 'SIGN UP'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', textAlign: 'center', fontSize: '14px', fontFamily: "'Manrope', sans-serif", color: '#06384D' }}>
          <p style={{ margin: 0, color: '#EB8E89' }}>
            Want to donate?{' '}
            <button
              type="button"
              onClick={() => {
                navigate('/login?mode=signup')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#EB8E89',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              Sign Up
            </button>
          </p>
          <p style={{ margin: 0, color: '#EB8E89' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#EB8E89',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}

export default RegisterOrganization
