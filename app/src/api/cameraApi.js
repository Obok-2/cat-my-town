import axios from 'axios';
import { Platform } from 'react-native';
import apiClient from './apiClient';

export const getCameraWeekCount = async () => {
  const data = await apiClient.get('/app/camera/week-count');

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

  const data = await apiClient.post('/app/camera/analyze', body);

  return data;
};
