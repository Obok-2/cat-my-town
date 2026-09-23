import apiClient from './apiClient';

export const getLevelCount = async () => {
  const data = await apiClient.get('/app/level/count');

  return data;
};
