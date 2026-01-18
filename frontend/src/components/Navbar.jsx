import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Function to check auth state
  const checkAuthState = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData)
        setIsLoggedIn(true)
        setUser(userObj)
      } catch (e) {
        console.error('Error parsing user data:', e)
        setIsLoggedIn(false)
        setUser(null)
      }
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  useEffect(() => {
    // Check auth state on mount and when location changes
    checkAuthState()

    // Listen for custom login event
    const handleLoginEvent = () => {
      checkAuthState()
    }

    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthState()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleLoginEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleLoginEvent)
    }
  }, [location])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUser(null)
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <nav className="bg-[#FFFCFA] px-4 md:px-6 py-4 flex items-center justify-between">
      {/* Logo/Project Name - Left */}
      <Link 
        to="/" 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
      >
        {/* Tree Icon */}
        <svg className="w-6 h-6 md:w-8 md:h-8 text-[#06384D]" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L60 30 L50 30 L50 40 L50 30 L40 30 Z" fill="#06384D" />
          <path d="M50 20 L65 45 L50 45 L50 55 L50 45 L35 45 Z" fill="#06384D" />
          <path d="M50 35 L70 65 L50 65 L50 75 L50 65 L30 65 Z" fill="#06384D" />
          <rect x="47" y="75" width="6" height="15" fill="#92400E" />
          <circle cx="50" cy="5" r="3" fill="#FBBF24" />
        </svg>
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-[#06384D]">Angel Tree</span>
          <span className="text-xs md:text-sm text-[#06384D] opacity-80">for Orphanages</span>
        </div>
      </Link>

      {/* Right side buttons */}
      <div className="flex items-center gap-4">
        {/* Browse Listings Button */}
        <Link
          to="/map"
          className="px-4 py-2 text-[#06384D] hover:text-[#EB8E89] font-medium transition-colors duration-300"
        >
          Browse Listings
        </Link>

        {/* Login/Logout Button */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 md:px-6 py-2 bg-[#EB8E89] text-[#06384D] rounded-lg hover:bg-[#d87d78] transition-all duration-300 font-medium shadow-md text-sm md:text-base flex items-center gap-2"
            >
              {user?.displayName || user?.email || 'Account'}
              <svg 
                className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[#06384D] hover:bg-[#EB8E89] hover:text-white transition-colors duration-200 text-sm md:text-base"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 md:px-6 py-2 bg-[#EB8E89] text-[#06384D] rounded-lg hover:bg-[#d87d78] transition-all duration-300 font-medium shadow-md text-sm md:text-base"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
