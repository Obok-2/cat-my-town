import apiClient from './apiClient';

export const getCollectionCats = async () => {
  const data = await apiClient.get('/app/collection/cats');

  return data;
};

export const getCollectionCount = async () => {
  const data = await apiClient.get('/app/collection/count');

  return data;
};
