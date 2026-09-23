import client from './client';

export const fetchWarehouses = async (params = {}) => {
  const response = await client.get('/api/v1/warehouses', { params });
  return response.data;
};

export const fetchWarehouseDetails = async (warehouseId) => {
  const response = await client.get(`/api/v1/warehouses/${warehouseId}`);
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const response = await client.post('/api/v1/warehouses', warehouseData);
  return response.data;
};

export const bookStorage = async (bookingData) => {
  const response = await client.post('/api/v1/warehouses/bookings', bookingData);
  return response.data;
};

export const fetchStorageBookings = async (params = {}) => {
  const response = await client.get('/api/v1/warehouses/bookings/list', { params });
  return response.data;
};

export const updateStorageStatus = async (bookingId, statusData) => {
  const response = await client.patch(`/api/v1/warehouses/bookings/${bookingId}/status`, statusData);
  return response.data;
};
