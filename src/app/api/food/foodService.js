const API_URL = 'https://dev.quyna.online/project_4/restaurant';

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

        const response = await fetch(`${API_URL}/food/view?page=${page}&pageSize=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });
        return response.json();
    },

    // Get foods with filtering
    getAllFoods: async (name = '', categoryId = null, state = null, page = 0, pageSize = 10, signal = null) => {
        const token = getToken();
        if (!token) throw new Error('No authentication token found');
        
        let url = `${API_URL}/food?page=${page}&pageSize=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (state) url += `&state=${state}`;
        
        const options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'GET',
        };
        
        // Add signal to request if provided
        if (signal) {
            options.signal = signal;
        }
        
        const response = await fetch(url, options);
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
    updateFood: async (id, name, description, price, imgUrl, categoryId, state, quantity) => {
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
                state,
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

    getFoodView: async () => {
        const response = await fetch(`${API_URL}/food/view?size=100&state=AVAILABLE`, {
            method: 'GET',
        }); 
        return response.json();
    },

    getFoodByIdView: async (id) => {
        const response = await fetch(`${API_URL}/food/view/${id}`, {
            method: 'GET',
        });
        return response.json(); 
    }
};