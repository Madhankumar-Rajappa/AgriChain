import client from './client';

export const fetchHealthCheck = async () => {
  const response = await client.get('/api/v1/health');
  return response.data;
};

export const fetchRootInfo = async () => {
  const response = await client.get('/');
  return response.data;
};
