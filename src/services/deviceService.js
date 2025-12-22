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

export const deviceService = {
  async getDevices(params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/device?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch devices';
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

  async getDeviceById(deviceId) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/device/${deviceId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to fetch device';
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

  async restartDevice(localId) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/restart`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ localId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to restart device';
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
      return { success: true, message: 'Device restarted successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Device restarted successfully' };
    }
  },

  async unlockDevice(localId) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/middleware/unlock`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ localId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to unlock device';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Handle 201 Created or JSON response
    if (response.status === 201) {
      return { success: true, message: 'Door unlocked successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Door unlocked successfully' };
    }
  },

  async createDevice(deviceData) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/device`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to create device';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.errors?.[0]?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content or JSON response
    if (response.status === 204) {
      return { success: true, message: 'Device created successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Device created successfully' };
    }
  },

  async updateDevice(deviceId, deviceData) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/device/${deviceId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to update device';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.errors?.[0]?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content or JSON response
    if (response.status === 204) {
      return { success: true, message: 'Device updated successfully' };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, message: 'Device updated successfully' };
    }
  },

  async deleteDevice(deviceId) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/device/${deviceId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to delete device';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Return the deviceId for the slice to use
    return deviceId;
  },

  async setManagerCard(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/set_manager_card`;

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
      let errorMessage = 'Failed to set manager card';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Manager card set successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Manager card set successfully' };
    }
  },

  async setLiveCard(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/set_live_card`;

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
      let errorMessage = 'Failed to set live card';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Live card set successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Live card set successfully' };
    }
  },

  async setICCard(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/set_IC_card`;

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
      let errorMessage = 'Failed to set IC card';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'IC card set successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'IC card set successfully' };
    }
  },

  async setIDCard(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/set_ID_card`;

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
      let errorMessage = 'Failed to set ID card';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'ID card set successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'ID card set successfully' };
    }
  },

  async upgradeSoftware(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/upgrade_software`;

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
      let errorMessage = 'Failed to upgrade software';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Software upgrade initiated successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Software upgrade initiated successfully' };
    }
  },

  async upgradeConfig(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/upgrade_config`;

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
      let errorMessage = 'Failed to upgrade config';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Config upgrade initiated successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Config upgrade initiated successfully' };
    }
  },

  async setServerInfo(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/set_server_info`;

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
      let errorMessage = 'Failed to set server info';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'Server info set successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'Server info set successfully' };
    }
  },

  async reloadSip(data) {
    // Always use /api path (proxied by Vercel in production, setupProxy in development)
    const url = `${API_BASE_PATH}/admin/middleware/reload_sip`;

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
      let errorMessage = 'Failed to reload SIP';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (error) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return { success: true, message: 'SIP reloaded successfully' };
    }

    try {
      return await response.json();
    } catch (error) {
      return { success: true, message: 'SIP reloaded successfully' };
    }
  },
};

