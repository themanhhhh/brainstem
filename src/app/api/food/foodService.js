import { mockData, mockApiResponse, paginateData, filterData } from '../../data/mockData';

// Mock service for foods
export const foodService = {
    getFoods: async (page = 0, size = 10, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const result = paginateData(mockData.foods, page, size);
        return mockApiResponse(result.data, result.metadata);
    },
    
    getMainDishes: async (page = 0, size = 100, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mainDishes = mockData.foods.filter(food => food.categoryId === 1); // Món chính
        const result = paginateData(mainDishes, page, size);
        return mockApiResponse(result.data, result.metadata);
    },

    // Get foods with filtering
    getAllFoods: async (name = '', categoryId = null, state = null, page = 0, pageSize = 10, signal = null, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filteredFoods = [...mockData.foods];
        
        // Apply filters
        if (name) {
            filteredFoods = filteredFoods.filter(food => 
                food.name.toLowerCase().includes(name.toLowerCase()) ||
                food.description.toLowerCase().includes(name.toLowerCase())
            );
        }
        
        if (categoryId) {
            filteredFoods = filteredFoods.filter(food => food.categoryId === parseInt(categoryId));
        }
        
        if (state) {
            filteredFoods = filteredFoods.filter(food => food.state === state);
        }
        
        const result = paginateData(filteredFoods, page, pageSize);
        return mockApiResponse(result.data, result.metadata);
    },

    // Lấy thông tin một món ăn theo ID
    getFoodById: async (id, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const food = mockData.foods.find(f => f.id === parseInt(id));
        if (!food) {
            return mockApiResponse(null, null);
        }
        
        return mockApiResponse(food);
    },

    // Thêm món ăn mới
    addFood: async (name, description, price, imgUrl, categoryId, state, quantity) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const category = mockData.categories.find(c => c.id === parseInt(categoryId));
        const newFood = {
            id: mockData.foods.length + 1,
            name,
            description,
            price: parseInt(price),
            imgUrl,
            categoryId: parseInt(categoryId),
            categoryName: category ? category.name : 'Unknown',
            state,
            quantity: parseInt(quantity),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        mockData.foods.push(newFood);
        return mockApiResponse(newFood);
    },

    // Cập nhật thông tin món ăn
    updateFood: async (id, name, description, price, imgUrl, categoryId, state, quantity, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foodIndex = mockData.foods.findIndex(f => f.id === parseInt(id));
        if (foodIndex === -1) {
            throw new Error('Food not found');
        }
        
        const category = mockData.categories.find(c => c.id === parseInt(categoryId));
        mockData.foods[foodIndex] = {
            ...mockData.foods[foodIndex],
            name,
            description,
            price: parseInt(price),
            imgUrl,
            categoryId: parseInt(categoryId),
            categoryName: category ? category.name : 'Unknown',
            state,
            quantity: parseInt(quantity),
            updatedAt: new Date().toISOString()
        };
        
        return mockApiResponse(mockData.foods[foodIndex]);
    },

    // Xóa món ăn
    deleteFood: async (id) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foodIndex = mockData.foods.findIndex(f => f.id === parseInt(id));
        if (foodIndex === -1) {
            throw new Error('Food not found');
        }
        
        const deletedFood = mockData.foods.splice(foodIndex, 1)[0];
        return mockApiResponse(deletedFood);
    },

    getFoodView: async (size = 100, language = 'VI') => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const availableFoods = mockData.foods.filter(food => food.state === 'AVAILABLE');
        const result = paginateData(availableFoods, 0, size);
        return mockApiResponse(result.data, result.metadata);
    },

    getFoodByIdView: async (id) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const food = mockData.foods.find(f => f.id === parseInt(id));
        if (!food) {
            return mockApiResponse(null, null);
        }
        
        return mockApiResponse(food);
    }
};