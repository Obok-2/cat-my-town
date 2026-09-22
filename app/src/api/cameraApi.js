import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const getCameraWeekCount = async () => {
  const data = await axios.get(`${API_URL}/app/camera/week-count`, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};

export const analyzeCameraPhoto = async (photoUri) => {
  const body = new FormData();

  if (Platform.OS === 'web') {
    const photoResponse = await axios.get(photoUri, { responseType: 'blob' });
    body.append('photo', photoResponse.data, 'camera-photo.jpg');
  } else {
    body.append('photo', {
      uri: photoUri,
      name: 'camera-photo.jpg',
      type: 'image/jpeg',
    });
  }

  const data = await axios.post(`${API_URL}/app/camera/analyze`, body, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};
