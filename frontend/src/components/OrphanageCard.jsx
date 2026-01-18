export default function OrphanageCard({ orphanage, onViewAngels }) {
  return (
    <div className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA] max-w-[530px]">
      <div className="inner-boarder border-2 border-[#06404D] p-4 font-manrope flex flex-col-reverse justify-between min-h-[270px] text-[16px]">
        <div className="bottom">
            <h1 className="font-bold text-[32px] mb-2 font-redhatdisplay">{orphanage.name}</h1>
            <div className="sub-text flex flex-row justify-between">
                <p className="max-w-[300px]">{orphanage.description}</p>
                <button 
                    onClick={onViewAngels}
                    className="bg-[#F2ABA7] text-[#FFFCFA] px-4 py-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                >
                    VIEW ANGELS
                </button>
            </div>
        </div>
        <div className="top text-[#12707C] flex flex-row justify-between items-center gap-4 mb-4">
            <p 
                className="flex-1 min-w-0"
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
                title={orphanage.location}
            >
                {orphanage.location}
            </p>
            <p 
                className="border border-[#06404D] px-4 py-2 rounded-lg flex-shrink-0"
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {orphanage.angelCount} Angels
            </p>
        </div>
      </div>
    </div>
  );
}