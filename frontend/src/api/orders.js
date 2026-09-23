import client from './client';

export const placeOrder = async (orderData) => {
  const response = await client.post('/api/v1/orders', orderData);
  return response.data;
};

export const fetchMyOrders = async (params = {}) => {
  const response = await client.get('/api/v1/orders/mine', { params });
  return response.data;
};

export const fetchIncomingOrders = async (params = {}) => {
  const response = await client.get('/api/v1/orders/incoming', { params });
  return response.data;
};

export const fetchOrderDetails = async (orderId) => {
  const response = await client.get(`/api/v1/orders/${orderId}`);
  return response.data;
};

export const acceptOrder = async (orderId) => {
  const response = await client.post(`/api/v1/orders/${orderId}/accept`);
  return response.data;
};

export const rejectOrder = async (orderId, reason = '') => {
  const response = await client.post(`/api/v1/orders/${orderId}/reject`, null, {
    params: { reason }
  });
  return response.data;
};

export const cancelOrder = async (orderId, reason = '') => {
  const response = await client.post(`/api/v1/orders/${orderId}/cancel`, null, {
    params: { reason }
  });
  return response.data;
};
