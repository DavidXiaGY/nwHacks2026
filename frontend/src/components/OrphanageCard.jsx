export default function OrphanageCard({ orphanage }) {
  return (
    <div className="orphanage-card border border-[#06404D] p-4 bg-[#FFFCFA]">
        <div className="border-2 border-[#06404D] p-4">
            <h1 className="font-bold text-[3xl]">{orphanage.name}</h1>
            <p>{orphanage.description}</p>
            <button>View Angels</button>
            <p>{orphanage.location}</p>
            <p>Angels: {orphanage.angelCount}</p>
        </div>
    </div>
  );
}