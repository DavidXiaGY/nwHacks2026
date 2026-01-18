import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-[#FFFCFA] border-b border-[#06384D] px-6 py-4 flex items-center justify-between">
      {/* Logo/Project Name - Left */}
      <Link 
        to="/" 
        className="text-2xl font-bold font-redhatdisplay text-[#06384D] hover:text-[#EB8E89] transition-colors duration-300 cursor-pointer"
      >
        Angel Tree
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

        {/* Sign-up/Login Button */}
        <Link
          to="/login"
          className="px-6 py-2 bg-[#06384D] text-white rounded-lg hover:bg-[#EB8E89] transition-all duration-300 font-medium"
        >
          Sign-up/Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
