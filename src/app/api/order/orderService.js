const API_URL = 'https://dev.quyna.online/project_4/restaurant';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Get all orders
export const getOrders = async (page = 0, size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/orders?page=${page}&size=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Get order by ID
export const getOrderById = async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

// Create a new order
export const createOrder = async (orderData) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Update an order
export const updateOrderState = async (id, orderData) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error('Failed to update order');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

