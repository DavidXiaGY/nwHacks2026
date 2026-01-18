import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginSignup from './pages/LoginSignup'
import RegisterOrganization from './pages/RegisterOrganization'
import OrganizerUpload from './components/OrganizerUpload'
import Listings from './pages/Listings'
import OrphanageDetails from './pages/OrphanageDetails'
import InteractiveMap from './pages/InteractiveMap'
import Home from './pages/Home'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/register-organization" element={<RegisterOrganization />} />
        <Route path="/organizer-upload" element={<OrganizerUpload />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/orphanage-details" element={<OrphanageDetails />} />
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
