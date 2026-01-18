import { Link } from 'react-router-dom'

function Navbar() {
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

        {/* Login Button */}
        <Link
          to="/login"
          className="px-4 md:px-6 py-2 bg-[#EB8E89] text-[#06384D] rounded-lg hover:bg-[#d87d78] transition-all duration-300 font-medium shadow-md text-sm md:text-base"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
