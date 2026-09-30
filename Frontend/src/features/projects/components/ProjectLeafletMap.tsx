import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { MapContainer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  MapUnavailableCard,
  MapViewportFixer,
  ResilientTileLayer,
  type MapTileStatus,
} from '../../../components/maps/MapSupport';
import { useMapRetry } from '../../../components/maps/useMapRetry';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
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

interface GeocodeResult {
  place_id: string;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  kind?: string;
  source?: 'online' | 'offline';
}

interface PhotonFeature {
  properties?: Record<string, string | number | undefined>;
  geometry?: { coordinates?: [number, number] };
}

type LocalLocationPreset = {
  aliases: string[];
  name: string;
  address: string;
  lat: number;
  lng: number;
};

// Keeps the demo usable when an external geocoder is unavailable. These are
// city-centre suggestions only; the user can still refine the exact point by
// clicking the map or entering precise coordinates.
const LOCAL_LOCATION_PRESETS: LocalLocationPreset[] = [
  { aliases: ['hà nội', 'ha noi', 'hanoi', 'thủ đô'], name: 'Hà Nội', address: 'Hà Nội, Việt Nam', lat: 21.028511, lng: 105.854167 },
  { aliases: ['hồ chí minh', 'ho chi minh', 'thành phố hồ chí minh', 'tp hcm', 'tphcm', 'sài gòn', 'saigon'], name: 'Thành phố Hồ Chí Minh', address: 'Thành phố Hồ Chí Minh, Việt Nam', lat: 10.776889, lng: 106.700806 },
  { aliases: ['đà nẵng', 'da nang'], name: 'Đà Nẵng', address: 'Đà Nẵng, Việt Nam', lat: 16.054407, lng: 108.202166 },
  { aliases: ['hải phòng', 'hai phong'], name: 'Hải Phòng', address: 'Hải Phòng, Việt Nam', lat: 20.844911, lng: 106.688084 },
  { aliases: ['cần thơ', 'can tho'], name: 'Cần Thơ', address: 'Cần Thơ, Việt Nam', lat: 10.045162, lng: 105.746857 },
  { aliases: ['huế', 'hue'], name: 'Huế', address: 'Huế, Việt Nam', lat: 16.463713, lng: 107.590866 },
];

const DEMO_PROJECT_LOCATION_PRESETS: LocalLocationPreset[] = [
  {
    aliases: ['techbuilding', 'du an mau techbuilding', 'so van hoa', '47 pho hang dau'],
    name: 'Dự án mẫu TechBuilding',
    address: 'Sở Văn hóa và Thể thao Thành phố Hà Nội, 47 Phố Hàng Dầu, Phường Hoàn Kiếm, Hà Nội',
    lat: 21.0305769,
    lng: 105.8542169,
  },
  {
    aliases: ['green valley', 'khu do thi green valley', '54 trieu khuc', '54 trieu khúc', '54 pho trieu khuc', '54 phố triều khúc'],
    name: 'Khu đô thị Green Valley',
    address: 'Trường Đại học Công nghệ Giao thông vận tải, 54 Phố Triều Khúc, Phường Thanh Liệt, Hà Nội',
    lat: 20.9841022,
    lng: 105.7982674,
  },
  {
    aliases: ['pho hang bun', 'phố hàng bún', 'du an cong vien nuoc'],
    name: 'Dự án công viên nước',
    address: 'Phố Hàng Bún, Phường Ba Đình, Hà Nội',
    lat: 21.028511,
    lng: 105.854167,
  },
];

