const API_URL = 'https://dev.quyna.online/project_4/restaurant';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper functions for order ID cookie management
export const getOrderId = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; orderId=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const setOrderId = (orderId) => {
    document.cookie = `orderId=${orderId}; path=/; max-age=${60 * 60 * 24}`; // Lưu 24 giờ
};

export const clearOrderId = () => {
    document.cookie = 'orderId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Get all orders
export const getOrders = async (page = 0, size = 10, status = '') => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const query = new URLSearchParams({ page, size });
    if (status) query.append('status', status);

    try {
        const response = await fetch(`${API_URL}/customer/order?${query.toString()}`, {
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

// Get order by ID
export const getOrderById = async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/customer/order/${id}`, {
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

// Create a new order - nhận mảng foodInfo với foodId và quantity
export const createOrder = async (foodInfo) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/customer/order`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foodInfo }),
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

// Update order information
export const updateOrderInfo = async (id, orderData) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/customer/order/${id}`, {
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

// Update order state
export const updateOrderState = async (id, orderData) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/customer/order/${id}`, {
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

// Payment service for VNPay
// NOTE: VNPay return URL should be configured to point to FRONTEND:
// Example: http://localhost:3000/payment/vnpay-return (for development)
// Example: https://yourdomain.com/payment/vnpay-return (for production)
// NOT to backend API - frontend will catch params and send via postMessage
export const createPayment = async (orderId) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/payment/vnpay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
        });
        if (!response.ok) {
            throw new Error('Failed to create payment');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

// Helper function to map order states to payment statuses
const mapOrderStateToPaymentStatus = (orderState) => {
    const stateMap = {
        'PAID': 'PAID',
        'COMPLETED': 'SUCCESS',
        'PENDING': 'PENDING',
        'FAILED': 'FAILED',
        'CANCELLED': 'CANCELLED'
    };
    return stateMap[orderState] || 'PENDING';
};

// Check payment status by checking order status
// VNPay callbacks to backend API which updates order status
export const checkPaymentStatus = async (orderId) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        // Get order data to check payment status
        // VNPay callback updates the order status in backend
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orderData = await response.json();
        console.log('Order data for payment status check:', orderData);
        
        // Map order state to payment status
        if (orderData.orderState) {
            return {
                status: mapOrderStateToPaymentStatus(orderData.orderState),
                orderData: orderData
            };
        }
        
        // Fallback - assume pending if no order state
        return { status: 'PENDING', orderData: orderData };
    } catch (error) {
        console.error('Error checking payment status:', error);
        // Return a default pending status instead of throwing error
        return { status: 'PENDING', error: error.message };
    }
};

