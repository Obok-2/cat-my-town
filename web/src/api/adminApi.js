import axios from 'axios';

// 서버 주소는 web/.env 의 VITE_API_URL (배포는 /api — 관리자 도메인 nginx가 백엔드로 넘긴다). 없으면 로컬 서버.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const loginAdmin = async (email, password) => {
  const bodyObj = { email, password };
  const data = await axios.post(`${API_URL}/admin/auth/login`, bodyObj);
  return data;
};

export const getDashboard = async (accessToken) => {
  const data = await axios.get(`${API_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};
