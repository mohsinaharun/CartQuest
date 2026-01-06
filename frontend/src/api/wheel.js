import api from './axios';

export const getDiscounts = async () => {
  const res = await api.get('/wheel');
  return res.data;
};

export const spinWheel = async () => {
  const res = await api.post('/wheel/spin');
  return res.data;
};