const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_PATH = process.env.REACT_APP_API_BASE_PATH || '/api';

const getAuthToken = () => {
  return localStorage.getItem('iss_admin_token');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const mediaService = {
  async getMedias(params = {}) {
    const { page = 1, limit = 10, mediaType = '', entityType = '' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (mediaType) {
      queryParams.append('mediaType', mediaType);
    }
    
    if (entityType) {
      queryParams.append('entityType', entityType);
    }

    const url = `${API_BASE_PATH}/medias?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch medias';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};
