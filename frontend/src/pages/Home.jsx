import { Link } from 'react-router-dom'
import StatBlock from '../components/StatBlock'
import HeroBackground from '../assets/HeroBackground.png'

function Home() {

  return (
    <div className="min-h-screen bg-[#FFFCFA]">
      {/* Hero Section */}
      <section className="relative w-full h-[630px] overflow-hidden">
        {/* Background with hero background image */}
        <div className="absolute inset-0">
          <img 
            src={HeroBackground} 
            alt="Hero background with mountains and trees" 
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="body-lg text-default !text-[40px] !font-bold mb-[10px]">
            Every child deserves <span className="text-tertiary">a wish</span> come true.
          </h1>
          <p className="body-lg text-default !font-light">
            <span className="block">Easily donate gifts to verified orphanages near you,</span>
            <span className="block">ensuring your generosity makes a real, local impact.</span>
          </p>
          <Link
            to="/map"
            className="mt-[40px] px-[16px] py-[8px] bg-[#EB8E89] text-white rounded-[6px] body-default !font-bold hover:bg-[#d87d78] transition-all duration-300"
          >
            FIND AN ORPHANAGE
          </Link>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg className="w-6 h-6 text-[#0C626C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-[#FFFCFA] border-b border-black border-[0.5px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="body-default !font-bold !text-[32px] text-[#0C626C] mb-12">
            Hope delivered, one wish at a time
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px]">
            <StatBlock
              number="23,120"
              description="children helped last year"
              color="default"
            />
            <StatBlock
              number="849"
              description="people currently donating"
              color="tertiary"
            />
            <StatBlock
              number="14,528"
              description="gifts donated this year"
              color="default"
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-[#FFFCFA] border-b border-black border-[0.5px]">
        <div className="max-w-6xl mx-auto py-20 px-4">
          <div className="pb-12 mb-12">
            <h2 className="heading-lg text-default mb-6">About Us</h2>
            <p className="body-default text-default leading-relaxed max-w-[530px]">
              We created Angel Tree for Orphanages to give donors a trusted and easy way to support verified orphanages. Our mission is to bring transparency and warmth to the giving process, ensuring that every gift reaches orphaned children who need it most.
            </p>
          </div>
        </div>
        {/* Full-width border separating About Us from Contact Us */}
        <div className="w-full border-b border-black border-[0.5px]"></div>
        <div className="max-w-6xl mx-auto py-20 px-4">
          {/* Contact Us Footer */}
          <div className="pb-12">
            <h2 className="heading-default text-default mb-6">CONTACT US</h2>
            <div className="flex flex-wrap gap-8">
              <div className="body-default text-default">Email</div>
              <div className="body-default text-default">Phone Number</div>
              <div className="body-default text-default">FaceBook</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
