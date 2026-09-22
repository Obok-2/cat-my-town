import axios from 'axios';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const getCollectionCats = async () => {
  const data = await axios.get(`${API_URL}/app/collection/cats`, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};

export const getCollectionCount = async () => {
  const data = await axios.get(`${API_URL}/app/collection/count`, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};
