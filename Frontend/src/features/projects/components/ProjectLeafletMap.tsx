import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  lat: number;
  lng: number;
  radius?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  zoom?: number;
}

// Component to handle map clicks and manual center updates
function MapController({
  center,
  onLocationChange
}: {
  center: [number, number];
  onLocationChange: (lat: number, lng: number) => void
}) {
  const map = useMap();
  const prevCenterRef = useRef<string>('');

  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    const centerKey = `${center[0]},${center[1]}`;
    if (centerKey !== prevCenterRef.current) {
      map.flyTo(center, Math.max(map.getZoom(), 15));
      prevCenterRef.current = centerKey;
    }
  }, [center, map]);

  return null;
}

export function ProjectLeafletMap({ lat, lng, radius = 100, onLocationChange, zoom = 15 }: MapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>(''); // e.g. 'construction', 'building'
  
  const mapRef = useRef<L.Map | null>(null);
  const searchTimeoutRef = useRef<any>(null); // Use any or ReturnType for broader compatibility

  // AI-Style Autocomplete: Search as you type with debounce
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(undefined, true);
    }, 600); 

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, searchCategory]);

  const handleSearch = async (e?: React.FormEvent, isAutocomplete = false) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!isAutocomplete) setIsSearching(true);
    setShowResults(true);
    
    try {
      // "Viewpoint Biasing" - Prioritize local but fallback globally (removed bounded=1)
      let biasParams = '';
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        const viewbox = `${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`;
        biasParams = `&viewbox=${viewbox}`; 
      }

      const categoryFilter = searchCategory ? `+${searchCategory}` : '';
      // Clean up common Vietnamese abbreviations that Nominatim might struggle with
      const cleanedQuery = searchQuery
        .replace(/\bP\.\s/gi, 'Phố ')
        .replace(/\bQ\.\s/gi, 'Quận ')
        .replace(/\bTP\.\s/gi, 'Thành phố ');

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedQuery + categoryFilter)}&limit=8&addressdetails=1${biasParams}`,
        {
          headers: { 'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8' }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      if (!isAutocomplete) setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    onLocationChange(newLat, newLng, result.display_name);
    setSearchResults([]);
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-4 relative">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1100] max-w-lg">
        <div className="flex flex-col gap-2">
          <div className="relative group">
            <div className="relative shadow-xl rounded-xl overflow-hidden border border-[var(--color-border)]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm thông minh (AI)..."
                className="w-full bg-[var(--color-surface)] py-3.5 pl-11 pr-24 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <MagnifyingGlassIcon className="size-5 text-[var(--color-primary)] opacity-70" />
              </div>
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="p-1.5 hover:bg-[var(--color-surface-alt)] rounded-full text-[var(--color-text-muted)] transition-colors"
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                )}
                <div className="h-6 w-px bg-[var(--color-border)] mx-1" />
                <button
                  type="button"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className={`p-1.5 rounded-md transition-all ${advancedMode ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]'}`}
                  title="Tìm kiếm chuyên sâu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 12h7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Advanced Filters Overlay */}
            {advancedMode && (
              <div className="mt-2 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-full mb-1">Lọc theo hạng mục AI</span>
                {[
                  { id: '', label: 'Tất cả' },
                  { id: 'building', label: 'Tòa nhà' },
                  { id: 'construction', label: 'Công trình' },
                  { id: 'office', label: 'Văn phòng' },
                  { id: 'industrial', label: 'Khu công nghiệp' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${searchCategory === cat.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* AI Suggestions Dropdown */}
            {showResults && (searchQuery.length >= 3 || searchResults.length > 0) && (
              <div className="absolute mt-2 w-full max-h-80 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm bg-opacity-95">
                {isSearching ? (
                  <div className="p-6 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center gap-3">
                     <div className="size-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
                     <span className="animate-pulse">AI đang phân tích địa điểm...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-[var(--color-border)]/50">
                    <div className="px-3 py-1 text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest opacity-70 mb-1">Gợi ý từ AI</div>
                    {searchResults.map((result, idx) => (
                      <button
                        key={result.place_id}
                        onClick={() => selectResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-[var(--color-primary-light)]/10 rounded-lg transition-all flex items-start gap-3 group"
                      >
                        <div className="mt-1 p-1.5 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {result.name || result.display_name.split(',')[0]}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 leading-relaxed italic">
                            {result.display_name}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] self-center font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          #{idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 3 && (
                  <div className="p-8 text-center flex flex-col items-center gap-2">
                    <div className="p-3 bg-[var(--color-surface-alt)] rounded-full text-[var(--color-text-muted)]">
                      <MagnifyingGlassIcon className="size-6 opacity-30" />
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">Không tìm thấy kết quả phù hợp</span>
                    <button onClick={clearSearch} className="text-xs text-[var(--color-primary)] font-bold hover:underline">Thử lại với từ khóa khác</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[500px] overflow-hidden rounded-2xl border border-[var(--color-border)] relative cursor-pointer">
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          className="h-full w-full z-0"
          ref={mapRef as any}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          {radius > 0 && (
            <Circle
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: 'var(--color-primary)',
                fillColor: 'var(--color-primary)',
                fillOpacity: 0.1,
                weight: 1.5,
                dashArray: '5, 10'
              }}
            />
          )}
          <MapController
            center={[lat, lng]}
            onLocationChange={(newLat, newLng) => onLocationChange(newLat, newLng)}
          />
        </MapContainer>
        
        {/* Quick AI Info Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-[var(--color-surface)]/90 backdrop-blur-md p-3 rounded-xl border border-[var(--color-border)] shadow-lg max-w-[200px]">
           <div className="flex items-center gap-2 mb-1.5">
             <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Hệ thống AI Hub</span>
           </div>
           <p className="text-[11px] text-[var(--color-text-primary)] leading-snug font-medium">
             Đang tìm kiếm toàn cầu, ưu tiên khu vực bạn đang xem.
           </p>
        </div>
      </div>
    </div>
  );
}
