// Common navigation functions
window.navigate = function(page) {
    try {
        // Store the target page in session storage to prevent unwanted redirects
        sessionStorage.setItem('intentionalNavigation', 'true');
        window.location.href = page;
    } catch (error) {
        console.error('Navigation error:', error);
    }
};

// Clear the navigation flag when the page loads
document.addEventListener('DOMContentLoaded', () => {
    sessionStorage.removeItem('intentionalNavigation');
});
