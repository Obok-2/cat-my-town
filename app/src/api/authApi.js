import axios from 'axios';
import apiClient, { API_URL } from './apiClient';

export const loginWithGoogle = async (idToken) => {
  const bodyObj = { idToken };
  const data = await axios.post(`${API_URL}/app/auth/google`, bodyObj);
  return data;
};

export const getMyProfile = async () => {
  const data = await apiClient.get('/app/auth/me');
  return data;
};
