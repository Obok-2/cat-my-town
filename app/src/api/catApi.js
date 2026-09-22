import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const getCatDetail = async (catId) => {
  const data = await axios.get(`${API_URL}/app/cat/detail`, {
    params: { catId },
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};

export const getCatMarkers = async (catId) => {
  const data = await axios.get(`${API_URL}/app/cat/markers`, {
    params: { catId },
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};

export const getCatSightings = async (catId, page) => {
  const data = await axios.get(`${API_URL}/app/cat/sightings`, {
    params: { catId, page },
    headers: {
      'X-User-Id': '1',
    },
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

  const data = await axios.post(`${API_URL}/app/cat/register`, body, {
    headers: {
      'X-User-Id': '1',
    },
  });

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

  const data = await axios.post(`${API_URL}/app/cat/sighting`, body, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return data;
};
