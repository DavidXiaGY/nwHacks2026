import { useState, useEffect, useRef } from 'react'
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
    address: ''
  })
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    address: ''
  })
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null })
  const [originalCoordinates, setOriginalCoordinates] = useState({ latitude: null, longitude: null })
  const [geocoding, setGeocoding] = useState(false)
  const geocodeTimeoutRef = useRef(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  
  // Child upload state
  const [children, setChildren] = useState([])
  const [childFormData, setChildFormData] = useState({
    firstName: '',
    age: '',
    gender: '',
    clothingShirtSize: '',
    clothingPantSize: '',
    clothingShoeSize: '',
    clothingToyPreference: '',
    interests: '',
    notes: ''
  })
  const [wishlistItems, setWishlistItems] = useState([{ name: '', description: '', externalLink: '', price: '' }])
  const [childMessage, setChildMessage] = useState({ text: '', type: '' })
  const [childLoading, setChildLoading] = useState(false)
  const [loadingChildren, setLoadingChildren] = useState(false)

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
            // Note: We'll need to reverse geocode to get address, but for now just store coordinates
            const orphanageData = {
              name: existingOrphanage.name || '',
              description: existingOrphanage.description || '',
              website: existingOrphanage.website || '',
              contactEmail: existingOrphanage.contactEmail || '',
              address: '' // Will be reverse geocoded if needed
            }
            setFormData(orphanageData)
            setOriginalFormData(orphanageData)
            // Store coordinates for existing orphanage
            if (existingOrphanage.latitude && existingOrphanage.longitude) {
              const coords = {
                latitude: existingOrphanage.latitude,
                longitude: existingOrphanage.longitude
              }
              setCoordinates(coords)
              setOriginalCoordinates(coords)
              // Reverse geocode to get address
              reverseGeocode(existingOrphanage.latitude, existingOrphanage.longitude)
            }
            // Load children for this orphanage
            loadChildren(existingOrphanage.id, token)
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

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    if (!address || address.trim() === '') {
      return null
    }

    setGeocoding(true)
    try {
      // Use Nominatim API (OpenStreetMap) - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'OrphanageApp/1.0' // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const data = await response.json()

      if (data.length === 0) {
        throw new Error('Address not found. Please try a more specific address.')
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates returned')
      }

      setCoordinates({ latitude: lat, longitude: lng })
      return { latitude: lat, longitude: lng }
    } catch (error) {
      console.error('Geocoding error:', error)
      setCoordinates({ latitude: null, longitude: null })
      throw error
    } finally {
      setGeocoding(false)
    }
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'OrphanageApp/1.0'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          const address = data.display_name
          setFormData(prev => ({
            ...prev,
            address: address
          }))
          setOriginalFormData(prev => ({
            ...prev,
            address: address
          }))
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Don't throw - this is optional
    }
  }

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.address.trim() !== '' &&
           coordinates.latitude !== null &&
           coordinates.longitude !== null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setMessage({ text: 'Please login again.', type: 'error' })
      logout()
      return
    }

    // Geocode address if we don't have coordinates yet
    if (!coordinates.latitude || !coordinates.longitude) {
      try {
        const coords = await geocodeAddress(formData.address)
        if (!coords) {
          setMessage({ text: 'Please enter a valid address.', type: 'error' })
          return
        }
      } catch (error) {
        setMessage({ text: error.message || 'Failed to geocode address. Please check the address and try again.', type: 'error' })
        return
      }
    }

    const submitData = {
      name: formData.name,
      description: formData.description || undefined,
      website: formData.website || undefined,
      contactEmail: formData.contactEmail || undefined,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
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
      const orphanageId = method === 'POST' && data.id ? data.id : existingOrphanageId
      if (method === 'POST' && data.id) {
        setExistingOrphanageId(data.id)
      }

      // Update original form data to reflect saved state
      setOriginalFormData({
        name: formData.name,
        description: formData.description,
        website: formData.website,
        contactEmail: formData.contactEmail,
        address: formData.address
      })
      
      // Update original coordinates to reflect saved state
      setOriginalCoordinates({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })

      setMessage({ text: 'Orphanage information saved successfully!', type: 'success' })
      
      // Reload children if orphanage exists
      if (orphanageId) {
        await loadChildren(orphanageId, token)
      }

    } catch (error) {
      setMessage({ text: error.message || 'Save failed. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    // Restore original form data
    const restoredAddress = originalFormData.address
    setFormData({
      name: originalFormData.name,
      description: originalFormData.description,
      website: originalFormData.website,
      contactEmail: originalFormData.contactEmail,
      address: restoredAddress
    })
    
    // Clear any messages
    setMessage({ text: '', type: '' })
    
    // Re-geocode the restored address if it exists to update the geocode status display
    // This ensures the geocode status shows the correct state after cancel
    if (restoredAddress && restoredAddress.trim() !== '') {
      try {
        await geocodeAddress(restoredAddress)
      } catch (error) {
        // If geocoding fails, restore original coordinates if they exist, otherwise clear
        if (originalCoordinates.latitude !== null && originalCoordinates.longitude !== null) {
          setCoordinates({
            latitude: originalCoordinates.latitude,
            longitude: originalCoordinates.longitude
          })
        } else {
          setCoordinates({ latitude: null, longitude: null })
        }
        console.log('Geocoding failed on cancel:', error.message)
      }
    } else {
      // If there's no address, restore original coordinates if they exist
      if (originalCoordinates.latitude !== null && originalCoordinates.longitude !== null) {
        setCoordinates({
          latitude: originalCoordinates.latitude,
          longitude: originalCoordinates.longitude
        })
      } else {
        setCoordinates({ latitude: null, longitude: null })
      }
    }
  }

  // Handle address input with debounced geocoding
  const handleAddressChange = (e) => {
    const address = e.target.value
    setFormData(prev => ({
      ...prev,
      address: address
    }))
    
    // Clear coordinates when address changes
    setCoordinates({ latitude: null, longitude: null })
    
    // Clear existing timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current)
    }
    
    // Geocode address after user stops typing (debounce)
    if (address.trim().length > 5) {
      geocodeTimeoutRef.current = setTimeout(async () => {
        try {
          await geocodeAddress(address)
        } catch (error) {
          // Silently fail - user will see error on submit if address is invalid
          console.log('Geocoding failed:', error.message)
        }
      }, 1000)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current)
      }
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  // Load children for the orphanage
  const loadChildren = async (orphanageId, token) => {
    if (!orphanageId) return
    
    setLoadingChildren(true)
    try {
      const response = await fetch(`${API_BASE_URL}/children/orphanage/${orphanageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const childrenData = await response.json()
        setChildren(childrenData)
      }
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setLoadingChildren(false)
    }
  }

  // Handle child form input changes
  const handleChildInputChange = (e) => {
    const { name, value } = e.target
    setChildFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle wishlist item changes
  const handleWishlistItemChange = (index, field, value) => {
    const updated = [...wishlistItems]
    updated[index] = { ...updated[index], [field]: value }
    setWishlistItems(updated)
  }

  // Add a new wishlist item field
  const addWishlistItem = () => {
    setWishlistItems([...wishlistItems, { name: '', description: '', externalLink: '', price: '' }])
  }

  // Remove a wishlist item field
  const removeWishlistItem = (index) => {
    if (wishlistItems.length > 1) {
      setWishlistItems(wishlistItems.filter((_, i) => i !== index))
    }
  }

  // Validate child form
  const isChildFormValid = () => {
    if (!existingOrphanageId) return false
    if (!childFormData.firstName.trim()) return false
    
    // Validate wishlist items - if partially filled, both name and externalLink are required
    // Empty items are allowed and will be filtered out on submit
    for (const item of wishlistItems) {
      const hasName = item.name.trim() !== ''
      const hasLink = item.externalLink.trim() !== ''
      // If either field is filled, both must be filled
      if ((hasName && !hasLink) || (hasLink && !hasName)) {
        return false
      }
    }
    
    return true
  }

  // Submit child with wishlist items
  const handleChildSubmit = async (e) => {
    e.preventDefault()
    
    if (!existingOrphanageId) {
      setChildMessage({ text: 'Please create an orphanage first', type: 'error' })
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setChildMessage({ text: 'Please login again.', type: 'error' })
      logout()
      return
    }

    // Filter out empty wishlist items and validate
    const validWishlistItems = wishlistItems
      .filter(item => item.name.trim() !== '' && item.externalLink.trim() !== '')
      .map(item => ({
        name: item.name.trim(),
        description: item.description.trim() || undefined,
        externalLink: item.externalLink.trim(),
        price: item.price.trim() ? parseFloat(item.price) : undefined
      }))

    const submitData = {
      firstName: childFormData.firstName.trim(),
      orphanageId: existingOrphanageId,
      age: childFormData.age.trim() ? parseInt(childFormData.age) : undefined,
      gender: childFormData.gender.trim() || undefined,
      clothingShirtSize: childFormData.clothingShirtSize.trim() || undefined,
      clothingPantSize: childFormData.clothingPantSize.trim() || undefined,
      clothingShoeSize: childFormData.clothingShoeSize.trim() || undefined,
      clothingToyPreference: childFormData.clothingToyPreference.trim() || undefined,
      interests: childFormData.interests.trim() || undefined,
      notes: childFormData.notes.trim() || undefined,
      wishlistItems: validWishlistItems
    }

    setChildLoading(true)
    setChildMessage({ text: '', type: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to add child')
      }

      // Reset form
      setChildFormData({
        firstName: '',
        age: '',
        gender: '',
        clothingShirtSize: '',
        clothingPantSize: '',
        clothingShoeSize: '',
        clothingToyPreference: '',
        interests: '',
        notes: ''
      })
      setWishlistItems([{ name: '', description: '', externalLink: '', price: '' }])
      
      // Reload children
      await loadChildren(existingOrphanageId, token)
      
      setChildMessage({ text: 'Child added successfully!', type: 'success' })

    } catch (error) {
      setChildMessage({ text: error.message || 'Failed to add child. Please try again.', type: 'error' })
    } finally {
      setChildLoading(false)
    }
  }

  // Delete a child
  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to delete this child? This will also delete all their wishlist items.')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setChildMessage({ text: 'Please login again.', type: 'error' })
      logout()
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete child')
      }

      // Reload children
      await loadChildren(existingOrphanageId, token)
      setChildMessage({ text: 'Child deleted successfully', type: 'success' })

    } catch (error) {
      setChildMessage({ text: error.message || 'Failed to delete child', type: 'error' })
    }
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
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleAddressChange}
            required
            placeholder="e.g., 123 Main St, Vancouver, BC, Canada"
            disabled={geocoding}
          />
          {geocoding && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              Looking up address...
            </div>
          )}
          {coordinates.latitude && coordinates.longitude && !geocoding && (
            <div style={{ fontSize: '0.9em', color: '#28a745', marginTop: '5px' }}>
              ✓ Address found: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </div>
          )}
          {formData.address.trim().length > 5 && !coordinates.latitude && !geocoding && (
            <div style={{ fontSize: '0.9em', color: '#dc3545', marginTop: '5px' }}>
              Address not found. Please check and try again.
            </div>
          )}
        </div>

        <div>
          <button type="submit" disabled={loading || !isFormValid()}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>

      {existingOrphanageId && (
        <>
          <h2>Add Children</h2>
          
          {childMessage.text && (
            <div style={{
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              backgroundColor: childMessage.type === 'success' ? '#d4edda' : childMessage.type === 'error' ? '#f8d7da' : '#d1ecf1',
              color: childMessage.type === 'success' ? '#155724' : childMessage.type === 'error' ? '#721c24' : '#0c5460',
              border: `1px solid ${childMessage.type === 'success' ? '#c3e6cb' : childMessage.type === 'error' ? '#f5c6cb' : '#bee5eb'}`
            }}>
              {childMessage.text}
            </div>
          )}

          <form onSubmit={handleChildSubmit}>
            <h3>Child Information</h3>
            
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={childFormData.firstName}
                onChange={handleChildInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                value={childFormData.age}
                onChange={handleChildInputChange}
              />
            </div>

            <div>
              <label htmlFor="gender">Gender</label>
              <input
                type="text"
                id="gender"
                name="gender"
                value={childFormData.gender}
                onChange={handleChildInputChange}
                placeholder="e.g., male, female, non-binary"
              />
            </div>

            <div>
              <label htmlFor="clothingShirtSize">Shirt Size</label>
              <input
                type="text"
                id="clothingShirtSize"
                name="clothingShirtSize"
                value={childFormData.clothingShirtSize}
                onChange={handleChildInputChange}
                placeholder="e.g., Youth Medium"
              />
            </div>

            <div>
              <label htmlFor="clothingPantSize">Pant Size</label>
              <input
                type="text"
                id="clothingPantSize"
                name="clothingPantSize"
                value={childFormData.clothingPantSize}
                onChange={handleChildInputChange}
                placeholder="e.g., Youth 8"
              />
            </div>

            <div>
              <label htmlFor="clothingShoeSize">Shoe Size</label>
              <input
                type="text"
                id="clothingShoeSize"
                name="clothingShoeSize"
                value={childFormData.clothingShoeSize}
                onChange={handleChildInputChange}
                placeholder="e.g., Youth 2 (US)"
              />
            </div>

            <div>
              <label htmlFor="clothingToyPreference">Clothing/Toy Preference</label>
              <input
                type="text"
                id="clothingToyPreference"
                name="clothingToyPreference"
                value={childFormData.clothingToyPreference}
                onChange={handleChildInputChange}
                placeholder="e.g., Masculine, Feminine, Neutral"
              />
            </div>

            <div>
              <label htmlFor="interests">Interests</label>
              <textarea
                id="interests"
                name="interests"
                value={childFormData.interests}
                onChange={handleChildInputChange}
                placeholder="e.g., Loves art, drawing, and music"
              />
            </div>

            <div>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={childFormData.notes}
                onChange={handleChildInputChange}
                placeholder="Other notes for the child"
              />
            </div>

            <h3>Wishlist Items</h3>
            
            {wishlistItems.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                <div>
                  <label htmlFor={`wishlist-name-${index}`}>Item Name *</label>
                  <input
                    type="text"
                    id={`wishlist-name-${index}`}
                    value={item.name}
                    onChange={(e) => handleWishlistItemChange(index, 'name', e.target.value)}
                    placeholder="e.g., LEGO Set"
                  />
                </div>

                <div>
                  <label htmlFor={`wishlist-link-${index}`}>External Link *</label>
                  <input
                    type="url"
                    id={`wishlist-link-${index}`}
                    value={item.externalLink}
                    onChange={(e) => handleWishlistItemChange(index, 'externalLink', e.target.value)}
                    placeholder="https://www.amazon.com/item"
                  />
                </div>

                <div>
                  <label htmlFor={`wishlist-description-${index}`}>Description</label>
                  <textarea
                    id={`wishlist-description-${index}`}
                    value={item.description}
                    onChange={(e) => handleWishlistItemChange(index, 'description', e.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label htmlFor={`wishlist-price-${index}`}>Price</label>
                  <input
                    type="number"
                    id={`wishlist-price-${index}`}
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleWishlistItemChange(index, 'price', e.target.value)}
                    placeholder="29.99"
                  />
                </div>

                {wishlistItems.length > 1 && (
                  <button type="button" onClick={() => removeWishlistItem(index)}>
                    Remove Item
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addWishlistItem}>
              Add Another Wishlist Item
            </button>

            <div>
              <button type="submit" disabled={childLoading || !isChildFormValid()}>
                {childLoading ? 'Adding...' : 'Add Child'}
              </button>
            </div>
          </form>

          <h2>Existing Children</h2>
          
          {loadingChildren ? (
            <div>Loading children...</div>
          ) : children.length === 0 ? (
            <div>No children added yet. Add a child above.</div>
          ) : (
            <div>
              {children.map((child) => (
                <div key={child.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                  <h3>{child.firstName}</h3>
                  {child.age && <div>Age: {child.age}</div>}
                  {child.gender && <div>Gender: {child.gender}</div>}
                  {child.clothingShirtSize && <div>Shirt Size: {child.clothingShirtSize}</div>}
                  {child.clothingPantSize && <div>Pant Size: {child.clothingPantSize}</div>}
                  {child.clothingShoeSize && <div>Shoe Size: {child.clothingShoeSize}</div>}
                  {child.clothingToyPreference && <div>Preference: {child.clothingToyPreference}</div>}
                  {child.interests && <div>Interests: {child.interests}</div>}
                  {child.notes && <div>Notes: {child.notes}</div>}
                  
                  {child.wishlist && child.wishlist.length > 0 && (
                    <div>
                      <h4>Wishlist Items:</h4>
                      <ul>
                        {child.wishlist.map((item) => (
                          <li key={item.id}>
                            <strong>{item.name}</strong>
                            {item.description && <div>{item.description}</div>}
                            <div><a href={item.externalLink} target="_blank" rel="noopener noreferrer">{item.externalLink}</a></div>
                            {item.price && <div>Price: ${item.price}</div>}
                            <div>Status: {item.status}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button type="button" onClick={() => handleDeleteChild(child.id)}>
                    Delete Child
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default OrganizerUpload
