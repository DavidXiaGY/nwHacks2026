import './App.css'
import LoginSignup from './components/LoginSignup'
import OrphanageCard from './components/OrphanageCard'

function App() {
  return (
    <><div>
      <LoginSignup />
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
