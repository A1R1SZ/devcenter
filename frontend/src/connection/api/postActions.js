import axios from 'axios';

const BASE_URL = 'https://devcenter-kofh.onrender.com';

export const likePost = async (postId, token) => {
  return axios.post(`${BASE_URL}/post/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const bookmarkPost = async (postId, token) => {
  return axios.post(`${BASE_URL}/post/${postId}/bookmark`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const commentPost = async (postId, comment, token) => {
  return axios.post(`${BASE_URL}/post/${postId}/comment`, { comment }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getPostComments = async (postId, token) => {
  return axios.get(`${BASE_URL}/post/${postId}/comments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deletePost = async (postId, token) => {
  const response = await axios.delete(`${BASE_URL}/post/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};