const API_URL = 'http://dev.quyna.online/project_4/restaurant';

// Helper function để lấy accessToken từ cookie
const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const userService = {
    addUser: async (fullName, username, password, phoneNumber, email, role, state) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({fullName, username, password, phoneNumber, email, role, state}),
        });
        return response.json();
    },

    getUser: async (page = 0, size = 10) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/account?page=${page}&size=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    // Get all user accounts with filter
    getAllUsers: async (search = '', state = null, page = 0, size = 20) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        let url = `${API_URL}/account?page=${page}&size=${size}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
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

    getUserById: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/account/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    updateUser: async (id, fullName, username, password, phoneNumber, email, role , state) => {
        const token = getToken();   
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/account/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({fullName, username, password, phoneNumber, email, role, state}),
        });
        return response.json();
    },

    deleteUser: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/account/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};  