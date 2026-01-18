import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OrphanageCard from '../components/OrphanageCard'
import { API_BASE_URL } from '../config.js'

function Listings(){
    const [orphanages, setOrphanages] = useState([])
    const [addresses, setAddresses] = useState({}) // Map of orphanage ID to address
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    
    useEffect(() => {
        fetchOrphanages()
    }, [])
    
    const fetchOrphanages = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/orphanages`)
            if (!response.ok) {
                throw new Error('Failed to fetch orphanages')
            }
            const data = await response.json()
            setOrphanages(data)
            
            // Initialize addresses map with loading placeholders
            const initialAddresses = {}
            data.forEach(orphanage => {
                if (orphanage.latitude && orphanage.longitude) {
                    initialAddresses[orphanage.id] = 'Loading address...'
                } else {
                    initialAddresses[orphanage.id] = 'Location not available'
                }
            })
            setAddresses(initialAddresses)
            
            // Reverse geocode all orphanages (in parallel but update as they complete)
            const geocodePromises = data.map(async (orphanage) => {
                if (orphanage.latitude && orphanage.longitude) {
                    try {
                        const address = await reverseGeocode(orphanage.latitude, orphanage.longitude)
                        setAddresses(prev => ({
                            ...prev,
                            [orphanage.id]: address
                        }))
                    } catch (error) {
                        console.error(`Error reverse geocoding orphanage ${orphanage.id}:`, error)
                        setAddresses(prev => ({
                            ...prev,
                            [orphanage.id]: 'Location not available'
                        }))
                    }
                }
            })
            
            // Wait for all geocoding to complete
            await Promise.all(geocodePromises)
        } catch (err) {
            console.error('Error fetching orphanages:', err)
        } finally {
            setLoading(false)
        }
    }
    
    const handleViewAngels = (orphanageId) => {
        navigate(`/organizer-upload?orphanageId=${orphanageId}`)
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
                    return formattedAddress || 'Location not available'
                }
            }
            return 'Location not available'
        } catch (error) {
            console.error('Reverse geocoding error:', error)
            return 'Location not available'
        }
    }
    
    // Get location from address map or fallback
    const formatLocation = (orphanage) => {
        return addresses[orphanage.id] || 'Location not available'
    }
    
    if (loading) {
        return <div className="p-8">Loading orphanages...</div>
    }
    
    return(
        <div className="p-8">
            {orphanages.length === 0 ? (
                <p>No orphanages found.</p>
            ) : (
                <div className="flex flex-col gap-6">
                    {orphanages.map(orphanage => (
                        <OrphanageCard 
                            key={orphanage.id}
                            orphanage={{ 
                                id: orphanage.id,
                                name: orphanage.name,
                                location: formatLocation(orphanage),
                                description: orphanage.description || '',
                                angelCount: orphanage.children ? orphanage.children.length : 0,
                            }} 
                            onViewAngels={() => handleViewAngels(orphanage.id)}
                        />
                    ))}
                </div>
            )}
      </div>
    )
}

export default Listings