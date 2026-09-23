import client from './client';

export const fetchMyNotifications = async (params = {}) => {
  const response = await client.get('/api/v1/notifications/mine', { params });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await client.patch(`/api/v1/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await client.post('/api/v1/notifications/mark-all-read');
  return response.data;
};
