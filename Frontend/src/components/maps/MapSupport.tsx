import { useCallback, useEffect, useRef, useState } from 'react';
import { TileLayer, useMap } from 'react-leaflet';

export type MapTileStatus = 'loading' | 'ready' | 'offline';

type TileProvider = {
  id: string;
  label: string;
  url: string;
  attribution: string;
  subdomains?: string;
};

const configuredTileUrl = String(import.meta.env.VITE_MAP_TILE_URL || '').trim();
const errorTileUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#eef2f7"/>
    <path d="M0 64H256M0 128H256M0 192H256M64 0V256M128 0V256M192 0V256" stroke="#d9e2ec" stroke-width="1"/>
  </svg>
`)}`;

const TILE_PROVIDERS: TileProvider[] = [
  ...(configuredTileUrl
    ? [{
        id: 'configured',
        label: 'Nhà cung cấp bản đồ đã cấu hình',
        url: configuredTileUrl,
        attribution: import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; OpenStreetMap contributors',
      }]
    : []),
  {
    id: 'esri-street',
    label: 'Esri World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, OpenStreetMap contributors',
  },
  {
    id: 'openstreetmap',
    label: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
  },
];

interface ResilientTileLayerProps {
  onStatusChange?: (status: MapTileStatus, provider: TileProvider) => void;
}
/**
 * Leaflet normally keeps rendering an empty grey tile pane when a tile host is
 * unavailable. This layer changes provider after a complete provider failure
 * and reports an offline state so the screen can show a useful coordinate
 * fallback instead of a broken-looking map.
 */
export function ResilientTileLayer({ onStatusChange }: ResilientTileLayerProps) {
  const [providerIndex, setProviderIndex] = useState(0);
  const loadedTilesRef = useRef(0);
  const failedTilesRef = useRef(0);
  const switchingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const provider = TILE_PROVIDERS[providerIndex] || TILE_PROVIDERS[0];

  const switchProvider = useCallback(() => {
    if (switchingRef.current) return;
    switchingRef.current = true;

    if (providerIndex < TILE_PROVIDERS.length - 1) {
      setProviderIndex((current) => current + 1);
      return;
    }

    onStatusChange?.('offline', provider);
  }, [onStatusChange, provider, providerIndex]);

  useEffect(() => {
    loadedTilesRef.current = 0;
    failedTilesRef.current = 0;
    switchingRef.current = false;
    onStatusChange?.('loading', provider);

    timeoutRef.current = window.setTimeout(() => {
      if (loadedTilesRef.current === 0) switchProvider();
    }, 2800);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [provider, switchProvider, onStatusChange]);

  return (
    <TileLayer
      key={provider.id}
      url={provider.url}
      attribution={provider.attribution}
      subdomains={provider.subdomains || 'abc'}
      errorTileUrl={errorTileUrl}
      eventHandlers={{
        tileload: () => {
          loadedTilesRef.current += 1;
          onStatusChange?.('ready', provider);
          if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        },
        tileerror: () => {
          failedTilesRef.current += 1;
          // A viewport usually requests several tiles. Wait for a few failures
          // before failing over so one transient tile does not swap the map.
          if (loadedTilesRef.current === 0 && failedTilesRef.current >= 3) {
            switchProvider();
          }
        },
      }}
    />
  );
}

export function MapViewportFixer() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ pan: false, animate: false });
    const frame = window.requestAnimationFrame(invalidate);
    const delayed = window.setTimeout(invalidate, 250);
    window.addEventListener('resize', invalidate);

    const container = map.getContainer();
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(invalidate)
      : null;
    resizeObserver?.observe(container);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayed);
      window.removeEventListener('resize', invalidate);
      resizeObserver?.disconnect();
    };
  }, [map]);

  return null;
}

interface MapUnavailableCardProps {
  projectLocation?: { lat: number; lng: number; radius?: number };
  projectName?: string;
  onRetry: () => void;
  compact?: boolean;
}

export function MapUnavailableCard({
  projectLocation,
  projectName,
  onRetry,
  compact = false,
}: MapUnavailableCardProps) {
  return (
    <div className="absolute inset-0 z-[700] overflow-hidden bg-slate-100">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.25) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-blue-400/70 bg-blue-400/10" />
      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="flex size-11 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xl text-white shadow-lg">⌖</span>
        <span className="mt-2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-700 shadow">Vị trí geofence</span>
      </div>

      <div className={`absolute inset-x-3 bottom-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur ${compact ? 'max-w-xs' : 'max-w-sm'}`}>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">⌖</div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Bản đồ nền đang tạm thời không khả dụng</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Vị trí và bán kính vẫn được xác định bằng tọa độ chính xác. Bạn có thể thử tải lại hoặc tiếp tục với dữ liệu này.
            </p>
          </div>
        </div>
        {projectLocation && (
          <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            <p className="truncate font-semibold">{projectName || 'Dự án'}</p>
            <p className="mt-1 font-mono text-[11px]">{projectLocation.lat.toFixed(6)}, {projectLocation.lng.toFixed(6)}{projectLocation.radius ? ` · bán kính ${projectLocation.radius}m` : ''}</p>
          </div>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          Thử tải bản đồ lại
        </button>
      </div>
    </div>
  );
}
