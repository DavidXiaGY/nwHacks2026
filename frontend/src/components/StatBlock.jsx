function StatBlock({ number, description, color = 'default' }) {
  const colorClasses = {
    default: {
      number: 'text-default',
      description: 'text-default opacity-70',
      border: 'border-default'
    },
    tertiary: {
      number: 'text-tertiary',
      description: 'text-tertiary opacity-70',
      border: 'border-tertiary'
    }
  }

  const colors = colorClasses[color] || colorClasses.default

  return (
    <div className="p-[14px] bg-[#F3F3F3] border-[1px] border-[#06384D]">
      <div className={`bg-white border ${colors.border} border-[2px] px-[40px] py-[50px] flex flex-col items-center text-center`}>
        {/* Number */}
        <div className={`body-default !text-5xl !font-extrabold ${colors.number} mb-2`}>
          {number}
        </div>
        
        {/* Description */}
        <div className={`body-default ${colors.description}`}>
          {description}
        </div>
      </div>
    </div>
  )
}

export default StatBlock
