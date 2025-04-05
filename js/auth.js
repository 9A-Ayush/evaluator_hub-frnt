// Import config
const { API_ENDPOINTS, getAuthHeader } = window;

// Public pages that don't require authentication
const PUBLIC_PAGES = ['login.html', 'signup.html', 'forgotPassword.html'];

// Login function
window.login = async function(email, password) {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    try {
        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Validate the response data
        if (!data.success || !data.token || !data.user) {
            throw new Error('Invalid response from server');
        }

        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data.user._id,
            name: data.user.name || email.split('@')[0],
            email: data.user.email,
            role: data.user.role || 'evaluator',
            status: data.user.status
        }));

        // If remember me is checked, save the email
        if (localStorage.getItem('rememberMe') === 'true') {
            localStorage.setItem('savedEmail', email);
        }

        // Update user context if available
        if (window.userContext && typeof window.userContext.updateUI === 'function') {
            window.userContext.updateUI();
        }

        // Set allowNavigation flag to true to allow navigation without authentication check
        sessionStorage.setItem('allowNavigation', 'true');

        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Register function
window.register = async function(userData) {
    try {
        console.log('Register function called with:', userData);
        
        // Prepare data to send to the server
        const dataToSend = {
            ...userData,
            name: userData.name || `${userData.firstName} ${userData.lastName}`
        };
        
        // Remove firstName and lastName as they're not needed by the backend
        delete dataToSend.firstName;
        delete dataToSend.lastName;
        
        console.log('Sending registration data:', dataToSend);
        console.log('Registration endpoint:', API_ENDPOINTS.register);
        
        const response = await fetch(API_ENDPOINTS.register, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        }).catch(error => {
            console.error('Network error:', error);
            throw new Error('Cannot connect to server. Please check your internet connection and try again.');
        });

        console.log('Registration response status:', response.status);
        
        let data;
        try {
            data = await response.json();
            console.log('Registration response data:', data);
        } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
        }));

        // Set allowNavigation flag to true to allow navigation after registration
        sessionStorage.setItem('allowNavigation', 'true');

        // Redirect to index page
        window.location.href = 'index.html';
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Check authentication
window.checkAuth = function() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        return false;
    }

    try {
        // Verify token is valid JWT format
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const expiry = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expiry) {
            window.userContext.logout();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        window.userContext.logout();
        return false;
    }
};

// Initialize authentication and update UI
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Check if this is an allowed navigation
    const allowNavigation = sessionStorage.getItem('allowNavigation') === 'true';
    
    // If navigation is allowed (after login or registration), don't block, but remove the flag after using it
    if (allowNavigation) {
        sessionStorage.removeItem('allowNavigation');
        return;
    }

    // If it's a public page (login, signup, etc.), don't require authentication
    if (PUBLIC_PAGES.includes(currentPage.toLowerCase())) {
        return;
    }

    // If not on a public page, check authentication status
    if (!window.checkAuth()) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
    }
});
