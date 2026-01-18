import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

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

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-[#FFFFFF] border-b-[1px] border-[#06384D] px-4 md:px-6 py-[8px] flex items-center justify-between">
      {/* Logo/Project Name - Left */}
      <Link 
        to="/" 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
      >
        <span className="text-lg md:text-xl font-bold text-[#06384D]">EVERGREEN</span>
      </Link>

      {/* Right side buttons */}
      <div className="flex items-center gap-4">
        {/* Browse Listings Button */}
        <Link
          to="/listings"
          className="body-default !font-semibold px-4 py-2 text-[#06384D] hover:text-[#EB8E89] font-medium transition-colors duration-300"
        >
          Browse Listings
        </Link>

        {/* Login/Logout Button */}
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <span className="body-default !font-semibold text-default">
              {user?.displayName || user?.email || 'Account'}
            </span>
            <button
              onClick={handleLogout}
              className="px-[16px] py-[8px] body-default !font-bold text-[#08535C] rounded-[6px] hover:bg-[#EB8E89] hover:text-white transition-all duration-300 font-medium text-sm md:text-base flex items-center gap-2"
            >
              SIGN OUT
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-[16px] py-[8px] bg-[#12707C] body-default !font-bold text-[#FFFFFF] rounded-[6px] hover:bg-[#d87d78] transition-all duration-300 font-medium text-sm md:text-base"
          >
            LOG IN
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
