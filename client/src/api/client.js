import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const listProjects = async () => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProject = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};
