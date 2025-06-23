const API_URL = 'https://dev.quyna.online/project_4/restaurant';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const getOrders = async (page = 0, size = 10, status = '') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const query = new URLSearchParams({ page, size });
    if (status) query.append('status', status);

    try {
        const response = await fetch(`${API_URL}/orders?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

const getOrderById = async (id) => {
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
        return await response.json();
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

const createOrder = async (orderData) => {
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
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

const updateOrderState = async (id, orderData) => {
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
        return await response.json();
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

export const orderService = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderState,
};
