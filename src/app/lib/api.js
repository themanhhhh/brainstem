const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  signin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  signout: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  },

  // Thêm các methods khác...
};

export const userApi = {
  getAll: async (token) => {
    const response = await fetch(`${API_BASE_URL}/account`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  create: async (userData, token) => {
    const response = await fetch(`${API_BASE_URL}/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Thêm các methods khác...
};