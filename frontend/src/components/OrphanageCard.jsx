export default function OrphanageCard({ orphanage }) {
  return (
    <div className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA] max-w-[530px]">
      <div className="inner-boarder border-2 border-[#06404D] p-4 font-manrope flex flex-col-reverse justify-between min-h-[270px] text-[16px]">
        <div className="bottom">
            <h1 className="font-bold text-[32px] mb-2 font-redhatdisplay">{orphanage.name}</h1>
            <div className="sub-text flex flex-row justify-between">
                <p className="max-w-[300px]">{orphanage.description}</p>
                <button className="bg-[#F2ABA7] text-[#FFFCFA] px-4 py-2 rounded-lg">VIEW ANGELS</button>
            </div>
        </div>
        <div className="top text-[#12707C] flex flex-row justify-between mb-4">
            <p>{orphanage.location}</p>
            <p className="border border-[#06404D] px-4 py-2 rounded-lg">{orphanage.angelCount} Angels</p>
        </div>
      </div>
    </div>
  );
}