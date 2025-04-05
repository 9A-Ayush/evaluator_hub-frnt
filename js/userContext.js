// User context management
window.userContext = {
    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user);
    },

    // Get auth header for API requests
    getAuthHeader() {
        const token = localStorage.getItem('token');
        if (!token) return {};
        return {
            'Authorization': `Bearer ${token}`
        };
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Handle unauthorized access (401 errors)
    handleUnauthorized() {
        console.log('Unauthorized access, logging out...');
        this.logout();
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Update UI with user info
    updateUI() {
        const user = this.getCurrentUser();
        if (user) {
            // Update user name in all navbar instances
            document.querySelectorAll('#currentUserName').forEach(el => {
                if (el) {
                    el.textContent = user.name || user.email;
                }
            });

            // Update logout buttons
            document.querySelectorAll('#logoutBtn').forEach(btn => {
                if (btn) {
                    btn.onclick = () => this.logout();
                }
            });
        }
    },

    // Initialize user context
    init() {
        // Check if we're on the login page
        const isLoginPage = window.location.pathname.includes('login.html');
        
        // If we're not on the login page and not authenticated, redirect to login
        if (!isLoginPage && !this.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // If we're on the login page and already authenticated, redirect to dashboard
        if (isLoginPage && this.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        this.updateUI();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => window.userContext.init());

// Make getAuthHeader globally available
window.getAuthHeader = window.userContext.getAuthHeader.bind(window.userContext);
