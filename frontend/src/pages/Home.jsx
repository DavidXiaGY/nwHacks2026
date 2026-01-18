import { Link } from 'react-router-dom'
import StatBlock from '../components/StatBlock'
import marketingTitleImg from '../assets/marketingTitleImg.png'
import marketingAboutUsImg from '../assets/marketingAboutUsImg.png'

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
        {/* Background with marketing title image */}
        <div className="absolute inset-0">
          <img 
            src={marketingTitleImg} 
            alt="Winter landscape with mountains and trees" 
            className="w-full h-full object-cover"
          />
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
              <img 
                src={marketingAboutUsImg} 
                alt="Children and adult with gifts in winter setting" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
