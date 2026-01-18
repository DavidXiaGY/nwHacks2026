export default function OrphanageCardSkeleton() {
  return (
    <div className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA] max-w-[530px]">
      <div className="inner-boarder border-2 border-[#06404D] p-[28px] font-manrope flex flex-col-reverse justify-between min-h-[270px]">
        <div className="bottom">
          <div 
            className="rounded mb-2 mt-3 w-3/4 animate-pulse"
            style={{ 
              height: '32px', 
              backgroundColor: '#E0E0E0' 
            }}
          ></div>
          <div className="sub-text flex flex-row justify-between">
            <div 
              className="rounded w-2/3 animate-pulse"
              style={{ 
                height: '16px', 
                backgroundColor: '#E0E0E0' 
              }}
            ></div>
            <div 
              className="rounded w-32 animate-pulse"
              style={{ 
                height: '40px', 
                backgroundColor: '#E0E0E0' 
              }}
            ></div>
          </div>
        </div>
        <div className="top flex flex-row justify-between mb-4">
          <div 
            className="rounded w-1/3 animate-pulse"
            style={{ 
              height: '20px', 
              backgroundColor: '#E0E0E0' 
            }}
          ></div>
          <div className="border border-[#F2ABA7] p-1">
            <div 
              className="w-[75px] h-[75px] rounded animate-pulse"
              style={{ backgroundColor: '#E0E0E0' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
