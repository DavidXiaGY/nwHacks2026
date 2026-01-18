import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginSignup from './pages/LoginSignup'
import OrganizerUpload from './components/OrganizerUpload'
import Listings from './pages/Listings'
import OrphanageDetails from './pages/OrphanageDetails'
import InteractiveMap from './pages/InteractiveMap'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
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
