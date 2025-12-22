const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_PATH = process.env.REACT_APP_API_BASE_PATH || '/api';

export const authService = {
  async login(credentials) {
    // Use proxy in development and production to avoid CORS and mixed content issues
    // In production (Vercel), use /api path which will be proxied to the backend
    const url = process.env.NODE_ENV === 'development' 
      ? `${API_BASE_PATH}/auth/login`  // Use proxy to avoid CORS
      : API_BASE_URL 
        ? `${API_BASE_URL}/auth/login`  // If API_BASE_URL is set, use it
        : `${API_BASE_PATH}/auth/login`; // Otherwise use /api path (proxied by Vercel)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = 'Unable to login. Please check your credentials and try again.';
      try {
        const errorData = await response.json();
        errorMessage =
          errorData?.message ||
          errorData?.errors?.[0]?.message ||
          errorData?.errors ||
          errorMessage;
      } catch (error) {
        // Ignore JSON parse error and use default message
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    let data = null;

    if (response.status !== 204) {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { raw: text } : null;
      }
    }

    // Standard API response expected: { status, message, data: { token, user } }
    if (data?.status && data.status !== 'success') {
      throw new Error(data?.message || 'Unable to login. Please try again.');
    }

    const payload = data?.data ?? data ?? {};

    const token =
      payload?.token ??
      payload?.accessToken ??
      payload?.access_token ??
      payload?.data?.token ??
      payload?.data?.accessToken ??
      response.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      response.headers.get('x-auth-token') ??
      null;

    const refreshToken =
      payload?.refreshToken ??
      payload?.refresh_token ??
      payload?.data?.refreshToken ??
      payload?.data?.refresh_token ??
      null;

    const user =
      payload?.user ??
      payload?.account ??
      payload?.data?.user ??
      null;

    return {
      token: token ?? 'SESSION',
      refreshToken,
      user,
      message: data?.message || 'Login successful.',
      raw: data,
    };
  },
};
