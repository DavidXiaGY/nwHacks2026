import OrphanageCard from '../components/OrphanageCard'

function Listings(){
    return(
        <div className="flex flex-col">
            <div className="header p-[48px] pb-[48px] h-[400px] w-full flex flex-col justify-end bg-[url('/src/assets/orphanTrees.svg')] bg-[right_bottom] bg-no-repeat bg-[length:65%]">
                <h1 className="text-[40px] font-bold font-redhatdisplay">
                    Orphanages
                </h1>
                <p className="font-manrope text-[#12707C]">Browse verified organizations and support children in your community</p>
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