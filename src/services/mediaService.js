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

const getHeadersForUpload = () => {
  const token = getAuthToken();
  return {
    // Don't set Content-Type for FormData - browser will set it with boundary
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

  async uploadVideo(formData, onProgress) {
    const url = `${API_BASE_PATH}/medias/upload-video`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Handle progress if callback provided
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(e);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText ? JSON.parse(xhr.responseText) : { success: true };
            resolve(response);
          } catch (error) {
            // If response is empty but status is success (201), return success
            if (xhr.status === 201) {
              resolve({ success: true });
            } else {
              resolve({ success: true });
            }
          }
        } else {
          let errorMessage = 'Failed to upload video';
          try {
            const errorData = JSON.parse(xhr.responseText);
            
            // Handle nested error messages (e.g., { message: { video: "..." } })
            if (errorData?.message) {
              if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
              } else if (typeof errorData.message === 'object') {
                // Extract first error message from object
                const errorKeys = Object.keys(errorData.message);
                if (errorKeys.length > 0) {
                  errorMessage = errorData.message[errorKeys[0]];
                } else {
                  errorMessage = JSON.stringify(errorData.message);
                }
              }
            } else if (errorData?.error) {
              errorMessage = typeof errorData.error === 'string' 
                ? errorData.error 
                : JSON.stringify(errorData.error);
            }
          } catch (error) {
            if (xhr.status === 401) {
              errorMessage = 'Unauthorized. Please login again.';
            } else if (xhr.status === 400) {
              errorMessage = 'Invalid request. Please check your file and try again.';
            } else if (xhr.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
          }
          reject(new Error(errorMessage));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      // Open and send request
      xhr.open('POST', url);
      
      // Set authorization header
      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },

  async deleteVideo(videoUrl) {
    const url = `${API_BASE_PATH}/medias/upload?file=${encodeURIComponent(videoUrl)}`;
    


    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    let responseData = null;
    try {
      const responseText = await response.text();
      if (responseText) {
        responseData = JSON.parse(responseText);
      }
    } catch (error) {
      console.error('Failed to parse delete response:', error);
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      let errorMessage = 'Failed to delete video';
      if (responseData) {
        if (responseData?.message) {
          errorMessage = typeof responseData.message === 'string' 
            ? responseData.message 
            : JSON.stringify(responseData.message);
        } else if (responseData?.error) {
          errorMessage = typeof responseData.error === 'string' 
            ? responseData.error 
            : JSON.stringify(responseData.error);
        }
      } else {
        if (response.status === 404) {
          errorMessage = 'Video not found';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      throw new Error(errorMessage);
    }

    // Check if response indicates success
    if (responseData && responseData.success === false) {
      throw new Error(responseData.message || 'Failed to delete video');
    }

    return responseData || { success: true };
  },
};
