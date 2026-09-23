import client from './client';

export const fetchAdminAnalytics = async () => {
  const response = await client.get('/api/v1/admin/analytics');
  return response.data;
};
