import OrphanageCard from '../components/OrphanageCard'

function Listings(){
    return(
        <div>
            <OrphanageCard orphanage={{ 
            name: "The Childen's Foundation",
            location: "Vancouver, BC",
            description: "Empowering youth through education and community.",
            angelCount: 21,
            }} />
      </div>
    )
}

export default Listings