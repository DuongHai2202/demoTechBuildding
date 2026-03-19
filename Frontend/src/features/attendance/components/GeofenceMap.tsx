import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
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
  const defaultCenter: [number, number] = [21.0285, 105.8542]; // Hanoi
  const center: [number, number] = projectLocation?.lat != null && projectLocation?.lng != null
    ? [projectLocation.lat, projectLocation.lng] 
    : userLocation?.lat != null && userLocation?.lng != null
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer 
      center={center} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
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
          <RecenterMap position={[projectLocation.lat, projectLocation.lng]} />
        </>
      )}

      {userLocation?.lat != null && userLocation?.lng != null && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
