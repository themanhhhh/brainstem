const API_URL = 'https://dev.quyna.online/project_4/restaurant';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const categoryService = {
  getCategories: async (page = 0, pageSize = 8) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category?page=${page}&pageSize=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  // Get categories with filter options
  getAllCategories: async (name = '', state = null, page = 0, pageSize = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    let url = `${API_URL}/category?page=${page}&pageSize=${pageSize}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (state) url += `&state=${state}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },

  getCategoryById: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json(); 
  },

  addCategory: async (category) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(category),
    });

    return response.json();
  },

  updateCategory: async (id, category) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(category),
    });

    return response.json(); 
  },

  deleteCategory: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');       

    const response = await fetch(`${API_URL}/category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });

    return response.json();
  },

  getActiveCategories: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/category/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json();
  },
  getCategoryView: async () => {
    const response = await fetch(`${API_URL}/category/view?state=ACTIVE`, {
      
    });
    return response.json();
  },
};



