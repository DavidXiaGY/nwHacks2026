import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginSignup from './components/LoginSignup'
import OrganizerUpload from './components/OrganizerUpload'
import OrphanageCard from './components/OrphanageCard'
import ChildInfoCard from './components/ChildInfoCard'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/organizer-upload" element={<OrganizerUpload />} />
        <Route 
          path="/" 
          element={
            <>
              <div>
                <LoginSignup />
                <ChildInfoCard 
                  child={{ 
                    id: "1", 
                    firstName: "Noah", 
                    age: 7, 
                    gender: "male",
                    wishlist: [
                      { id: "1", name: "Dinosaur figurine set" },
                      { id: "2", name: "LEGO building set" },
                      { id: "3", name: "Superhero action figure" }
                    ],
                    interests: "Loves dinosaurs, building blocks, and superhero toys."
                  }} 
                />
              </div>
              <div>
                <OrphanageCard orphanage={{ 
                  name: "The Childen's Foundation",
                  location: "Vancouver, BC",
                  description: "Empowering youth through education and community.",
                  angelCount: 21,
                }} />
              </div>
            </>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
