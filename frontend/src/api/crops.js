import client from './client';

export const createCrop = async (cropData) => {
  const response = await client.post('/api/v1/crops', cropData);
  return response.data;
};

export const fetchMyCrops = async (params = {}) => {
  const response = await client.get('/api/v1/crops/mine', { params });
  return response.data;
};

export const fetchAvailableCrops = async (params = {}) => {
  const response = await client.get('/api/v1/crops/available', { params });
  return response.data;
};

export const fetchCropDetails = async (cropId) => {
  const response = await client.get(`/api/v1/crops/${cropId}`);
  return response.data;
};

export const updateCrop = async (cropId, cropData) => {
  const response = await client.patch(`/api/v1/crops/${cropId}`, cropData);
  return response.data;
};

export const deactivateCrop = async (cropId) => {
  const response = await client.delete(`/api/v1/crops/${cropId}`);
  return response.data;
};
