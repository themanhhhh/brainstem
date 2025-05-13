const API_URL = 'http://dev.quyna.online/project_4/restaurant';

const getToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const foodService = {
    getFoods: async (page = 0, size = 10) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/food?page=${page}&pageSize=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    // Lấy thông tin một món ăn theo ID
    getFoodById: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/food/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    // Thêm món ăn mới
    addFood: async (name, description, price, imgUrl, categoryId, foodState, quantity)  => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/food`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description,
                price,
                imgUrl,
                categoryId,
                foodState,
                quantity
            }),
        });
        return response.json();
    },

    // Cập nhật thông tin món ăn
    updateFood: async (id, name, description, price, imgUrl, categoryId, foodState, quantity) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/food/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description,
                price,
                imgUrl,
                categoryId,
                foodState,
                quantity
            }),
        });
        return response.json();
    },

    // Xóa món ăn
    deleteFood: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/food/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    // Lấy danh sách danh mục món ăn
    getCategories: async () => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/category`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    // Thêm danh mục mới
    addCategory: async (name, description) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/category`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description
            }),
        });
        return response.json();
    },

    // Cập nhật danh mục
    updateCategory: async (id, name, description) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/category/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description
            }),
        });
        return response.json();
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};