import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom icon for highlighted orphanage
const highlightedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom icon for regular orphanage
const orphanageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map view changes when orphanage is selected
function MapController({ selectedOrphanage, userLocation }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedOrphanage) {
      map.setView(
        [selectedOrphanage.latitude, selectedOrphanage.longitude],
        13,
        { animate: true, duration: 0.5 }
      )
    }
  }, [selectedOrphanage, map])

  return null
}

function InteractiveMap() {
  const [userLocation, setUserLocation] = useState(null)
  const [orphanages, setOrphanages] = useState([])
  const [selectedOrphanage, setSelectedOrphanage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const markerRefs = useRef({})

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          fetchOrphanages(latitude, longitude)
        },
        (err) => {
          console.error('Error getting location:', err)
          setError('Unable to get your location. Please enable location services.')
          // Default to Vancouver if location access denied
          const defaultLat = 49.2827
          const defaultLng = -123.1207
          setUserLocation({ lat: defaultLat, lng: defaultLng })
          fetchOrphanages(defaultLat, defaultLng)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
      // Default to Vancouver
      const defaultLat = 49.2827
      const defaultLng = -123.1207
      setUserLocation({ lat: defaultLat, lng: defaultLng })
      fetchOrphanages(defaultLat, defaultLng)
    }
  }, [])

  // Fetch orphanages from API
  const fetchOrphanages = async (lat, lng) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/api/orphanages?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orphanages')
      }
      const data = await response.json()
      setOrphanages(data)
    } catch (err) {
      console.error('Error fetching orphanages:', err)
      setError('Failed to load orphanages. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Handle orphanage selection from list
  const handleOrphanageClick = (orphanage) => {
    setSelectedOrphanage(orphanage)
    
    // Open popup for the selected marker
    const marker = markerRefs.current[orphanage.id]
    if (marker) {
      marker.openPopup()
    }
  }

  // Calculate center point for map (between user and orphanages)
  const getMapCenter = () => {
    if (!userLocation) return [49.2827, -123.1207] // Default to Vancouver
    
    if (orphanages.length === 0) {
      return [userLocation.lat, userLocation.lng]
    }

    // Calculate bounds to include user and all orphanages
    const lats = [userLocation.lat, ...orphanages.map(o => o.latitude)]
    const lngs = [userLocation.lng, ...orphanages.map(o => o.longitude)]
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
    
    return [centerLat, centerLng]
  }

  if (loading && !userLocation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">Loading map...</p>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    )
  }

  const mapCenter = getMapCenter()

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="bg-[#FFFCFA] border-b border-[#06404D] p-4 z-10">
        <h1 className="text-3xl font-bold font-redhatdisplay text-[#06404D]">
          Find Orphanages Near You
        </h1>
        {error && (
          <p className="text-red-600 mt-2 text-sm">{error}</p>
        )}
      </div>

      <div className="flex-1 flex relative">
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController selectedOrphanage={selectedOrphanage} userLocation={userLocation} />

            {/* User location marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userIcon}
              >
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {/* Orphanage markers */}
            {orphanages.map((orphanage) => (
              <Marker
                key={orphanage.id}
                position={[orphanage.latitude, orphanage.longitude]}
                icon={selectedOrphanage?.id === orphanage.id ? highlightedIcon : orphanageIcon}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[orphanage.id] = ref
                  }
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{orphanage.name}</h3>
                    {orphanage.description && (
                      <p className="text-sm text-gray-600 mb-2">{orphanage.description}</p>
                    )}
                    {orphanage.distance !== undefined && (
                      <p className="text-sm font-semibold text-blue-600">
                        {orphanage.distance.toFixed(2)} km away
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Orphanage List Sidebar */}
        <div className="w-96 bg-[#FFFCFA] border-l border-[#06404D] overflow-y-auto">
          <div className="p-4 sticky top-0 bg-[#FFFCFA] border-b border-[#06404D] z-10">
            <h2 className="text-2xl font-bold font-redhatdisplay text-[#06404D] mb-2">
              Orphanages
            </h2>
            <p className="text-sm text-gray-600">
              {orphanages.length} {orphanages.length === 1 ? 'orphanage' : 'orphanages'} found
            </p>
          </div>

          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading orphanages...</p>
              </div>
            ) : orphanages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No orphanages found in your area.</p>
              </div>
            ) : (
              orphanages.map((orphanage) => (
                <div
                  key={orphanage.id}
                  onClick={() => handleOrphanageClick(orphanage)}
                  className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                    selectedOrphanage?.id === orphanage.id
                      ? 'border-[#F2ABA7] bg-[#F2ABA7] bg-opacity-20 shadow-lg'
                      : 'border-[#06404D] bg-white hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-bold text-xl font-redhatdisplay text-[#06404D] mb-2">
                    {orphanage.name}
                  </h3>
                  {orphanage.description && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {orphanage.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    {orphanage.distance !== undefined && (
                      <span className="text-sm font-semibold text-blue-600">
                        {orphanage.distance.toFixed(2)} km away
                      </span>
                    )}
                    {orphanage.children && (
                      <span className="text-sm text-gray-600">
                        {orphanage.children.length} {orphanage.children.length === 1 ? 'child' : 'children'}
                      </span>
                    )}
                  </div>
                  {orphanage.contactEmail && (
                    <p className="text-xs text-gray-500 mt-2">
                      {orphanage.contactEmail}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveMap
