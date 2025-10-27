import { API_BASE_URL } from '../utils/constants';

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};