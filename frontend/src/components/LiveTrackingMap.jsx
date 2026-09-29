import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
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
  ShieldCheck,
  Maximize2,
  Layers,
  Route as RouteIcon
} from 'lucide-react';

// Controller component to smoothly center map or fit bounds
const MapViewController = ({ center, followTarget, fitBoundsTrigger, bounds }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size once on load to ensure full viewport tiles render
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        const leafletBounds = L.latLngBounds(bounds);
        if (leafletBounds.isValid()) {
          map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15, animate: true });
        }
      } catch (err) {
        console.warn('Could not fit map bounds:', err);
      }
    }
  }, [fitBoundsTrigger, bounds, map]);

  useEffect(() => {
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
      <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
        ${isLive ? `<div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4); animation: pulse 2s infinite;"></div>` : ''}
        <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #059669, #047857); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; transform: rotate(${heading || 0}deg); transition: transform 0.5s ease;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

const createPickupIcon = () => {
  return L.divIcon({
    className: 'custom-pickup-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7.5 4.27 9 5.15"/>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5"/>
            <path d="M12 22V12"/>
          </svg>
        </div>
        <div style="background: #1e3a8a; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 2px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          PICKUP
        </div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-destination-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #b91c1c); border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="background: #881337; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 2px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          DESTINATION
        </div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export default function LiveTrackingMap({
  shipment,
  latestLocation,
  historyPoints = [],
  connectionStatus = 'LIVE',
  isTrackingActive = false,
  pickupCoords = null,
  destinationCoords = null,
  routeGeometry = null,
  routeDistanceKm = null,
  routeDurationMin = null
}) {
  const [followTransporter, setFollowTransporter] = useState(true);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(1);
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

  // Recorded polyline history (GPS Trail)
  const gpsTrailPositions = useMemo(() => {
    return historyPoints
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude, p.longitude]);
  }, [historyPoints]);

  // Road Route polyline (from OSRM routing engine)
  const roadRoutePositions = useMemo(() => {
    if (!routeGeometry || !Array.isArray(routeGeometry) || routeGeometry.length === 0) {
      return [];
    }
    // routeGeometry is array of [lat, lng]
    return routeGeometry;
  }, [routeGeometry]);

  // Calculate bounding coordinates encompassing all elements
  const allBounds = useMemo(() => {
    const pts = [];
    if (pickupCoords) pts.push(pickupCoords);
    if (destinationCoords) pts.push(destinationCoords);
    if (latestLocation?.latitude && latestLocation?.longitude) {
      pts.push([latestLocation.latitude, latestLocation.longitude]);
    }
    if (roadRoutePositions.length > 0) {
      pts.push(...roadRoutePositions);
    }
    return pts;
  }, [pickupCoords, destinationCoords, latestLocation, roadRoutePositions]);

  // Auto-fit bounds on initial load if route / coords available
  useEffect(() => {
    if (allBounds.length > 1) {
      setFitBoundsTrigger((prev) => prev + 1);
    }
  }, [pickupCoords, destinationCoords, roadRoutePositions.length]);

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

  const handleFitAll = () => {
    setFollowTransporter(false);
    setFitBoundsTrigger((prev) => prev + 1);
  };

  const handleToggleFollow = () => {
    setFollowTransporter((prev) => !prev);
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900">
      {/* Interactive Leaflet Map */}
      <MapContainer
        center={currentPos}
        zoom={latestLocation ? 13 : 7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url={tileUrl}
          maxZoom={19}
        />

        <MapViewController
          center={currentPos}
          followTarget={followTransporter}
          fitBoundsTrigger={fitBoundsTrigger}
          bounds={allBounds}
        />

        {/* Real Road Route Polyline (OSRM Highway/Road Network) */}
        {roadRoutePositions.length > 1 && (
          <>
            {/* Road route outer glow/casing */}
            <Polyline
              positions={roadRoutePositions}
              pathOptions={{
                color: '#1e40af',
                weight: 8,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Road route main line */}
            <Polyline
              positions={roadRoutePositions}
              pathOptions={{
                color: '#3b82f6',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-semibold">
                  🛣️ Road Route {routeDistanceKm ? `• ${routeDistanceKm} km` : ''}
                </div>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* Recorded GPS Trail Polyline */}
        {gpsTrailPositions.length > 1 && (
          <Polyline
            positions={gpsTrailPositions}
            pathOptions={{
              color: '#10b981',
              weight: 4,
              opacity: 0.95,
              dashArray: '6, 8',
              lineJoin: 'round'
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-semibold text-emerald-700">
                🟢 Live GPS Recorded Trail ({gpsTrailPositions.length} points)
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Pickup Marker */}
        {pickupCoords && (
          <Marker position={pickupCoords} icon={createPickupIcon()}>
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs uppercase tracking-wider mb-1">
                  <span>📍 Origin (Pickup Farm)</span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {shipment?.pickup_address || 'Pickup Point'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {pickupCoords[0]?.toFixed(4)}° N, {pickupCoords[1]?.toFixed(4)}° E
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationCoords && (
          <Marker position={destinationCoords} icon={createDestinationIcon()}>
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs uppercase tracking-wider mb-1">
                  <span>🎯 Delivery Destination</span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {shipment?.delivery_address || 'Destination Point'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {destinationCoords[0]?.toFixed(4)}° N, {destinationCoords[1]?.toFixed(4)}° E
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live Transporter Marker */}
        {latestLocation && latestLocation.latitude && latestLocation.longitude && (
          <Marker
            position={[latestLocation.latitude, latestLocation.longitude]}
            icon={createTransporterIcon(latestLocation.heading, isTrackingActive)}
          >
            <Popup>
              <div className="p-1 min-w-[190px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-sm mb-1.5 border-b border-slate-100 pb-1">
                  <span>🚚 {shipment?.vehicle_number || 'Transport Vehicle'}</span>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Driver:</strong> {shipment?.driver_name || 'Assigned Driver'}</p>
                  <p><strong>Speed:</strong> {latestLocation.speed ? `${Math.round(latestLocation.speed)} km/h` : 'Stopped / Slow'}</p>
                  <p><strong>Heading:</strong> {latestLocation.heading ? `${Math.round(latestLocation.heading)}°` : 'N/A'}</p>
                  <p><strong>Accuracy:</strong> {latestLocation.accuracy ? `±${Math.round(latestLocation.accuracy)}m` : 'Normal'}</p>
                  <p><strong>Last Ping:</strong> {timeAgo}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Connection Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg border border-slate-700">
          {connectionStatus === 'LIVE' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">Live GPS Stream</span>
            </>
          )}
          {connectionStatus === 'RECONNECTING' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="text-amber-400">Reconnecting Stream...</span>
            </>
          )}
          {connectionStatus === 'OFFLINE' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-rose-400">Offline / Disconnected</span>
            </>
          )}
          {connectionStatus === 'STOPPED' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-300">Tracking Paused</span>
            </>
          )}
        </div>

        {/* Action Controls: Fit Route & Follow Truck */}
        <div className="pointer-events-auto flex items-center gap-2">
          {allBounds.length > 0 && (
            <button
              onClick={handleFitAll}
              title="Fit entire road route and locations on screen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md bg-slate-900/85 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Fit Route</span>
            </button>
          )}

          <button
            onClick={handleToggleFollow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
              followTransporter
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-slate-900/85 text-slate-200 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{followTransporter ? 'Centering Truck' : 'Follow Truck'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-800 text-white text-[11px] space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 rounded bg-blue-500"></span>
            <span className="text-slate-300">Planned Road Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded bg-emerald-400 border-b border-dashed border-white"></span>
            <span className="text-slate-300">Live GPS Trail</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Telemetry Panel */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-800 text-white w-full sm:w-80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                {isTrackingActive ? '🟢 IN TRANSIT (LIVE)' : '⚪ LAST KNOWN POSITION'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2.5 text-center text-xs">
            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Speed</span>
              <span className="text-sm font-bold text-slate-100">
                {latestLocation?.speed ? `${Math.round(latestLocation.speed)} km/h` : '0 km/h'}
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Accuracy</span>
              <span className="text-sm font-bold text-slate-100">
                {latestLocation?.accuracy ? `±${Math.round(latestLocation.accuracy)}m` : '±10m'}
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-2">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Heading</span>
              <span className="text-sm font-bold text-slate-100 flex items-center justify-center gap-0.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {latestLocation?.heading ? `${Math.round(latestLocation.heading)}°` : 'N/A'}
              </span>
            </div>
          </div>

          {latestLocation && (
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span className="font-mono">
                {latestLocation.latitude?.toFixed(4)}°, {latestLocation.longitude?.toFixed(4)}°
              </span>
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
