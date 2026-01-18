export default function OrphanageCard({ orphanage }) {
  return (
    <div className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA] max-w-[530px]">
      <div className="inner-boarder border-2 border-[#06404D] p-[28px] font-manrope flex flex-col-reverse justify-between min-h-[270px] text-[16px]">
        <div className="bottom">
            <h1 className="font-bold text-[32px] mb-2 mt-3 font-redhatdisplay">{orphanage.name}</h1>
            <div className="sub-text flex flex-row justify-between">
                <p className="max-w-[300px]">{orphanage.description}</p>
                <button className="font-semibold bg-[#F2ABA7] text-[#FFFCFA] px-4 py-2 rounded-lg">VIEW ANGELS</button>
            </div>
        </div>
        <div className="top text-[#12707C] flex flex-row justify-between mb-4">
            <p>{orphanage.location}</p>
            <div className="border border-[#F2ABA7] p-1">
              <img src={orphanage.image} alt={orphanage.name} className="w-[75px] h-[81px] object-cover border-2 border-[#F2ABA7]"/>
            </div>
            {/* <p className="border border-[#06404D] px-4 py-2 rounded-lg">{orphanage.angelCount} Angels</p> */}
        </div>
      </div>
    </div>
  );
}