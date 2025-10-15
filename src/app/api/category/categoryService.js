import { mockData, mockApiResponse, paginateData, filterData } from '../../data/mockData';

// Mock service for categories
export const categoryService = {
  getCategories: async (page = 0, pageSize = 10, language = 'VI') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = paginateData(mockData.categories, page, pageSize);
    return mockApiResponse(result.data, result.metadata);
  },

  // Get categories with filter options
  getAllCategories: async (name = '', state = null, page = 0, pageSize = 10, language = 'VI') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredCategories = [...mockData.categories];
    
    // Apply filters
    if (name) {
      filteredCategories = filteredCategories.filter(category => 
        category.name.toLowerCase().includes(name.toLowerCase()) ||
        category.description.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (state) {
      filteredCategories = filteredCategories.filter(category => category.state === state);
    }
    
    const result = paginateData(filteredCategories, page, pageSize);
    return mockApiResponse(result.data, result.metadata);
  },

  getCategoryById: async (id, language = 'VI') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const category = mockData.categories.find(c => c.id === parseInt(id));
    if (!category) {
      return mockApiResponse(null, null);
    }
    
    return mockApiResponse(category);
  },

  addCategory: async (category) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCategory = {
      id: mockData.categories.length + 1,
      name: category.name,
      description: category.description,
      state: category.state || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.categories.push(newCategory);
    return mockApiResponse(newCategory);
  },

  updateCategory: async (id, category, language = 'VI') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const categoryIndex = mockData.categories.findIndex(c => c.id === parseInt(id));
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    mockData.categories[categoryIndex] = {
      ...mockData.categories[categoryIndex],
      name: category.name,
      description: category.description,
      state: category.state,
      updatedAt: new Date().toISOString()
    };
    
    return mockApiResponse(mockData.categories[categoryIndex]);
  },

  deleteCategory: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const categoryIndex = mockData.categories.findIndex(c => c.id === parseInt(id));
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    const deletedCategory = mockData.categories.splice(categoryIndex, 1)[0];
    return mockApiResponse(deletedCategory);
  },

  getActiveCategories: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const activeCategories = mockData.categories.filter(category => category.state === 'ACTIVE');
    return mockApiResponse(activeCategories);
  },
  
  getCategoryView: async (size = 100, language = 'VI') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const activeCategories = mockData.categories.filter(category => category.state === 'ACTIVE');
    const result = paginateData(activeCategories, 0, size);
    return mockApiResponse(result.data, result.metadata);
  },
};



