const API_URL = 'https://dev.quyna.online/project_4/restaurant';

export const authService = {
  // Đăng nhập
  login: async (username, password, rememberMe) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Đăng ký
  register: async (fullName, username, password, phoneNumber, email ) => {
    try {
      const response = await fetch(`${API_URL}/regis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, username, password, phoneNumber, email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const token = getCookie('refreshToken');
      const response = await fetch(`${API_URL}/auth/signout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: token })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Làm mới token
  refreshToken: async (refreshToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/refreshtoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile fetch failed');
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  updateProfile: async (fullName, phoneNumber, email, address) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phoneNumber, email, address })
      });

      const data = await response.json();

      if (!response.ok) { 
        throw new Error(data.message || 'Profile update failed');
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
};

// Helper function để lấy cookie
const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}; 