import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import OrphanageCard from '../components/OrphanageCard'
import { API_BASE_URL } from '../config.js'
import orphanTrees from '../assets/orphanTrees.svg'
import holly from '../assets/holly.svg'
import mitten from '../assets/mitten.svg'
import snowflake from '../assets/snowflake.svg'
import AsideImage from '../assets/AsideImage.png'

// Array of icon paths - defined outside component to ensure stable reference
const icons = [holly, mitten, snowflake]

function Listings(){
    const [orphanages, setOrphanages] = useState([])
    const [addresses, setAddresses] = useState({}) // Map of orphanage ID to address
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    
    // Memoized icon mapping - creates a stable map of orphanage ID to icon
    // This ensures icons don't change on re-renders
    const iconMap = useMemo(() => {
        const map = {}
        orphanages.forEach(orphanage => {
            // Use the orphanage ID to deterministically select an icon
            // This ensures the same orphanage always gets the same icon, but different orphanages get different icons
            // Convert ID to a hash for better distribution
            const idStr = String(orphanage.id)
            let hash = 0
            for (let i = 0; i < idStr.length; i++) {
                const char = idStr.charCodeAt(i)
                hash = ((hash << 5) - hash) + char
                hash = hash | 0 // Convert to 32-bit integer
            }
            // Use absolute value and modulo to get index
            const index = Math.abs(hash) % icons.length
            map[orphanage.id] = icons[index] || icons[0] // Fallback to first icon if index is invalid
        })
        return map
    }, [orphanages])
    
    // Function to get icon for an orphanage from the stable map
    const getIconForOrphanage = (orphanageId) => {
        return iconMap[orphanageId] || icons[0] // Fallback to first icon if not found
    }
    
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
    
    // Format location to show only city and province (e.g., "Vancouver, BC")
    const formatLocation = (orphanage) => {
        const addressString = addresses[orphanage.id]
        if (!addressString || addressString === 'Location not available' || addressString === 'Loading address...') {
            return addressString || 'Location not available'
        }
        
        // Try to extract city and province from the address string
        // Format is typically: "Street, City, Province, Postal Code"
        const parts = addressString.split(',').map(p => p.trim())
        
        // Map full province names to abbreviations
        const provinceMap = {
            'British Columbia': 'BC',
            'Alberta': 'AB',
            'Saskatchewan': 'SK',
            'Manitoba': 'MB',
            'Ontario': 'ON',
            'Quebec': 'QC',
            'New Brunswick': 'NB',
            'Nova Scotia': 'NS',
            'Prince Edward Island': 'PE',
            'Newfoundland and Labrador': 'NL',
            'Northwest Territories': 'NT',
            'Yukon': 'YT',
            'Nunavut': 'NU'
        }
        
        // Check if last part is a postal code (Canadian format: A1A 1A1)
        const lastPart = parts[parts.length - 1]
        const postalCodePattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/
        
        if (postalCodePattern.test(lastPart)) {
            // Last part is postal code, so city and province are the 2 before it
            if (parts.length >= 3) {
                const province = parts[parts.length - 2]
                const city = parts[parts.length - 3]
                const provinceAbbr = provinceMap[province] || province
                return `${city}, ${provinceAbbr}`
            }
        } else {
            // No postal code, assume last 2 parts are city and province
            if (parts.length >= 2) {
                const province = parts[parts.length - 1]
                const city = parts[parts.length - 2]
                const provinceAbbr = provinceMap[province] || province
                return `${city}, ${provinceAbbr}`
            }
        }
        
        return addressString
    }
    
    return(
        <div className="flex flex-col">
            {/* Header with background image */}
            <div className="header h-[400px] w-full flex flex-col justify-end relative" style={{ position: 'relative' }}>
                <div className="background-img absolute right-[-450px] z-[-1]">
                    <img src={orphanTrees} alt="Background" />
                </div>
                <div className='p-[48px] pb-[48px]'>
                    <h1 className="text-[40px] font-bold font-redhatdisplay">
                        Orphanages
                    </h1>
                    <p className="font-manrope text-[#12707C]">
                        Browse verified organizations and support children in your community
                    </p>
                </div>
            </div>
            
            {/* Content area with grid */}
            <div className="p-[48px] border-t-2 border-[#06404D]">
                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-3 body-default text-default">Loading orphanages...</div>
                    </div>
                ) : orphanages.length === 0 ? (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-3 body-default text-default">No orphanages found.</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6 auto-rows-max">
                        {/* First 2 orphanage cards */}
                        {orphanages.slice(0, 2).map((orphanage) => (
                            <OrphanageCard 
                                key={orphanage.id}
                                orphanage={{ 
                                    id: orphanage.id,
                                    name: orphanage.name,
                                    location: formatLocation(orphanage),
                                    description: orphanage.description || '',
                                    angelCount: orphanage.children ? orphanage.children.length : 0,
                                }} 
                                icon={holly}
                                onViewAngels={() => handleViewAngels(orphanage.id)}
                            />
                        ))}
                        
                        {/* Aside panel with static map - positioned in 3rd column, spanning 2 rows */}
                        {orphanages.length >= 2 && (
                            <div
                                key="map-aside"
                                className="col-start-3 row-start-1 row-span-2"
                                style={{
                                    border: '0.5px solid #000',
                                    padding: 0,
                                    backgroundColor: '#FFFCFA',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    minHeight: '530px',
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onClick={() => navigate('/map')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#E5E5DF'
                                    const img = e.currentTarget.querySelector('img')
                                    const overlay = e.currentTarget.querySelector('.hover-overlay')
                                    if (img) {
                                        img.style.transform = 'scale(1.1)'
                                    }
                                    if (overlay) {
                                        overlay.style.opacity = '0.15'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FFFCFA'
                                    const img = e.currentTarget.querySelector('img')
                                    const overlay = e.currentTarget.querySelector('.hover-overlay')
                                    if (img) {
                                        img.style.transform = 'scale(1)'
                                    }
                                    if (overlay) {
                                        overlay.style.opacity = '0'
                                    }
                                }}
                            >
                                <div style={{
                                    border: '14px solid #FFFCFA',
                                    padding: 0,
                                    backgroundColor: '#FFFFFF',
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E5DF'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#FFFCFA'
                                }}
                                >
                                    <div style={{
                                        border: '2px solid #0F8F9E',
                                        padding: 0,
                                        backgroundColor: '#FFFFFF',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        width: '100%',
                                        height: '100%',
                                        boxSizing: 'border-box'
                                    }}>
                                        {/* Background Image */}
                                        <img 
                                            src={AsideImage}
                                            alt="Map view"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                display: 'block',
                                                margin: 0,
                                                padding: 0,
                                                border: 'none',
                                                outline: 'none',
                                                zIndex: 0,
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />
                                        
                                        {/* Dark Overlay on Hover */}
                                        <div 
                                            className="hover-overlay"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: '#000000',
                                                opacity: 0,
                                                zIndex: 0.5,
                                                transition: 'opacity 0.3s ease',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        
                                        {/* Text Overlay - Upper Middle */}
                                        <div style={{
                                            position: 'absolute',
                                            padding: '24px',
                                            width: '100%',
                                            borderBottom: '2px solid #0F8F9E',
                                            zIndex: 2,
                                            backgroundColor: '#FFFFFF',
                                        }}>
                                    <h2 style={{
                                        fontFamily: "'Manrope', sans-serif",
                                        fontSize: '32px',
                                        fontWeight: 900,
                                        color: '#06404D',
                                        lineHeight: '1.2',
                                        margin: 0
                                    }}>
                                        View Orphanages
                                    </h2>
                                    <h2 style={{
                                        fontFamily: "'Manrope', sans-serif",
                                        fontSize: '32px',
                                        fontWeight: 900,
                                        color: '#06404D',
                                        lineHeight: '1.2',
                                        margin: 0,
                                        marginTop: '4px'
                                    }}>
                                        Near You
                                    </h2>
                                </div>
                                
                                {/* Arrow Button - Bottom Right */}
                                <button
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        right: '20px',
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: '#06384D',
                                        border: 'none',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 3,
                                        transition: 'background-color 300ms ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#052A35'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#06384D'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/map')
                                    }}
                                >
                                    <svg 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="white" 
                                        strokeWidth="3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Remaining orphanage cards (starting from index 2) */}
                        {orphanages.slice(2).map((orphanage) => (
                            <OrphanageCard 
                                key={orphanage.id}
                                orphanage={{ 
                                    id: orphanage.id,
                                    name: orphanage.name,
                                    location: formatLocation(orphanage),
                                    description: orphanage.description || '',
                                    angelCount: orphanage.children ? orphanage.children.length : 0,
                                }} 
                                icon={holly}
                                onViewAngels={() => handleViewAngels(orphanage.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Listings