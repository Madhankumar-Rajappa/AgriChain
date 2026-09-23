import client from './client';

export const processPayment = async (paymentData) => {
  const response = await client.post('/api/v1/payments', paymentData);
  return response.data;
};

export const fetchPaymentByOrderId = async (orderId) => {
  const response = await client.get(`/api/v1/payments/order/${orderId}`);
  return response.data;
};

export const fetchPaymentById = async (paymentId) => {
  const response = await client.get(`/api/v1/payments/${paymentId}`);
  return response.data;
};