// A small offline street index keeps the autocomplete useful when the public
// geocoder is unavailable. Online results are still preferred whenever they
// can be loaded, while these entries cover the locations used in the demo.
const LOCAL_STREET_PRESETS: LocalLocationPreset[] = [
  {
    aliases: ['trieu khuc', '54 trieu khuc', 'pho trieu khuc', '54 pho trieu khuc'],
    name: 'Phố Triều Khúc',
    address: '54 Phố Triều Khúc, Phường Thanh Liệt, Hà Nội',
    lat: 20.9841022,
    lng: 105.7982674,
  },
  {
    aliases: ['hang dau', '47 hang dau', 'pho hang dau', '47 pho hang dau'],
    name: 'Phố Hàng Dầu',
    address: '47 Phố Hàng Dầu, Phường Hoàn Kiếm, Hà Nội',
    lat: 21.0305769,
    lng: 105.8542169,
  },
  {
    aliases: ['nguyen hue', 'duong nguyen hue'],
    name: 'Đường Nguyễn Huệ',
    address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Thành phố Hồ Chí Minh',
    lat: 10.776889,
    lng: 106.700806,
  },
  {
    aliases: ['tran hung dao', 'duong tran hung dao'],
    name: 'Đường Trần Hưng Đạo',
    address: 'Đường Trần Hưng Đạo, Phường Cầu Ông Lãnh, Thành phố Hồ Chí Minh',
    lat: 10.768285,
    lng: 106.692107,
  },
  {
    aliases: ['hang bun', 'pho hang bun'],
    name: 'Phố Hàng Bún',
    address: 'Phố Hàng Bún, Phường Ba Đình, Hà Nội',
    lat: 21.035272,
    lng: 105.841201,
  },
];

const ALL_LOCAL_LOCATION_PRESETS = [
  ...LOCAL_STREET_PRESETS,
  ...DEMO_PROJECT_LOCATION_PRESETS,
  ...LOCAL_LOCATION_PRESETS,
];

