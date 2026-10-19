import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../hooks/useAuth';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  center?: Location;
  zoom?: number;
  markers?: Array<{ position: Location; title: string; type?: 'driver' | 'pickup' | 'destination' }>;
  onMapClick?: (e: any) => void;
  height?: string;
}

export default function MapComponent({ 
  center = { lat: 6.5244, lng: 3.3792 }, // Default to Lagos, Nigeria (change to generic or local)
  zoom = 15,
  markers = [],
  onMapClick,
  height = "100%"
}: MapComponentProps) {
  
  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-900 rounded-3xl border border-neutral-800 p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
        <p className="text-sm text-neutral-400 mb-6">Please add GOOGLE_MAPS_PLATFORM_KEY to your Secrets in AI Studio.</p>
        <div className="text-left text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
           <p>1. Open <b>Settings</b> (⚙️ top right)</p>
           <p>2. Go to <b>Secrets</b></p>
           <p>3. Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></p>
           <p>4. Paste your key and Save</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="w-full h-full rounded-2xl overflow-hidden border border-neutral-800">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="UBA_RIDE_MAP"
          onClick={onMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: height }}
          colorScheme="DARK"
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {markers.map((m, i) => (
            <AdvancedMarker key={i} position={m.position}>
              <MarkerContent type={m.type} />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

function MarkerContent({ type }: { type?: string }) {
  switch (type) {
    case 'driver':
      return <Pin background="#f97316" glyphColor="#fff" borderColor="#c2410c" />;
    case 'pickup':
      return <Pin background="#3b82f6" glyphColor="#fff" />;
    case 'destination':
      return <Pin background="#10b981" glyphColor="#fff" />;
    default:
      return <Pin background="#ef4444" glyphColor="#fff" />;
  }
}
