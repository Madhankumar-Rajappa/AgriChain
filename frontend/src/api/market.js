import client from './client';

export const fetchMarketPrices = async (params = {}) => {
  const response = await client.get('/api/v1/market/prices', { params });
  return response.data;
};

export const fetchMarketCommodities = async () => {
  const response = await client.get('/api/v1/market/commodities');
  return response.data;
};

export const fetchMarketLocations = async () => {
  const response = await client.get('/api/v1/market/locations');
  return response.data;
};
