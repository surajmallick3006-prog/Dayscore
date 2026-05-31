import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ServerAuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Register user (sends OTP)
  async register(name, email, password) {
    try {
      const response = await this.api.post('/auth/register', {
        name,
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await this.api.post('/auth/verify-otp', {
        email,
        otp,
      });

      // Store tokens and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set authorization header for future requests
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed',
      };
    }
  }

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await this.api.post('/auth/resend-otp', {
        email,
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP',
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });

      // Store tokens and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Set authorization header for future requests
      this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'No token found' };

      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await this.api.get('/auth/me');

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete this.api.defaults.headers.common['Authorization'];

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }
}

const serverAuthService = new ServerAuthService();
export default serverAuthService;