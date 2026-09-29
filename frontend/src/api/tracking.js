import client from './client';

export const startTracking = async (shipmentId) => {
  const response = await client.post(`/api/v1/tracking/${shipmentId}/start`);
  return response.data;
};

export const stopTracking = async (shipmentId) => {
  const response = await client.post(`/api/v1/tracking/${shipmentId}/stop`);
  return response.data;
};

export const getLatestLocation = async (shipmentId) => {
  const response = await client.get(`/api/v1/tracking/${shipmentId}/latest`);
  return response.data;
};

export const getTrackingHistory = async (shipmentId, limit = 100) => {
  const response = await client.get(`/api/v1/tracking/${shipmentId}/history`, {
    params: { limit }
  });
  return response.data;
};

export const recordLocation = async (shipmentId, locationData) => {
  const response = await client.post(`/api/v1/tracking/${shipmentId}/location`, locationData);
  return response.data;
};
