import Link from "next/link";

const maps = [
  "Abyss", "Split", "Ascent", "Haven", "Pearl", "Corrode", 
  "Fracture", "Bind", "Icebox", "Lotus", "Sunset", "Breeze"
];

export default function Home() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-red" style={{ fontSize: '3rem', marginBottom: '1rem' }}>VALORANT STRATEGIES</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>
          Select a map to view and share strategies, lineups, and setups.
        </p>
      </div>

      <div className="map-grid">
        {maps.map((map) => (
          <Link href={`/maps/${map.toLowerCase()}`} key={map}>
            <div className="map-card">
              <div className="map-card-content">
                <h3>{map}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
