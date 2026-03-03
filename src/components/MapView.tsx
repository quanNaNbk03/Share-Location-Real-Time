import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix leaflet icon issue với Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon màu đỏ tươi
const customIcon = L.divIcon({
    html: `
    <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
      <div style="
        position:absolute;
        width:40px; height:40px;
        border-radius:50%;
        border:3px solid #e63946;
        animation:pulse-ring 2s ease-out infinite;
      "></div>
      <div style="
        width:20px; height:20px;
        background:linear-gradient(135deg,#e63946,#f4a261);
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 4px 12px rgba(230,57,70,0.6);
        z-index:1;
      "></div>
    </div>
  `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Sub-component để auto-fly to location khi thay đổi
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 17), { duration: 1.2 });
    }, [lat, lng, map]);
    return null;
}

interface MapViewProps {
    lat: number;
    lng: number;
    username?: string | null;
}

export function MapView({ lat, lng, username }: MapViewProps) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={17}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={customIcon}>
                <Popup>
                    <div style={{ textAlign: 'center', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                        <strong>📍 {username ? username : 'Tôi đang ở đây'}</strong>
                        <br />
                        <small>
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                        </small>
                    </div>
                </Popup>
            </Marker>
            <FlyToLocation lat={lat} lng={lng} />
        </MapContainer>
    );
}

