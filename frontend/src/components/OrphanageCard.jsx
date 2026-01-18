export default function OrphanageCard({ orphanage, onViewAngels, icon }) {
  return (
    <div 
      className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA] max-w-[530px]"
      style={{
        transition: 'background-color 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={onViewAngels}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#E5E5DF'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFCFA'
      }}
    >
      <div className="inner-boarder border-2 border-[#06404D] p-[28px] font-manrope flex flex-col-reverse justify-between min-h-[270px] text-[16px]">
        <div className="bottom">
            <h1 className="font-extrabold text-[32px] mb-2 mt-3 font-redhatdisplay" style={{ color: '#06384D' }}>{orphanage.name}</h1>
            <div className="sub-text flex flex-row justify-between">
                <p className="max-w-[300px]" style={{ color: '#06384D' }}>{orphanage.description}</p>
                <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewAngels()
                    }}
                    className="font-semibold bg-[#F2ABA7] text-[#FFFCFA] px-4 py-2 rounded-[6px] hover:bg-[#06384D] transition-all duration-300I h cursor-pointer"
                >
                    VIEW ANGELS
                </button>
            </div>
        </div>
        <div className="top text-[#12707C] flex flex-row justify-between mb-4 !font-semibold">
            <p>{orphanage.location}</p>
            <div className="border border-[#F2ABA7] p-1">
                <img src={icon} alt="Decoration" className="w-[75px] h-[75px] object-cover border-2 border-[#F2ABA7]"/>
            </div>
        </div>
      </div>
    </div>
  );
}