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

export const announcementService = {
  async getAnnouncements(params = {}) {
    const { page = 1, limit = 10, isActive, entityId, entityType, search = '' } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (isActive !== undefined && isActive !== null && isActive !== '') {
      queryParams.append('isActive', String(isActive));
    }
    if (entityId !== undefined && entityId !== null && entityId !== '') {
      queryParams.append('entityId', String(entityId));
    }
    if (entityType) {
      queryParams.append('entityType', entityType);
    }
    if (search) {
      queryParams.append('search', search);
    }

    const url = `${API_BASE_PATH}/announcement?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch announcements';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async createAnnouncement(data) {
    const url = `${API_BASE_PATH}/announcement`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to create announcement';
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = typeof errorData.message === 'string'
            ? errorData.message
            : JSON.stringify(errorData.message);
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 201) {
      try {
        return await response.json();
      } catch (error) {
        return { success: true, message: 'Announcement created successfully' };
      }
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Announcement created successfully' };
    }
  },
};
