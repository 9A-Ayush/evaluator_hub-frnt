// Make API base URL globally available
window.API_BASE_URL = 'http://localhost:5003/api';

// API endpoints
window.API_ENDPOINTS = {
    login: `${API_BASE_URL}/users/login`,
    register: `${API_BASE_URL}/users/register`,
    profile: `${API_BASE_URL}/users/profile`,
    evaluations: `${API_BASE_URL}/evaluations`,
    USERS_EVALUATORS: `${API_BASE_URL}/users/evaluators`,
    forgotPassword: `${API_BASE_URL}/users/forgot-password`,
    resetPassword: `${API_BASE_URL}/users/reset-password`,
    assets: `${API_BASE_URL}/assets`,
    reports: `${API_BASE_URL}/reports`
};

// Helper function to get auth header
window.getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};
