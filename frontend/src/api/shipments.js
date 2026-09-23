import client from './client';

export const createShipment = async (shipmentData) => {
  const response = await client.post('/api/v1/shipments', shipmentData);
  return response.data;
};

export const fetchMyShipments = async (params = {}) => {
  const response = await client.get('/api/v1/shipments/mine', { params });
  return response.data;
};

export const fetchShipmentByOrderId = async (orderId) => {
  const response = await client.get(`/api/v1/shipments/order/${orderId}`);
  return response.data;
};

export const fetchShipmentById = async (shipmentId) => {
  const response = await client.get(`/api/v1/shipments/${shipmentId}`);
  return response.data;
};

export const updateShipmentStatus = async (shipmentId, statusData) => {
  const response = await client.patch(`/api/v1/shipments/${shipmentId}/status`, statusData);
  return response.data;
};
