import { mockData, mockApiResponse } from '../../data/mockData';

// Mock service for statistics
export const statisticService = {
    getRevenue: async (startDate, endDate) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter revenue data by date range
        let filteredData = mockData.statistics.revenueData.filter(item => {
            const itemDate = new Date(item.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return itemDate >= start && itemDate <= end;
        });

        // Nếu không có dữ liệu trong khoảng thời gian, trả về tất cả dữ liệu
        if (filteredData.length === 0) {
            filteredData = mockData.statistics.revenueData;
        }

        console.log('Filtered revenue data:', filteredData); // Debug log

        return {
            code: 200,
            message: 'Success',
            data: {
                totalRevenue: mockData.statistics.totalRevenue,
                totalStudents: mockData.statistics.totalStudents,
                totalTeachers: mockData.statistics.totalTeachers,
                totalCourses: mockData.statistics.totalCourses,
                totalCampaigns: mockData.statistics.totalCampaigns,
                totalPotentialStudents: mockData.statistics.totalPotentialStudents,
                revenueData: filteredData,
                topCourses: mockData.statistics.topCourses,
                statisticTotal: {
                    monthlyActiveUser: mockData.statistics.totalStudents,
                    countOrderOffline: mockData.statistics.totalStudents,
                    totalRevenue: mockData.statistics.totalRevenue
                }
            }
        };
    },
    
    // Mock export function
    getRevenueExport: async (startDate, endDate) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock CSV data
        const csvData = `Date,Revenue,Orders
${mockData.statistics.revenueData.map(item => `${item.date},${item.revenue},${item.orders}`).join('\n')}`;
        
        const blob = new Blob([csvData], { type: 'text/csv' });
        const filename = `revenue_export_${startDate}_${endDate}.csv`;
        
        return {
            blob,
            filename,
            type: 'text/csv'
        };
    },

    // Helper function để trigger download
    downloadRevenueExport: async (startDate, endDate) => {
        try {
            const { blob, filename } = await statisticService.getRevenueExport(startDate, endDate);
            
            // Tạo URL cho blob
            const url = window.URL.createObjectURL(blob);
            
            // Tạo link download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Thêm vào DOM và click để download
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, filename };
        } catch (error) {
            console.error('Error downloading revenue export:', error);
            throw error;
        }
    }
};