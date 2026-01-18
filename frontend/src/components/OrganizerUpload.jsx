import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe } from 'lucide-react'
import OrphanageDetailBackground from '../assets/OrphanageDetailBackground.png'
import ChildInfoCard from './ChildInfoCard'

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
  const descriptionTextareaRef = useRef(null)
  const addressTextareaRef = useRef(null)
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

  // Format address to show only street, city, province, and postal code
  const formatAddress = (addressData) => {
    const parts = []
    const addr = addressData.address || {}
    
    // Street address (house number + road)
    if (addr.house_number && addr.road) {
      parts.push(`${addr.house_number} ${addr.road}`)
    } else if (addr.road) {
      parts.push(addr.road)
    } else if (addr.pedestrian) {
      // Sometimes landmarks use 'pedestrian' field
      parts.push(addr.pedestrian)
    }
    
    // City (try multiple fields)
    if (addr.city) {
      parts.push(addr.city)
    } else if (addr.town) {
      parts.push(addr.town)
    } else if (addr.village) {
      parts.push(addr.village)
    } else if (addr.municipality) {
      parts.push(addr.municipality)
    }
    
    // Province/State (for Canada, this is usually in 'state' field)
    if (addr.state) {
      parts.push(addr.state)
    } else if (addr.province) {
      parts.push(addr.province)
    } else if (addr.state_district) {
      parts.push(addr.state_district)
    }
    
    // Postal code - try to get full postal code from display_name if postcode is incomplete
    let postcode = addr.postcode?.trim() || ''
    
    // For Canadian postal codes, Nominatim sometimes only returns the first 3 characters (FSA)
    // Try to extract the full postal code from display_name if available
    if (postcode && postcode.length === 3 && addressData.display_name) {
      // Look for postal code pattern in display_name (e.g., "V6Z 2H7" or "V6Z, V6Z 2H7")
      const postalCodePattern = /([A-Z]\d[A-Z]\s?\d[A-Z]\d)/g
      const matches = addressData.display_name.match(postalCodePattern)
      if (matches && matches.length > 0) {
        // Use the last match (usually the full one) and normalize spacing
        const fullPostcode = matches[matches.length - 1].replace(/\s+/g, ' ').trim()
        if (fullPostcode.length > postcode.length) {
          postcode = fullPostcode
        }
      }
    }
    
    if (postcode) {
      parts.push(postcode)
    }
    
    return parts.join(', ')
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'OrphanageApp/1.0'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.address) {
          const formattedAddress = formatAddress(data)
          if (formattedAddress) {
            setFormData(prev => ({
              ...prev,
              address: formattedAddress
            }))
            setOriginalFormData(prev => ({
              ...prev,
              address: formattedAddress
            }))
            // Debug: log the formatted address to verify it's correct
            console.log('Formatted address:', formattedAddress)
            console.log('Address data:', data.address)
          }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Don't throw - this is optional
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
      // Nominatim returns results sorted by relevance by default, so we trust the first result
      // Add addressdetails=1 for better structured results
      // Add countrycodes to limit to common countries (can be expanded)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1&accept-language=en&countrycodes=ca,us`,
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

      // Use the first result - Nominatim already sorts by relevance
      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates returned')
      }

      // Log the result for debugging (can be removed in production)
      console.log('Geocoding result:', {
        address: result.display_name,
        type: result.type,
        importance: result.importance,
        hasHousenumber: !!result.address?.housenumber
      })

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
    
    // Auto-resize textarea immediately
    const textarea = e.target
    textarea.style.height = '0px'
    textarea.style.height = `${textarea.scrollHeight}px`
    
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

  // Auto-resize description textarea when value changes
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      const textarea = descriptionTextareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [formData.description])

  // Auto-resize address textarea when value changes
  useEffect(() => {
    if (addressTextareaRef.current) {
      const textarea = addressTextareaRef.current
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Reset height to auto to get accurate scrollHeight
        textarea.style.height = '0px'
        // Set height to scrollHeight to fit all content exactly
        const scrollHeight = textarea.scrollHeight
        textarea.style.height = `${scrollHeight}px`
        // Ensure width is correct and text is visible
        textarea.style.width = '100%'
      })
    }
  }, [formData.address])

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
        console.log('Raw children data from API:', childrenData)
        console.log('First child full object:', childrenData[0])
        if (childrenData[0]) {
          console.log('First child gender:', childrenData[0].gender)
          console.log('First child interests:', childrenData[0].interests)
        }
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
    <div className="relative h-screen overflow-hidden">
      <h1 className="sr-only">
        {formData.name || "Orphanage Information"}
      </h1>

      {/* Status message */}
      {/* {message.text && (
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
      )} */}

      <div className="flex flex-row h-screen">
        {/* Left Panel - Back button and Orphanage Info */}
        <div className="p-[32px] flex flex-col h-full overflow-y-auto flex-[0_0_45%]">
          <div className="mb-6">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="text-text-secondary hover:text-text-tertiary transition-colors flex items-center gap-2 body-default"
              style={{
                fontWeight: 700,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Listings
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-[32px]">
            <div className="w-full">
              <label htmlFor="name" className="sr-only">Orphanage Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="heading-xl text-default w-full"
                placeholder="Enter orphanage name"
                aria-label="Orphanage Name"
                aria-required="true"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: 0,
                  width: '100%',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '1px solid #06404D'
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = 'none'
                }}
              />
            </div>

            <div className="w-full mt-[-16px] mb-[16px]">
              <label htmlFor="description" className="sr-only">Description</label>
              <textarea
                ref={descriptionTextareaRef}
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => {
                  handleInputChange(e)
                  // Auto-resize textarea
                  const textarea = e.target
                  textarea.style.height = 'auto'
                  textarea.style.height = `${textarea.scrollHeight}px`
                }}
                className="body-lg text-default w-full"
                placeholder="Enter orphanage description"
                aria-label="Orphanage Description"
                rows={1}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: 0,
                  width: '100%',
                  resize: 'none',
                  overflow: 'hidden',
                  minHeight: '1.5em',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '1px solid #06404D'
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = 'none'
                }}
              />
            </div>

            <div className="w-full">
              <label htmlFor="website" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="size-6 text-secondary  ">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="text-secondary heading-sm">
                  Website</span>
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full text-default"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: 0,
                  width: '100%',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '1px solid #06404D'
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = 'none'
                }}
              />
            </div>

            <div className="w-full">
              <label htmlFor="contactEmail" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-secondary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>

                <span className="text-secondary heading-sm">
                  Contact Email
                </span>
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full text-default"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: 0,
                  width: '100%',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '1px solid #06404D'
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = 'none'
                }}
              />
            </div>

        <div className="w-full" style={{ minWidth: 0 }}>
          <label htmlFor="address" className="flex items-center gap-2 ml-[-2px]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-secondary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="text-secondary heading-sm">
              Address
            </span>
          </label>
          <textarea
            ref={addressTextareaRef}
            id="address"
            name="address"
            value={formData.address}
            onChange={handleAddressChange}
            required
            placeholder="e.g., 123 Main St, Vancouver, BC, Canada"
            disabled={geocoding}
            className="w-full text-default"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              width: '100%',
              maxWidth: '100%',
              resize: 'none',
              overflow: 'hidden',
              minHeight: '1.5em',
              height: 'auto',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
              textOverflow: 'clip',
              wordBreak: 'normal',
              lineHeight: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderBottom = '1px solid #06404D'
              // Auto-resize on focus
              e.target.style.height = '0px'
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onBlur={(e) => {
              e.target.style.borderBottom = 'none'
            }}
          />
          {geocoding && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              Looking up address...
            </div>
          )}
          {/* {coordinates.latitude && coordinates.longitude && !geocoding && (
            <div style={{ fontSize: '0.9em', color: '#28a745', marginTop: '5px' }}>
              ✓ Address found: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </div>
          )} */}
          {formData.address.trim().length > 5 && !coordinates.latitude && !geocoding && (
            <div style={{ fontSize: '0.9em', color: '#dc3545', marginTop: '5px' }}>
              Address not found. Please check and try again.
            </div>
          )}
        </div>

            {/* Save and Cancel buttons - only show when changes are made */}
            {(() => {
              const hasChanges = 
                formData.name !== originalFormData.name ||
                formData.description !== originalFormData.description ||
                formData.website !== originalFormData.website ||
                formData.contactEmail !== originalFormData.contactEmail ||
                formData.address !== originalFormData.address ||
                coordinates.latitude !== originalCoordinates.latitude ||
                coordinates.longitude !== originalCoordinates.longitude

              if (!hasChanges) return null

              return (
                <div className="flex gap-4" style={{ marginTop: '64px' }}>
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    disabled={loading}
                    className="body-default text-white rounded transition-opacity disabled:opacity-50"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#06384D',
                      color: '#FFFFFF',
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !isFormValid()}
                    className="body-default text-white rounded transition-opacity disabled:opacity-50"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#EB8E89',
                      color: '#FFFFFF',
                      fontWeight: 700,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )
            })()}
          </form>
        </div>

        {/* Background Image - Absolute positioned at bottom of viewport */}
        <div className="absolute bottom-0 left-0 w-[45%] z-[-1000]">
          <img 
            src={OrphanageDetailBackground} 
            alt="Orphanage detail background" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-surface-secondary p-[32px] h-full overflow-y-auto min-w-0">
          {existingOrphanageId && (
            <>
              <h2 className="sr-only">Existing Children</h2>
              
              {loadingChildren ? (
                <div className="body-default text-default">Loading children...</div>
              ) : children.length === 0 ? (
                <div className="body-default text-default">No children added yet. Add a child above.</div>
              ) : (
                <div className="grid grid-cols-3 gap-4" style={{ alignItems: 'start' }}>
                  {children.map((child) => (
                    <ChildInfoCard 
                      key={child.id}
                      child={{
                        firstName: child.firstName,
                        age: child.age,
                        gender: child.gender,
                        wishlist: child.wishlist || [],
                        interests: child.interests
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

        {existingOrphanageId && (
          <>
            {/* <h2>Add Children</h2>
            
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
            )} */}

            {/* <form onSubmit={handleChildSubmit}>
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
            </form> */}
          </>
        )}
    </div>
  )
}

export default OrganizerUpload