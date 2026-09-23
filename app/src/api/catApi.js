import axios from 'axios';
import { Platform } from 'react-native';
import apiClient from './apiClient';

export const getCatDetail = async (catId) => {
  const data = await apiClient.get('/app/cat/detail', {
    params: { catId },
  });

  return data;
};

export const getCatMarkers = async (catId) => {
  const data = await apiClient.get('/app/cat/markers', {
    params: { catId },
  });

  return data;
};

export const getCatSightings = async (catId, page) => {
  const data = await apiClient.get('/app/cat/sightings', {
    params: { catId, page },
  });

  return data;
};

export const registerNewCat = async (photoUri, contents) => {
  const body = new FormData();

  if (Platform.OS === 'web') {
    const photoResponse = await axios.get(photoUri, { responseType: 'blob' });
    body.append('file', photoResponse.data, 'cat-photo.jpg');
  } else {
    body.append('file', {
      uri: photoUri,
      name: 'cat-photo.jpg',
      type: 'image/jpeg',
    });
  }

  body.append('contents', JSON.stringify(contents));

  const data = await apiClient.post('/app/cat/register', body);

  return data;
};

export const registerCatSighting = async (photoUri, contents) => {
  const body = new FormData();

  if (Platform.OS === 'web') {
    const photoResponse = await axios.get(photoUri, { responseType: 'blob' });
    body.append('file', photoResponse.data, 'sighting-photo.jpg');
  } else {
    body.append('file', {
      uri: photoUri,
      name: 'sighting-photo.jpg',
      type: 'image/jpeg',
    });
  }

  body.append('contents', JSON.stringify(contents));

  const data = await apiClient.post('/app/cat/sighting', body);

  return data;
};
