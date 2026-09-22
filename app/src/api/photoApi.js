const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const getCatPhotoSource = (catId, photoVersion) => {
  if (!catId) return null;
  const versionQuery = photoVersion ? `&v=${encodeURIComponent(photoVersion)}` : '';
  return {
    uri: `${API_URL}/app/photo?catId=${catId}${versionQuery}`,
  };
};
