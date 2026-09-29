import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchShipmentById, updateShipmentStatus } from '../../api/shipments';
import {
  startTracking,
  stopTracking,
  getLatestLocation,
  getTrackingHistory,
  recordLocation,
  getRoute
} from '../../api/tracking';
import { useTrackingWebSocket } from '../../hooks/useTrackingWebSocket';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import {
  Truck,
  MapPin,
  Package,
  Phone,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Play,
  Square,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Radio,
  Navigation,
  Milestone,
  Route as RouteIcon,
  Compass,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function LiveShipmentTrackingPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('agrichain_token');

  const [shipment, setShipment] = useState(null);
  const [historyPoints, setHistoryPoints] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [trackingActionLoading, setTrackingActionLoading] = useState(false);

  // Watch position ID from navigator.geolocation
  const watchIdRef = useRef(null);

  // WebSocket hook
  const {
    connectionStatus,
    latestLocation,
    setLatestLocation,
    isTrackingActive,
    setIsTrackingActive,
    shipmentStatus: wsShipmentStatus,
    sendLocationUpdate,
    sendStopTracking
  } = useTrackingWebSocket(shipmentId, token);

  const isTransporter = user?.role === 'TRANSPORTER' || user?.role === 'ADMIN';

  // Load shipment, location history, and road route data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchShipmentById(shipmentId);
      setShipment(data);

      // Fetch road route geometry & distances
      try {
        const routeRes = await getRoute(shipmentId);
        if (routeRes) {
          setRouteData(routeRes);
        }
      } catch (rErr) {
        console.warn('Could not load road route:', rErr);
      }

      // Load location history
      try {
        const hist = await getTrackingHistory(shipmentId, 100);
        if (hist?.points) {
          setHistoryPoints(hist.points);
          if (hist.points.length > 0 && !latestLocation) {
            setLatestLocation(hist.points[hist.points.length - 1]);
          }
        }
      } catch (hErr) {
        console.warn('Could not load history points:', hErr);
      }
    } catch (err) {
      console.error('Failed to load shipment details:', err);
      setError(err.response?.data?.detail || 'Failed to load shipment details.');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, latestLocation, setLatestLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep history points updated when a new latestLocation arrives
  useEffect(() => {
    if (latestLocation?.latitude && latestLocation?.longitude) {
      setHistoryPoints((prev) => {
        const last = prev[prev.length - 1];
        if (
          !last ||
          last.latitude !== latestLocation.latitude ||
          last.longitude !== latestLocation.longitude
        ) {
          return [...prev, latestLocation];
        }
        return prev;
      });
    }
  }, [latestLocation]);

  // Cleanup geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Compute pickup and destination coordinates
  const pickupCoords = useMemo(() => {
    if (routeData?.pickup_coords && routeData.pickup_coords.length === 2) {
      return routeData.pickup_coords;
    }
    if (shipment?.pickup_lat && shipment?.pickup_lng) {
      return [shipment.pickup_lat, shipment.pickup_lng];
    }
    return null;
  }, [routeData, shipment]);

  const destinationCoords = useMemo(() => {
    if (routeData?.destination_coords && routeData.destination_coords.length === 2) {
      return routeData.destination_coords;
    }
    if (shipment?.destination_lat && shipment?.destination_lng) {
      return [shipment.destination_lat, shipment.destination_lng];
    }
    return null;
  }, [routeData, shipment]);

  // Progress percentage calculation
  const progressPercent = useMemo(() => {
    if (!routeData?.total_distance_km || routeData.total_distance_km <= 0) return 0;
    const travelled = routeData.distance_travelled_km || 0;
    const pct = Math.min(100, Math.max(0, Math.round((travelled / routeData.total_distance_km) * 100)));
    return pct;
  }, [routeData]);

  // Handler for transporter starting live tracking
  const handleStartTracking = async () => {
    if (!navigator.geolocation) {
      setPermissionError('Geolocation is not supported by your browser/device.');
      return;
    }

    try {
      setTrackingActionLoading(true);
      setPermissionError(null);

      // 1. Call backend start tracking endpoint
      const res = await startTracking(shipmentId);
      setIsTrackingActive(true);
      if (res.shipment_status && shipment) {
        setShipment({ ...shipment, shipment_status: res.shipment_status });
      }

      // 2. Request browser GPS permission and start watchPosition
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy, speed, heading, altitude } = position.coords;

          const locationPayload = {
            latitude,
            longitude,
            accuracy: accuracy || null,
            speed: speed !== null && speed !== undefined ? speed * 3.6 : null, // convert m/s to km/h
            heading: heading || null,
            altitude: altitude || null,
            timestamp: new Date(position.timestamp).toISOString()
          };

          // Send via WebSocket
          const sentViaWs = sendLocationUpdate(locationPayload);

          // If WS is not yet ready or failed, fallback to REST
          if (!sentViaWs) {
            try {
              await recordLocation(shipmentId, locationPayload);
            } catch (err) {
              console.warn('REST location fallback error:', err);
            }
          }

          // Update local state
          setLatestLocation({
            ...locationPayload,
            shipment_id: parseInt(shipmentId, 10),
            recorded_at: locationPayload.timestamp
          });
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          let msg = 'Unable to retrieve your location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please enable location permissions in your browser settings to share your live route.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable from your device GPS.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Device location request timed out. Retrying GPS lock...';
          }
          setPermissionError(msg);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    } catch (err) {
      console.error('Error starting live tracking:', err);
      setError(err.response?.data?.detail || 'Failed to start live tracking.');
    } finally {
      setTrackingActionLoading(false);
    }
  };

  // Handler for transporter stopping live tracking
  const handleStopTracking = async () => {
    try {
      setTrackingActionLoading(true);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      sendStopTracking();
      await stopTracking(shipmentId);
      setIsTrackingActive(false);
    } catch (err) {
      console.error('Error stopping live tracking:', err);
    } finally {
      setTrackingActionLoading(false);
    }
  };

  // Handler for marking shipment as DELIVERED
  const handleMarkDelivered = async () => {
    if (!window.confirm('Are you sure you want to mark this shipment as DELIVERED? This will complete the delivery and stop tracking.')) {
      return;
    }
    try {
      setTrackingActionLoading(true);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      sendStopTracking();

      const updated = await updateShipmentStatus(shipmentId, {
        shipment_status: 'DELIVERED',
        tracking_notes: 'Delivered successfully at buyer destination.'
      });
      setShipment(updated);
      setIsTrackingActive(false);
    } catch (err) {
      console.error('Failed to mark delivered:', err);
      alert(err.response?.data?.detail || 'Failed to update delivery status.');
    } finally {
      setTrackingActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Connecting Live Tracking GPS...</h3>
        <p className="text-sm text-slate-500 mt-1">Calculating road routes and map coordinates</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-rose-200 dark:border-rose-900 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Tracking</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 mb-6">{error || 'Shipment not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const currentStatus = wsShipmentStatus || shipment.shipment_status;
  const isDelivered = currentStatus === 'DELIVERED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Truck className="w-7 h-7 text-emerald-600" />
              <span>Live Shipment #{shipment.id}</span>
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentStatus === 'IN_TRANSIT'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : currentStatus === 'DELIVERED'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}
            >
              {currentStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Transporter GPS Live Control Bar */}
        {isTransporter && !isDelivered && (
          <div className="flex items-center gap-3">
            {!isTrackingActive ? (
              <button
                onClick={handleStartTracking}
                disabled={trackingActionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Live Tracking</span>
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                disabled={trackingActionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Live Tracking</span>
              </button>
            )}

            {currentStatus === 'IN_TRANSIT' && (
              <button
                onClick={handleMarkDelivered}
                disabled={trackingActionLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Delivered</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Permission Warning if Transporter GPS blocked */}
      {permissionError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">GPS Permission Needed</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">{permissionError}</p>
          </div>
        </div>
      )}

      {/* Route & Distance Telemetry Banner (if route calculated) */}
      {routeData && (
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <RouteIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Road Distance</p>
                <p className="text-lg font-extrabold text-white">{routeData.total_distance_km ? `${routeData.total_distance_km} km` : 'Calculating...'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Distance Travelled</p>
                <p className="text-lg font-extrabold text-emerald-400">{routeData.distance_travelled_km !== undefined ? `${routeData.distance_travelled_km} km` : '0 km'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Milestone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Remaining Distance</p>
                <p className="text-lg font-extrabold text-amber-400">{routeData.distance_remaining_km !== undefined ? `${routeData.distance_remaining_km} km` : `${routeData.total_distance_km || 0} km`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Est. Road Time</p>
                <p className="text-lg font-extrabold text-purple-300">
                  {routeData.total_duration_min
                    ? routeData.total_duration_min > 60
                      ? `${Math.floor(routeData.total_duration_min / 60)}h ${Math.round(routeData.total_duration_min % 60)}m`
                      : `${Math.round(routeData.total_duration_min)} mins`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Route Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Route Completion Progress</span>
              <span className="font-bold text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Shipment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map (2 Columns on Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <LiveTrackingMap
            shipment={shipment}
            latestLocation={latestLocation}
            historyPoints={historyPoints}
            connectionStatus={connectionStatus}
            isTrackingActive={isTrackingActive}
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            routeGeometry={routeData?.route_geometry}
            routeDistanceKm={routeData?.total_distance_km}
            routeDurationMin={routeData?.total_duration_min}
          />

          {/* Privacy & Operational Assurance Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Real-Time Route Telemetry:</strong> Accurate road network routing and GPS tracking powered by OpenStreetMap and OSRM engine.
              </span>
            </div>
            {isTrackingActive && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Broadcasting GPS</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shipment Telemetry & Route Lifecycle */}
        <div className="space-y-6">
          {/* Order & Cargo Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Consignment Details</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-semibold text-slate-900 dark:text-white">#{shipment.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Vehicle Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {shipment.vehicle_number}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Driver Name:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  {shipment.driver_name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Driver Contact:</span>
                <a
                  href={`tel:${shipment.driver_phone}`}
                  className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {shipment.driver_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Route Milestones */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Pickup & Delivery Route</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {/* Pickup Point */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shadow"></div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Origin (Pickup)
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {shipment.pickup_address}
                </p>
                {pickupCoords && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pickupCoords[0]?.toFixed(4)}°, {pickupCoords[1]?.toFixed(4)}°
                  </span>
                )}
              </div>

              {/* Delivery Destination */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500 shadow"></div>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Destination (Buyer)
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {shipment.delivery_address}
                </p>
                {destinationCoords && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {destinationCoords[0]?.toFixed(4)}°, {destinationCoords[1]?.toFixed(4)}°
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Shipment Lifecycle Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Shipment Milestones</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Assigned to Transporter', done: true },
                {
                  label: 'Picked Up from Farm',
                  done: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(currentStatus)
                },
                {
                  label: 'Live GPS In Transit',
                  done: ['IN_TRANSIT', 'DELIVERED'].includes(currentStatus)
                },
                { label: 'Delivered to Destination', done: currentStatus === 'DELIVERED' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`font-medium ${
                      step.done
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
