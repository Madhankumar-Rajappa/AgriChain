import { useState, useEffect, useRef, useCallback } from 'react';

export const useTrackingWebSocket = (shipmentId, token) => {
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'LIVE', 'RECONNECTING', 'OFFLINE', 'STOPPED'
  const [latestLocation, setLatestLocation] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const isManuallyClosedRef = useRef(false);

  // Compute WebSocket URL
  const getWsUrl = useCallback(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    let wsBase = apiBase.replace(/^http/, 'ws');
    return `${wsBase}/api/v1/tracking/ws/${shipmentId}?token=${encodeURIComponent(token)}`;
  }, [shipmentId, token]);

  const connect = useCallback(() => {
    if (!shipmentId || !token) return;

    // Clean up any existing connection
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
    }

    try {
      const url = getWsUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('LIVE');
        retryCountRef.current = 0;

        // Start ping heartbeat
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessageTime(new Date());

          if (data.type === 'INITIAL_STATE') {
            setIsTrackingActive(!!data.is_tracking_active);
            if (data.shipment_status) setShipmentStatus(data.shipment_status);
            if (data.latest_location) {
              setLatestLocation(data.latest_location);
            }
          } else if (data.type === 'LOCATION_UPDATE') {
            setLatestLocation({
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: data.accuracy,
              speed: data.speed,
              heading: data.heading,
              altitude: data.altitude,
              recorded_at: data.recorded_at
            });
            setIsTrackingActive(true);
          } else if (data.type === 'TRACKING_STARTED') {
            setIsTrackingActive(true);
            if (data.shipment_status) setShipmentStatus(data.shipment_status);
          } else if (data.type === 'TRACKING_STOPPED') {
            setIsTrackingActive(false);
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message', err);
        }
      };

      ws.onclose = (event) => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        if (isManuallyClosedRef.current) {
          setConnectionStatus('STOPPED');
          return;
        }

        // Handle auto-reconnection
        const maxRetries = 10;
        if (retryCountRef.current < maxRetries) {
          setConnectionStatus('RECONNECTING');
          const delay = Math.min(2000 * Math.pow(1.5, retryCountRef.current), 15000);
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionStatus('OFFLINE');
        }
      };

      ws.onerror = (error) => {
        console.warn('[WS] WebSocket error:', error);
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
      setConnectionStatus('OFFLINE');
    }
  }, [getWsUrl, shipmentId, token]);

  useEffect(() => {
    isManuallyClosedRef.current = false;
    connect();

    return () => {
      isManuallyClosedRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [connect]);

  // Method for transporter to send location update via WebSocket
  const sendLocationUpdate = useCallback((locationData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'LOCATION_UPDATE',
        ...locationData
      }));
      return true;
    }
    return false;
  }, []);

  // Method for transporter to stop tracking via WebSocket
  const sendStopTracking = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'STOP_TRACKING'
      }));
      setIsTrackingActive(false);
      return true;
    }
    return false;
  }, []);

  return {
    connectionStatus,
    latestLocation,
    setLatestLocation,
    isTrackingActive,
    setIsTrackingActive,
    shipmentStatus,
    lastMessageTime,
    sendLocationUpdate,
    sendStopTracking,
    reconnect: connect
  };
};
