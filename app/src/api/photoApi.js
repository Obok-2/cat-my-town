const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const getCatPhotoSource = (catId) => {
  if (!catId) return null;
  return {
    uri: `${API_URL}/app/photo?catId=${catId}`,
    headers: {
      'X-User-Id': '1',
    },
  };
};
