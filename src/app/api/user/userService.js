import { mockData, mockApiResponse, paginateData, filterData } from '../../data/mockData';

// Mock service for users
export const userService = {
    addUser: async (fullName, username, password, phoneNumber, email, role, state) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create new user with new structure
        const newUser = {
            MaHV: mockData.users.length + 1,
            HoTen: fullName,
            NgaySinh: '1990-01-01',
            GioiTinh: 'Nam',
            Email: email,
            SDT: phoneNumber,
            NgayDangKy: new Date().toISOString(),
            TrangThai: state,
            MaCD: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        mockData.users.push(newUser);
        
        return mockApiResponse(newUser);
    },

    getUser: async (page = 0, size = 10) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const result = paginateData(mockData.users, page, size);
        return mockApiResponse(result.data, result.metadata);
    },

    // Get all user accounts with filter
    getAllUsers: async (search = '', state = null, page = 0, size = 20) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filteredUsers = [...mockData.users];
        
        // Apply filters
        if (search) {
            filteredUsers = filteredUsers.filter(user => 
                user.HoTen.toLowerCase().includes(search.toLowerCase()) ||
                user.Email.toLowerCase().includes(search.toLowerCase()) ||
                user.SDT.includes(search)
            );
        }
        
        if (state) {
            filteredUsers = filteredUsers.filter(user => user.TrangThai === state);
        }
        
        const result = paginateData(filteredUsers, page, size);
        return mockApiResponse(result.data, result.metadata);
    },

    getUserById: async (id) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const user = mockData.users.find(u => u.MaHV === parseInt(id));
        if (!user) {
            return mockApiResponse(null, null);
        }
        
        return mockApiResponse(user);
    },

    updateUser: async (id, fullName, username, password, phoneNumber, email, role, state) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userIndex = mockData.users.findIndex(u => u.MaHV === parseInt(id));
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        // Update user
        mockData.users[userIndex] = {
            ...mockData.users[userIndex],
            HoTen: fullName,
            Email: email,
            SDT: phoneNumber,
            TrangThai: state,
            updatedAt: new Date().toISOString()
        };
        
        return mockApiResponse(mockData.users[userIndex]);
    },

    deleteUser: async (id) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userIndex = mockData.users.findIndex(u => u.MaHV === parseInt(id));
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        const deletedUser = mockData.users.splice(userIndex, 1)[0];
        return mockApiResponse(deletedUser);
    }
};  