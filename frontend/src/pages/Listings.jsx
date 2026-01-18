import OrphanageCard from '../components/OrphanageCard'

function Listings(){
    return(
        <div className="flex flex-col">
            <div className="header h-[400px] w-full flex flex-col justify-end">
                <div className="background-img absolute right-[-450px] z-[-1]">
                    <img src="/src/assets/newTrees.svg" alt="Background"/>
                </div>
                <div className='p-[48px] pb-[48px]'>
                    <h1 className="text-[40px] font-bold font-redhatdisplay">
                        Orphanages
                    </h1>
                    <p className="font-manrope text-[#12707C]">Browse verified organizations and support children in your community</p>
                </div>
            </div>
            <div className="p-[48px] border-t-2 border-[#06404D]">
                <OrphanageCard orphanage={{ 
                    name: "The Children's Foundation",
                    location: "Vancouver, BC",
                    description: "Empowering youth through education and community.",
                    angelCount: 21,
                    image: "src/assets/holly.svg"
                }} />
            </div>
        </div>
    )
}

export default Listings