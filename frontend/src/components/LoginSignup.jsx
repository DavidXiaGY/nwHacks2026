import { useState } from 'react'

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'DONATOR'
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
      if (isLogin) {
        // Login logic
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
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
          throw new Error(data.message || 'Login failed')
        }

        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        console.log('Login successful:', data)
        setSuccess(`Welcome back, ${data.user.displayName || data.user.email}! Login successful.`)
        window.alert(`Welcome back, ${data.user.displayName || data.user.email}! Login successful.`)
        // TODO: Redirect to dashboard or home page
        
      } else {
        // Sign-up logic
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
        window.alert(`Welcome, ${data.user.displayName}! Your account has been created successfully.`)
        // TODO: Redirect to dashboard or home page
      }
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

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      displayName: '',
      role: 'DONATOR'
    })
  }

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      
      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {!isLogin && (
          <>
            <div>
              <label htmlFor="displayName">Display Name:</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="DONATOR">Donator</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <div>
        <button type="button" onClick={toggleMode}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  )
}

export default LoginSignup
