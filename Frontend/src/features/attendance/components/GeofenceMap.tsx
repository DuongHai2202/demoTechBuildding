import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import {
  MapUnavailableCard,
  MapViewportFixer,
  ResilientTileLayer,
  type MapTileStatus,
} from '../../../components/maps/MapSupport';
import { useMapRetry } from '../../../components/maps/useMapRetry';

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface GeofenceMapProps {
  projectLocation?: { lat: number; lng: number; radius: number };
  userLocation?: { lat: number; lng: number };
  projectName?: string;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export function GeofenceMap({ projectLocation, userLocation, projectName }: GeofenceMapProps) {
  const [tileStatus, setTileStatus] = useState<MapTileStatus>('loading');
  const { retryKey, retry } = useMapRetry();
  const handleTileStatus = useCallback((status: MapTileStatus) => setTileStatus(status), []);
  const handleRetry = useCallback(() => {
    setTileStatus('loading');
    retry();
  }, [retry]);
  const defaultCenter: [number, number] = [21.0285, 105.8542]; // Hanoi
  const center: [number, number] = projectLocation?.lat != null && projectLocation?.lng != null
      ? [projectLocation.lat, projectLocation.lng]
    : userLocation?.lat != null && userLocation?.lng != null
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  const userIcon = new L.Icon({
    iconUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
      <ResilientTileLayer key={retryKey} onStatusChange={handleTileStatus} />
      <MapViewportFixer />
      
      {projectLocation?.lat != null && projectLocation?.lng != null && (
        <>
          <Marker position={[projectLocation.lat, projectLocation.lng]}>
            <Popup>
              <strong>{projectName || 'Dự án'}</strong><br />
              Vùng Geofence: {projectLocation.radius || 0}m
            </Popup>
          </Marker>
          {projectLocation.radius != null && (
            <Circle 
              center={[projectLocation.lat, projectLocation.lng]} 
              radius={projectLocation.radius}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }}
            />
          )}
        </>
      )}

      {userLocation?.lat != null && userLocation?.lng != null && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
      )}
      <RecenterMap position={center} />
    </MapContainer>
      {tileStatus === 'offline' && (
        <MapUnavailableCard
          projectLocation={projectLocation}
          projectName={projectName}
          onRetry={handleRetry}
          compact
        />
      )}
    </div>
  );
}
