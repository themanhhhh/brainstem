import { mockData, mockApiResponse, paginateData, filterData } from '../../data/mockData';

const ordertableService = {
  getOrderTables: async (page = 0, size = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = paginateData(mockData.tables, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  // Get all tables with filtering
  getAllTables: async (name = '', state = null, page = 0, size = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredTables = [...mockData.tables];
    
    // Apply filters
    if (name) {
      filteredTables = filteredTables.filter(table => 
        table.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (state) {
      filteredTables = filteredTables.filter(table => table.state === state);
    }
    
    const result = paginateData(filteredTables, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getOrderTableById: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const table = mockData.tables.find(t => t.id === parseInt(id));
    if (!table) {
      return mockApiResponse(null, null);
    }
    
    return mockApiResponse(table);
  },
  
  getOrderTableByUser: async (userId, page = 0, size = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userReservations = mockData.tableReservations.filter(reservation => 
      reservation.email === userId || reservation.fullName.toLowerCase().includes(userId.toLowerCase())
    );
    
    const result = paginateData(userReservations, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getActiveTable: async (page = 0, size = 100) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const activeTables = mockData.tables.filter(table => table.state === 'AVAILABLE');
    const result = paginateData(activeTables, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  createOrderTable: async (name, state, numberOfChair , page =0 , size = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ name, state, numberOfChair }),
    });
    return response.json();
  },

  updateOrderTable: async (id, name, state, numberOfChair) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {    
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({ name, state, numberOfChair }),
    });
    return response.json();
  },

  deleteOrderTable: async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}` ,{
      headers: {    
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    return response.json();
  },

  updateOrderTableState: async (id, state) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/table/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({ state }),
    });
    return response.json();
  },

  createOrder: async (email , fullName , description , phoneNumber , periodType , tableId , orderTime , orderTableState ) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/order-table`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ email , fullName , description , phoneNumber , periodType , tableId , orderTime , orderTableState }),
    });
    return response.json();
  }
}

export default ordertableService;
  

