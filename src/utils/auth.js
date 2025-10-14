const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const api = {
  baseURL: import.meta.env.VITE_FACETS_SERVICE_BASE_URL || 'http://localhost:8080',

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    tokenStorage.setTokens(data.access, data.refresh);
    return data;
  },

  async refreshToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    tokenStorage.setTokens(data.access, tokenStorage.getRefreshToken());
    return data;
  },

  async verifyToken() {
    const token = tokenStorage.getToken();
    if (!token) {
      throw new Error('No token available');
    }

    const response = await fetch(`${this.baseURL}/api/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  },

  async makeAuthenticatedRequest(url, options = {}) {
    let token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        try {
          await this.refreshToken();
          token = tokenStorage.getToken();
          
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (refreshError) {
          tokenStorage.clearTokens();
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  async getSessions() {
    const response = await this.makeAuthenticatedRequest(`${this.baseURL}/sessions/list/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  },

  async resumeSession(sessionId) {
    const response = await this.makeAuthenticatedRequest(`${this.baseURL}/sessions/resume/`, {
      method: 'POST',
      body: JSON.stringify({ id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to resume session');
    }

    return response.json();
  },

  async stopSession(sessionId) {
    const response = await this.makeAuthenticatedRequest(`${this.baseURL}/sessions/stop/`, {
      method: 'POST',
      body: JSON.stringify({ id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to stop session');
    }

    return response.json();
  },

  async startSession(name, description) {
    const response = await this.makeAuthenticatedRequest(`${this.baseURL}/sessions/start/`, {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to start session');
    }

    return response.json();
  }
};