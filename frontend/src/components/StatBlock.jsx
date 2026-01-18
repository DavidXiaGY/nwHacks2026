function StatBlock({ icon, number, description }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="mb-4 text-5xl">
        {icon}
      </div>
      
      {/* Number */}
      <div className="text-5xl font-bold text-[#06384D] mb-2">
        {number}
      </div>
      
      {/* Description */}
      <div className="text-gray-600 text-lg">
        {description}
      </div>
    </div>
  )
}

export default StatBlock