function normalizeSearchQuery(value: string) {
  return value
    .trim()
    .replace(/^(tìm|tra cứu|định vị|đặt vị trí|đặt địa điểm|vị trí)\s+(tại\s+)?/i, '')
    .replace(/\bTP\.?\s*HCM\b/gi, 'Thành phố Hồ Chí Minh')
    .replace(/\bTP\.?\s*HN\b/gi, 'Thành phố Hà Nội')
    .replace(/\bQ\.?\s*(\d+)\b/gi, 'Quận $1')
    .replace(/\bP(?:\.|\s+)\s*([^,]+?)(?=,|$)/gi, 'Phường $1')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCoordinateQuery(value: string) {
  const match = value.match(/(-?\d{1,3}(?:[.,]\d+)?)\s*[,;\s]+\s*(-?\d{1,3}(?:[.,]\d+)?)/);
  if (!match) return null;

  const first = Number(match[1].replace(',', '.'));
  const second = Number(match[2].replace(',', '.'));
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  const lat = Math.abs(first) <= 90 && Math.abs(second) <= 180 ? first : second;
  const lng = Math.abs(first) <= 90 && Math.abs(second) <= 180 ? second : first;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function toGeocodeResult(feature: PhotonFeature, index: number): GeocodeResult | null {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;
  const properties = feature.properties || {};
  const houseNumber = properties.housenumber ? String(properties.housenumber) : '';
  const street = properties.street ? String(properties.street) : '';
  const streetLabel = [houseNumber, street].filter(Boolean).join(' ').trim();
  const placeName = properties.name ? String(properties.name) : '';
  const displayName = [
    placeName || streetLabel,
    streetLabel && placeName !== streetLabel ? streetLabel : undefined,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ]
    .filter(Boolean)
    .map(String)
    .filter((part, partIndex, parts) => parts.indexOf(part) === partIndex)
    .join(', ');

  return {
    place_id: String(properties.osm_id || `photon-${index}`),
    name: streetLabel || placeName || undefined,
    display_name: displayName || 'Địa điểm từ dữ liệu bản đồ mở',
    lat: String(coordinates[1]),
    lon: String(coordinates[0]),
    kind: properties.type ? String(properties.type) : properties.osm_value ? String(properties.osm_value) : undefined,
    source: 'online',
  };
}

function findLocalLocationPreset(value: string) {
  const normalized = removeVietnameseAccents(normalizeSearchQuery(value));
  return ALL_LOCAL_LOCATION_PRESETS.find((preset) => preset.aliases.some((alias) => (
    removeVietnameseAccents(alias) === normalized
  )));
}

function removeVietnameseAccents(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function levenshteinDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
    for (let column = 0; column <= right.length; column += 1) previous[column] = current[column];
  }
  return previous[right.length];
}

function getSmartLocalSuggestions(value: string): GeocodeResult[] {
  const normalizedQuery = removeVietnameseAccents(normalizeSearchQuery(value));
  if (normalizedQuery.length < 2) return [];

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  return ALL_LOCAL_LOCATION_PRESETS
    .map((preset, index) => {
      const searchableText = removeVietnameseAccents(`${preset.name} ${preset.address} ${preset.aliases.join(' ')}`);
      const candidateTokens = searchableText.split(' ').filter(Boolean);
      let matchedTokens = 0;
      let score = 0;

      queryTokens.forEach((queryToken) => {
        if (searchableText.includes(queryToken)) {
          matchedTokens += 1;
          score += queryToken.length >= 4 ? 30 : 18;
          return;
        }

        const closeToken = candidateTokens.some((candidateToken) => (
          candidateToken.length >= 4 && levenshteinDistance(queryToken, candidateToken) <= 1
        ));
        if (closeToken) {
          matchedTokens += 1;
          score += 16;
        }
      });

      const coverage = matchedTokens / queryTokens.length;
      return {
        place_id: `local-${index}-${preset.name}`,
        name: preset.name,
        display_name: preset.address,
        lat: String(preset.lat),
        lon: String(preset.lng),
        kind: preset.name.startsWith('Phố') || preset.name.startsWith('Đường') ? 'Đường phố' : 'Địa điểm',
        source: 'offline' as const,
        score: score + coverage * 30,
        coverage,
      };
    })
    .filter((result) => result.coverage >= 0.5 && result.score >= 30)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((result) => ({
      place_id: result.place_id,
      name: result.name,
      display_name: result.display_name,
      lat: result.lat,
      lon: result.lon,
      kind: result.kind,
      source: result.source,
    }));
}

export function ProjectLeafletMap({ lat, lng, radius = 100, onLocationChange, zoom = 15 }: MapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>(''); // e.g. 'construction', 'building'
  const [searchError, setSearchError] = useState<string | null>(null);
  const [tileStatus, setTileStatus] = useState<MapTileStatus>('loading');
  
  const mapRef = useRef<L.Map | null>(null);
  const geocodeCacheRef = useRef(new Map<string, GeocodeResult[]>());
  const lastGeocodeAtRef = useRef(0);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const autocompleteRequestRef = useRef(0);
  const { retryKey, retry } = useMapRetry();
  const handleTileStatus = useCallback((status: MapTileStatus) => setTileStatus(status), []);
  const handleRetry = useCallback(() => {
    setTileStatus('loading');
    retry();
  }, [retry]);

  const fetchGeocoderResults = useCallback(async (query: string, signal?: AbortSignal) => {
    const normalizedQuery = normalizeSearchQuery(query);
    const cacheKey = `${normalizedQuery.toLocaleLowerCase('vi-VN')}|${searchCategory}`;
    const cachedResults = geocodeCacheRef.current.get(cacheKey);
    if (cachedResults) return cachedResults;

    const elapsed = Date.now() - lastGeocodeAtRef.current;
    if (elapsed < 900) {
      await new Promise((resolve) => window.setTimeout(resolve, 900 - elapsed));
    }
    if (signal?.aborted) return [];

    const params = new URLSearchParams({
      q: normalizedQuery,
      limit: '8',
    });
    const categoryTag = searchCategory === 'building'
      ? 'building'
      : searchCategory === 'office'
        ? 'office'
        : searchCategory === 'industrial'
          ? 'industrial'
          : '';
    if (categoryTag) params.set('osm_tag', categoryTag);

    if (mapRef.current) {
      const mapCenter = mapRef.current.getCenter();
      params.set('lat', String(mapCenter.lat));
      params.set('lon', String(mapCenter.lng));
      params.set('zoom', String(Math.round(mapRef.current.getZoom())));
    }

    const geocoderUrl = String(import.meta.env.VITE_GEOCODER_URL || 'https://photon.komoot.io/api/').replace(/\/$/, '');
    lastGeocodeAtRef.current = Date.now();
    const response = await fetch(`${geocoderUrl}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      },
      signal,
    });
    if (!response.ok) throw new Error(`Search failed (${response.status})`);

    const data = await response.json() as { features?: PhotonFeature[] };
    const results = (data.features || [])
      .map(toGeocodeResult)
      .filter((result): result is GeocodeResult => Boolean(result));
    geocodeCacheRef.current.set(cacheKey, results);
    return results;
  }, [searchCategory]);

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    autocompleteAbortRef.current?.abort();
    autocompleteRequestRef.current += 1;
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    if (!normalizedQuery) return;

    const coordinates = parseCoordinateQuery(normalizedQuery);
    if (coordinates) {
      onLocationChange(coordinates.lat, coordinates.lng, `Tọa độ ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`);
      setSearchResults([{
        place_id: 'manual-coordinate',
        name: 'Tọa độ thủ công',
        display_name: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        lat: String(coordinates.lat),
        lon: String(coordinates.lng),
      }]);
      setSearchError(null);
      setShowResults(true);
      return;
    }

    const localPreset = findLocalLocationPreset(normalizedQuery);
    if (localPreset) {
      onLocationChange(localPreset.lat, localPreset.lng, localPreset.address);
      setSearchResults([{
        place_id: `local-${localPreset.name}`,
        name: localPreset.name,
        display_name: localPreset.address,
        lat: String(localPreset.lat),
        lon: String(localPreset.lng),
        kind: localPreset.name.startsWith('Phố') || localPreset.name.startsWith('Đường') ? 'Đường phố' : 'Địa điểm',
        source: 'offline',
      }]);
      setSearchError(null);
      setShowResults(true);
      return;
    }

    const bestSmartSuggestion = getSmartLocalSuggestions(normalizedQuery)[0];
    if (bestSmartSuggestion) {
      onLocationChange(Number(bestSmartSuggestion.lat), Number(bestSmartSuggestion.lon), bestSmartSuggestion.display_name);
      setSearchResults([bestSmartSuggestion]);
      setSearchError(null);
      setShowResults(true);
      return;
    }

    if (normalizedQuery.length < 3) {
      setSearchError('Nhập ít nhất 3 ký tự hoặc nhập theo dạng: vĩ độ, kinh độ.');
      setSearchResults([]);
      setShowResults(true);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setSearchError(null);

    const controller = new AbortController();
    autocompleteAbortRef.current = controller;
    try {
      const results = await fetchGeocoderResults(normalizedQuery, controller.signal);
      if (controller.signal.aborted) return;
      setSearchResults(results);
      if (results.length === 0 && getSmartLocalSuggestions(normalizedQuery).length === 0) {
        setSearchError('Không tìm thấy tên đường hoặc địa chỉ phù hợp. Hãy thử thêm quận/thành phố hoặc nhập tọa độ.');
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Search error:', error);
      if (getSmartLocalSuggestions(normalizedQuery).length === 0) {
        setSearchError('Không thể kết nối dịch vụ tìm kiếm. Bạn có thể nhập tên đường khác hoặc tọa độ: 21.028511, 105.854167.');
      }
      setSearchResults([]);
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  };

  useEffect(() => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    const localSuggestions = getSmartLocalSuggestions(searchQuery);
    if (!showResults || normalizedQuery.length < 3 || parseCoordinateQuery(normalizedQuery)) {
      autocompleteAbortRef.current?.abort();
      setIsSearching(false);
      return undefined;
    }

    const requestId = autocompleteRequestRef.current + 1;
    autocompleteRequestRef.current = requestId;
    autocompleteAbortRef.current?.abort();
    const controller = new AbortController();
    autocompleteAbortRef.current = controller;
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      void fetchGeocoderResults(normalizedQuery, controller.signal)
        .then((results) => {
          if (controller.signal.aborted || requestId !== autocompleteRequestRef.current) return;
          setSearchResults(results);
          setSearchError(results.length === 0 && localSuggestions.length === 0
            ? 'Không tìm thấy tên đường hoặc địa chỉ phù hợp.'
            : null);
        })
        .catch((error) => {
          if (controller.signal.aborted || requestId !== autocompleteRequestRef.current) return;
          console.error('Autocomplete error:', error);
          setSearchResults([]);
          setSearchError(localSuggestions.length === 0
            ? 'Dịch vụ tìm kiếm đang tạm thời không khả dụng. Bạn vẫn có thể nhập tọa độ thủ công.'
            : null);
        })
        .finally(() => {
          if (!controller.signal.aborted && requestId === autocompleteRequestRef.current) setIsSearching(false);
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchGeocoderResults, searchQuery, searchCategory, showResults]);

  const selectResult = (result: GeocodeResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    const cleanAddress = result.display_name.split(' · ')[0].trim();
    onLocationChange(newLat, newLng, cleanAddress);
    setSearchResults([]);
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setShowResults(false);
  };

  const smartSuggestions = getSmartLocalSuggestions(searchQuery);

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchResults([]);
                  setIsSearching(false);
                  setSearchError(null);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder="Nhập địa chỉ, địa danh hoặc tọa độ..."
                className="w-full bg-[var(--color-surface)] py-3.5 pl-11 pr-32 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
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
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={isSearching}
                  className="rounded-lg bg-[var(--color-primary)] px-2.5 py-1.5 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
                  aria-label="Tìm địa điểm"
                >
                  Tìm
                </button>
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
            <p className="mt-1.5 inline-block max-w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 py-1 text-[10px] font-medium text-[var(--color-text-muted)] shadow-sm backdrop-blur">
              Gõ tên đường hoặc địa chỉ để xem gợi ý, ví dụ <span className="font-semibold">Nguyễn Huệ, Quận 1</span> hoặc <span className="font-mono">21.028511, 105.854167</span>.
            </p>

            {/* Advanced Filters Overlay */}
            {advancedMode && (
              <div className="mt-2 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-full mb-1">Lọc theo loại địa điểm</span>
                {[
                  { id: '', label: 'Tất cả' },
                  { id: 'building', label: 'Tòa nhà' },
                  { id: 'construction', label: 'Công trình' },
                  { id: 'office', label: 'Văn phòng' },
                  { id: 'industrial', label: 'Khu công nghiệp' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSearchCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${searchCategory === cat.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* AI Suggestions Dropdown */}
            {showResults && (searchQuery.length >= 2 || searchResults.length > 0 || Boolean(searchError)) && (
              <div className="absolute mt-2 w-full max-h-80 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm bg-opacity-95">
                {isSearching && searchResults.length === 0 && smartSuggestions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center gap-3">
                     <div className="size-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
                     <span className="animate-pulse">Đang tìm tên đường...</span>
                  </div>
                ) : smartSuggestions.length > 0 && searchResults.length === 0 ? (
                  <div className="divide-y divide-[var(--color-border)]/50">
                    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] opacity-70">
                      <span>Gợi ý thông minh</span>
                      <span className="normal-case tracking-normal text-[var(--color-text-muted)]">Từ dữ liệu sẵn có</span>
                    </div>
                    {smartSuggestions.map((result) => (
                      <button
                        key={result.place_id}
                        type="button"
                        onClick={() => selectResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-[var(--color-primary-light)]/10 rounded-lg transition-all flex items-start gap-3 group"
                      >
                        <div className="mt-1 p-1.5 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 7.5 7.5 0 1 1 15 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5" />
                          </svg>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {result.name || result.display_name.split(',')[0]}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed italic">
                            {result.display_name}
                          </span>
                        </div>
                        <div className="self-center text-[10px] font-bold text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                          Chọn
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchError ? (
                  <div className="p-5 text-center text-sm text-[var(--color-danger)]">
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-[var(--color-border)]/50">
                    <div className="px-3 py-1 text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest opacity-70 mb-1">Tên đường & địa chỉ</div>
                    {searchResults.map((result, idx) => (
                      <button
                        key={result.place_id}
                        type="button"
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
                          <span className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                            {result.display_name}{result.kind ? ` · ${result.kind}` : ''}
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
                    <button type="button" onClick={clearSearch} className="text-xs text-[var(--color-primary)] font-bold hover:underline">Thử lại với từ khóa khác</button>
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
          ref={mapRef}
        >
          <ResilientTileLayer key={retryKey} onStatusChange={handleTileStatus} />
          <MapViewportFixer />
          <Marker position={[lat, lng]} />
          {radius > 0 && (
            <Circle
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
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

        {tileStatus === 'offline' && (
          <MapUnavailableCard
            projectLocation={{ lat, lng, radius }}
            onRetry={handleRetry}
          />
        )}
        
        {/* Quick AI Info Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-[var(--color-surface)]/90 backdrop-blur-md p-3 rounded-xl border border-[var(--color-border)] shadow-lg max-w-[200px]">
           <div className="flex items-center gap-2 mb-1.5">
             <div className={`size-2 rounded-full ${tileStatus === 'offline' ? 'bg-amber-500' : tileStatus === 'loading' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
             <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Vị trí dự án</span>
           </div>
           <p className="text-[11px] text-[var(--color-text-primary)] leading-snug font-medium">
             Tọa độ: {lat.toFixed(6)}, {lng.toFixed(6)} · Bán kính: {radius}m
           </p>
        </div>
      </div>
    </div>
  );
}
