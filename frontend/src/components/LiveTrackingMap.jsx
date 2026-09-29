import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Compass,
  Gauge,
  Wifi,
  WifiOff,
  Crosshair,
  MapPin,
  Package,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Controller component to smoothly center map when requested and ensure tile dimensions are recalculated
const MapViewController = ({ center, zoom, followTarget }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size once on load to ensure full viewport tiles render
    map.invalidateSize();
    if (center && followTarget) {
      map.panTo(center, { animate: true, duration: 1.0 });
    }
  }, [center, followTarget, map]);

  return null;
};

// Create custom SVG Leaflet DivIcons
const createTransporterIcon = (heading = 0, isLive = true) => {
  return L.divIcon({
    className: 'custom-transporter-marker',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        ${isLive ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(34, 197, 94, 0.35); animation: pulse 2s infinite;"></div>` : ''}
        <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #047857); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transform: rotate(${heading || 0}deg); transition: transform 0.5s ease;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
};

const createPickupIcon = () => {
  return L.divIcon({
    className: 'custom-pickup-marker',
    html: `
      <div style="width: 34px; height: 34px; border-radius: 50%; background: #3b82f6; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-destination-marker',
    html: `
      <div style="width: 34px; height: 34px; border-radius: 50%; background: #ef4444; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

export default function LiveTrackingMap({
  shipment,
  latestLocation,
  historyPoints = [],
  connectionStatus = 'LIVE',
  isTrackingActive = false,
  pickupCoords = null,
  destinationCoords = null
}) {
  const [followTransporter, setFollowTransporter] = useState(true);
  const [timeAgo, setTimeAgo] = useState('Just now');

  // Compute center position
  const currentPos = useMemo(() => {
    if (latestLocation?.latitude && latestLocation?.longitude) {
      return [latestLocation.latitude, latestLocation.longitude];
    }
    if (pickupCoords) return pickupCoords;
    if (destinationCoords) return destinationCoords;
    // Default fallback (Central India)
    return [20.5937, 78.9629];
  }, [latestLocation, pickupCoords, destinationCoords]);

  // Recorded polyline history
  const polylinePositions = useMemo(() => {
    return historyPoints
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude, p.longitude]);
  }, [historyPoints]);

  // Update time ago timer
  useEffect(() => {
    if (!latestLocation?.recorded_at) {
      setTimeAgo('Awaiting GPS...');
      return;
    }

    const updateTimer = () => {
      const recorded = new Date(latestLocation.recorded_at);
      const diffSecs = Math.max(0, Math.floor((new Date() - recorded) / 1000));
      if (diffSecs < 5) {
        setTimeAgo('Just now');
      } else if (diffSecs < 60) {
        setTimeAgo(`${diffSecs}s ago`);
      } else {
        const mins = Math.floor(diffSecs / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 3000);
    return () => clearInterval(interval);
  }, [latestLocation]);

  const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative w-full h-[520px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900">
      {/* Interactive Leaflet Map */}
      <MapContainer
        center={currentPos}
        zoom={latestLocation ? 14 : 7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url={tileUrl}
          maxZoom={19}
        />

        <MapViewController center={currentPos} followTarget={followTransporter} />

        {/* Pickup Marker */}
        {pickupCoords && (
          <Marker position={pickupCoords} icon={createPickupIcon()}>
            <Popup>
              <div className="p-1">
                <span className="font-semibold text-blue-700 text-xs uppercase tracking-wider block">Pickup Origin</span>
                <p className="text-sm font-medium text-slate-800">{shipment?.pickup_address || 'Origin Farm'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationCoords && (
          <Marker position={destinationCoords} icon={createDestinationIcon()}>
            <Popup>
              <div className="p-1">
                <span className="font-semibold text-rose-700 text-xs uppercase tracking-wider block">Delivery Destination</span>
                <p className="text-sm font-medium text-slate-800">{shipment?.delivery_address || 'Buyer Mandi/Store'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* GPS Path Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#059669',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 8',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Live Transporter Marker */}
        {latestLocation && (
          <Marker
            position={[latestLocation.latitude, latestLocation.longitude]}
            icon={createTransporterIcon(latestLocation.heading, isTrackingActive)}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-sm mb-1">
                  <span>🚚 Vehicle: {shipment?.vehicle_number || 'Transporter'}</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Driver:</strong> {shipment?.driver_name || 'Assigned Driver'}</p>
                  <p><strong>Speed:</strong> {latestLocation.speed ? `${Math.round(latestLocation.speed)} km/h` : 'Stopped / Slow'}</p>
                  <p><strong>Accuracy:</strong> {latestLocation.accuracy ? `±${Math.round(latestLocation.accuracy)}m` : 'Normal'}</p>
                  <p><strong>Updated:</strong> {timeAgo}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Floating Telemetry & Connection Badge */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Connection Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg border border-slate-700">
          {connectionStatus === 'LIVE' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">Live Connection</span>
            </>
          )}
          {connectionStatus === 'RECONNECTING' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="text-amber-400">Reconnecting...</span>
            </>
          )}
          {connectionStatus === 'OFFLINE' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-rose-400">Offline</span>
            </>
          )}
          {connectionStatus === 'STOPPED' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-300">Tracking Stopped</span>
            </>
          )}
        </div>

        {/* Center on Transporter button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setFollowTransporter((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
              followTransporter
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{followTransporter ? 'Auto-Centering' : 'Center on Truck'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-800 text-white max-w-xl mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                {isTrackingActive ? '🟢 IN TRANSIT (LIVE GPS)' : '⚪ LAST KNOWN POSITION'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2.5 text-center text-xs">
            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase">Speed</span>
              <span className="text-sm font-bold text-slate-100">
                {latestLocation?.speed ? `${Math.round(latestLocation.speed)} km/h` : '0 km/h'}
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase">GPS Accuracy</span>
              <span className="text-sm font-bold text-slate-100">
                {latestLocation?.accuracy ? `±${Math.round(latestLocation.accuracy)} m` : '±10 m'}
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase">Bearing</span>
              <span className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {latestLocation?.heading ? `${Math.round(latestLocation.heading)}°` : 'N/A'}
              </span>
            </div>
          </div>

          {latestLocation && (
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>Lat: {latestLocation.latitude.toFixed(5)}, Lng: {latestLocation.longitude.toFixed(5)}</span>
              {latestLocation.accuracy > 50 && (
                <span className="text-amber-400 font-medium">⚠️ Low GPS precision</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
