import { Link } from 'react-router-dom'
import StatBlock from '../components/StatBlock'

function Home() {
  // SVG Icons for stat blocks
  const childrenIcon = (
    <svg viewBox="0 0 100 100" className="w-16 h-16 text-blue-400">
      <circle cx="30" cy="40" r="12" fill="currentColor" />
      <circle cx="50" cy="35" r="12" fill="currentColor" />
      <circle cx="70" cy="40" r="12" fill="currentColor" />
      <path d="M 20 60 Q 30 50 50 50 Q 70 50 80 60 L 80 75 L 20 75 Z" fill="currentColor" />
    </svg>
  )

  const heartGiftIcon = (
    <div className="flex items-center justify-center gap-2">
      <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#EB8E89]">
        <path d="M50,30 C50,20 40,15 35,20 C30,15 20,20 20,30 C20,35 25,40 35,50 L50,65 L65,50 C75,40 80,35 80,30 C80,20 70,15 65,20 C60,15 50,20 50,30 Z" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#EB8E89]">
        <rect x="25" y="30" width="50" height="40" rx="3" fill="currentColor" />
        <path d="M 35 30 L 35 20 L 45 20 L 45 30" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M 55 30 L 55 20 L 65 20 L 65 30" stroke="currentColor" strokeWidth="3" fill="none" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </div>
  )

  const giftCheckIcon = (
    <svg viewBox="0 0 100 100" className="w-16 h-16 text-green-500">
      <rect x="25" y="30" width="50" height="40" rx="3" fill="currentColor" />
      <path d="M 35 30 L 35 20 L 45 20 L 45 30" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M 55 30 L 55 20 L 65 20 L 65 30" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="8" fill="white" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      <path d="M 46 50 L 49 53 L 54 48" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#FFFCFA]">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] overflow-hidden">
        {/* Background with snowy mountains */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white">
          {/* Mountain illustration */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            {/* Sky gradient */}
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#F0F9FF" />
              </linearGradient>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            
            {/* Sky */}
            <rect width="1200" height="600" fill="url(#skyGradient)" />
            
            {/* Mountains */}
            <path d="M 0 400 L 200 200 L 400 300 L 600 150 L 800 250 L 1000 180 L 1200 300 L 1200 600 L 0 600 Z" fill="url(#mountainGradient)" />
            <path d="M 0 450 L 150 280 L 350 380 L 550 220 L 750 320 L 950 240 L 1200 350 L 1200 600 L 0 600 Z" fill="#F1F5F9" />
            
            {/* Snow caps */}
            <path d="M 200 200 L 250 180 L 300 200 L 350 190 L 400 200" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 600 150 L 650 130 L 700 150 L 750 140 L 800 150" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 1000 180 L 1050 160 L 1100 180" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" />
            
            {/* Pine trees */}
            {[150, 250, 450, 550, 750, 850, 1050].map((x, i) => (
              <g key={i}>
                <path d={`M ${x} 500 L ${x-20} 550 L ${x+20} 550 Z`} fill="#166534" />
                <path d={`M ${x} 480 L ${x-15} 520 L ${x+15} 520 Z`} fill="#15803D" />
                <path d={`M ${x} 460 L ${x-10} 490 L ${x+10} 490 Z`} fill="#16A34A" />
                <rect x={x-3} y={550} width="6" height="50" fill="#92400E" />
              </g>
            ))}
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-[#06384D] mb-6 leading-tight">
            Help fulfill the wishes<br />
            <span className="text-6xl md:text-7xl">of orphaned children.</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl">
            Easily donate gifts to verified orphanages near you, ensuring your generosity makes a real, local impact.
          </p>
          <Link
            to="/map"
            className="px-8 py-4 bg-[#EB8E89] text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-[#d87d78] transition-all duration-300 transform hover:scale-105"
          >
            Find an Orphanage
          </Link>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg className="w-6 h-6 text-[#06384D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatBlock
              icon={childrenIcon}
              number="23,120"
              description="children helped last year"
            />
            <StatBlock
              icon={heartGiftIcon}
              number="849"
              description="people currently donating"
            />
            <StatBlock
              icon={giftCheckIcon}
              number="14,528"
              description="gifts donated this year"
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#06384D] mb-6">About Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We created Angel Tree for Orphanages to give donors a trusted and easy way to support verified orphanages. Our mission is to bring transparency and warmth to the giving process, ensuring that every gift reaches orphaned children who need it most.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4">
              {/* Placeholder for illustration - using a styled div */}
              <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simple illustration using SVG */}
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Background */}
                  <rect width="400" height="300" fill="#F0F9FF" />
                  
                  {/* Snowy ground */}
                  <rect x="0" y="200" width="400" height="100" fill="#F8FAFC" />
                  
                  {/* Pine trees in background */}
                  {[50, 150, 250, 350].map((x, i) => (
                    <g key={i}>
                      <path d={`M ${x} 200 L ${x-15} 250 L ${x+15} 250 Z`} fill="#166534" />
                      <path d={`M ${x} 180 L ${x-12} 220 L ${x+12} 220 Z`} fill="#15803D" />
                      <rect x={x-2} y={250} width="4" height="50" fill="#92400E" />
                    </g>
                  ))}
                  
                  {/* Children and adult */}
                  <circle cx="200" cy="180" r="15" fill="#FED7AA" />
                  <path d="M 200 195 L 200 220 L 190 230 L 210 230 Z" fill="#EB8E89" />
                  <circle cx="150" cy="190" r="12" fill="#FED7AA" />
                  <path d="M 150 202 L 150 220 L 142 228 L 158 228 Z" fill="#EB8E89" />
                  <circle cx="250" cy="190" r="12" fill="#FED7AA" />
                  <path d="M 250 202 L 250 220 L 242 228 L 258 228 Z" fill="#EB8E89" />
                  
                  {/* Gift boxes */}
                  <rect x="120" y="230" width="20" height="20" fill="#EB8E89" rx="2" />
                  <rect x="260" y="230" width="20" height="20" fill="#EB8E89" rx="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section with Background */}
      <section className="relative w-full h-[400px] overflow-hidden">
        {/* Background with snowy mountains */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="skyGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#F0F9FF" />
              </linearGradient>
              <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            
            <rect width="1200" height="400" fill="url(#skyGradient2)" />
            <path d="M 0 300 L 200 150 L 400 200 L 600 100 L 800 180 L 1000 120 L 1200 200 L 1200 400 L 0 400 Z" fill="url(#mountainGradient2)" />
            <path d="M 0 350 L 150 220 L 350 280 L 550 180 L 750 250 L 950 200 L 1200 280 L 1200 400 L 0 400 Z" fill="#F1F5F9" />
            
            {[150, 250, 450, 550, 750, 850, 1050].map((x, i) => (
              <g key={i}>
                <path d={`M ${x} 350 L ${x-20} 400 L ${x+20} 400 Z`} fill="#166534" />
                <path d={`M ${x} 330 L ${x-15} 370 L ${x+15} 370 Z`} fill="#15803D" />
                <path d={`M ${x} 310 L ${x-10} 340 L ${x+10} 340 Z`} fill="#16A34A" />
                <rect x={x-3} y={400} width="6" height="50" fill="#92400E" />
              </g>
            ))}
          </svg>
        </div>

        {/* Footer Content */}
        <div className="relative z-10 flex items-center h-full px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-[#06384D]">About Us</h2>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
