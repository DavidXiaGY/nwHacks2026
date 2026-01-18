import './App.css'
import LoginSignup from './components/LoginSignup'
import OrphanageCard from './components/OrphanageCard'
import ChildInfoCard from './components/ChildInfoCard'

import OrphanageCard from './components/OrphanageCard'
import ChildInfoCard from './components/ChildInfoCard'


function App() {
  return (
    <><div>
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
    </div></>
  )
}

export default App
