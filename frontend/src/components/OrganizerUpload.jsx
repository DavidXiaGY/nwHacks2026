import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function OrganizerUpload() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [existingOrphanageId, setExistingOrphanageId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    latitude: '',
    longitude: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = '/api'

  useEffect(() => {
    // Check if user is logged in and is organizer
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    try {
      const userObj = JSON.parse(userData)
      if (userObj.role !== 'ORGANIZER') {
        navigate('/login')
        return
      }
      setUser(userObj)
      // Check for existing orphanage after setting user
      checkExistingOrphanage(token)
    } catch (e) {
      console.error('Error parsing user data:', e)
      navigate('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkExistingOrphanage = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orphanages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const orphanages = await response.json()
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          const existingOrphanage = orphanages.find(org => org.organizer.id === user.id)
          
          if (existingOrphanage) {
            setExistingOrphanageId(existingOrphanage.id)
            setMessage({ 
              text: `You have an orphanage registered: "${existingOrphanage.name}". You can update it below.`, 
              type: 'info' 
            })
            // Pre-fill form with existing data
            setFormData({
              name: existingOrphanage.name || '',
              description: existingOrphanage.description || '',
              website: existingOrphanage.website || '',
              contactEmail: existingOrphanage.contactEmail || '',
              latitude: existingOrphanage.latitude?.toString() || '',
              longitude: existingOrphanage.longitude?.toString() || ''
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing orphanage:', error)
      // Don't block rendering if this fails
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.latitude.trim() !== '' && 
           formData.longitude.trim() !== '' &&
           !isNaN(parseFloat(formData.latitude)) &&
           !isNaN(parseFloat(formData.longitude))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setMessage({ text: 'Please login again.', type: 'error' })
      logout()
      return
    }

    const submitData = {
      name: formData.name,
      description: formData.description || undefined,
      website: formData.website || undefined,
      contactEmail: formData.contactEmail || undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      // Use PUT if updating existing orphanage, POST if creating new one
      const method = existingOrphanageId ? 'PUT' : 'POST'
      
      const response = await fetch(`${API_BASE_URL}/orphanages`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('You already have an orphanage registered. Each organizer can only have one orphanage.')
        }
        throw new Error(data.error || data.message || 'Save failed')
      }

      // If we created a new orphanage, store its ID
      if (method === 'POST' && data.id) {
        setExistingOrphanageId(data.id)
      }

      setMessage({ text: 'Orphanage information saved successfully!', type: 'success' })

    } catch (error) {
      setMessage({ text: error.message || 'Save failed. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div>
        <div>Logged in as: <strong>{user.displayName}</strong></div>
        <div>Email: <strong>{user.email}</strong></div>
        <button type="button" onClick={logout}>Logout</button>
      </div>
      
      <h1>Orphanage Information</h1>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1',
          color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : message.type === 'error' ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Orphanage Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="website">Website URL</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="latitude">Latitude *</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            step="any"
            value={formData.latitude}
            onChange={handleInputChange}
            required
            placeholder="e.g., 49.2827"
          />
        </div>

        <div>
          <label htmlFor="longitude">Longitude *</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            step="any"
            value={formData.longitude}
            onChange={handleInputChange}
            required
            placeholder="e.g., -123.1207"
          />
        </div>

        <button type="submit" disabled={loading || !isFormValid()}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}

export default OrganizerUpload
