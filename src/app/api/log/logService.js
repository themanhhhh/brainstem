const API_URL = 'http://dev.quyna.online/project_4/restaurant';

const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

export const getLogs = async (page = 0, size = 10) => {

    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    try {
        const response = await fetch(`${API_URL}/action-log?page=${page}&size=${size}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
        throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
    }
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getActionTypeColor = (actionType) => {
  switch (actionType) {
    case 'CREATE':
      return 'var(--success)';
    case 'UPDATE':
      return 'var(--warning)';
    case 'DELETE':
      return 'var(--danger)';
    default:
      return 'var(--text)';
  }
};