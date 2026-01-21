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

export const addressService = {
  async getAddresses(params = {}) {
    const { page = 1, limit = 10, search = '' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      queryParams.append('search', search);
    }

    const url = `${API_BASE_PATH}/address?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch addresses';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async createAddress(addressData) {
    const url = `${API_BASE_PATH}/address`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to create address';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.errors?.[0]?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Address created successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Address created successfully' };
    }
  },

  async updateAddress(id, addressData) {
    const url = `${API_BASE_PATH}/address/${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to update address';
      try {
        const errorData = await response.json();        
        if (errorData?.message) {
          if (typeof errorData.message === 'object') {
            const messageKeys = Object.keys(errorData.message);
            if (messageKeys.length > 0) {
              const firstError = errorData.message[messageKeys[0]];
              errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
              errorMessage = JSON.stringify(errorData.message);
            }
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message || JSON.stringify(errorData.errors[0]);
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Address updated successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Address updated successfully' };
    }
  },

  async getAddressById(id) {
    const url = `${API_BASE_PATH}/address/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch address';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async deleteAddress(id) {
    const url = `${API_BASE_PATH}/address/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to delete address';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Address deleted successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Address deleted successfully' };
    }
  },
};

