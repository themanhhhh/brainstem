import { mockData, mockApiResponse, paginateData, filterData } from '../../data/mockData';

export const discountService = {
  getDiscounts: async (page = 0, size = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = paginateData(mockData.discounts, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  // Get discounts with filtering
  getAllDiscounts: async (name = '', status = null, page = 0, size = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredDiscounts = [...mockData.discounts];
    
    // Apply filters
    if (name) {
      filteredDiscounts = filteredDiscounts.filter(discount => 
        discount.name.toLowerCase().includes(name.toLowerCase()) ||
        discount.description.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (status) {
      filteredDiscounts = filteredDiscounts.filter(discount => discount.status === status);
    }
    
    const result = paginateData(filteredDiscounts, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getDiscountByPrice: async (price) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/requirement-totalPrice/${price}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', 
      },
      method: 'GET',
    });

    return response.json();
  },

  getDiscountById: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/view/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    return response.json(); 
  },

  addDiscount: async (discount) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(discount),
    });

    return response.json();
  },

  updateDiscount: async (id, discount) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/discount/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(discount),
    });

    return response.json(); 
  },

  deleteDiscount: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');       

    const response = await fetch(`${API_URL}/discount/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });

    return response.json();
  },
}; 