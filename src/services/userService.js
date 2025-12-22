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

export const userService = {
  async getUsers(params = {}) {
    const { page = 1, limit = 10, search = '', role = '' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
    });

    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users?${queryParams}`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users?${queryParams}`
        : `${API_BASE_PATH}/users?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch users';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getUsersByAddress(addressId, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      addressId: addressId.toString(),
    });

    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users?${queryParams}`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users?${queryParams}`
        : `${API_BASE_PATH}/users?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch users';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async deleteUser(userId) {
    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users/${userId}`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users/${userId}`
        : `${API_BASE_PATH}/users/${userId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to delete user';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content or JSON response
    if (response.status === 204) {
      return { success: true };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true };
    }
  },

  async changePassword(payload) {
    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users/change-password`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users/change-password`
        : `${API_BASE_PATH}/users/change-password`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to change password';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async updateUser(userId, userData) {
    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users/${userId}`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users/${userId}`
        : `${API_BASE_PATH}/users/${userId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async verifyUser(userId) {
    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users/${userId}`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users/${userId}`
        : `${API_BASE_PATH}/users/${userId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ isVerified: true }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to verify user';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async createUser(userData) {
    const url = process.env.NODE_ENV === 'development'
      ? `${API_BASE_PATH}/users`
      : API_BASE_URL 
        ? `${API_BASE_URL}/users`
        : `${API_BASE_PATH}/users`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to create user';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

