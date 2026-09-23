import client from './client';

export const registerUser = async (userData) => {
  const response = await client.post('/api/v1/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await client.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await client.get('/api/v1/auth/me');
  return response.data;
};
