// Global variables
let userData = null;

// Function to get auth header
function getAuthHeader() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };
}

// Function to load user data
async function loadUserData() {
    if (!window.userContext.requireAuth()) return;

    try {
        const user = await window.userContext.getCurrentUser();
        if (!user) {
            throw new Error('No user data found');
        }

        // Get full user profile from backend
        const response = await fetch(`${window.API_BASE_URL}/users/profile`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        userData = await response.json();
        
        // Update display elements
        updateDisplayElements();
        
        // Populate form fields
        populateFormFields();

    } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message || 'Failed to load user data');
    }
}

// Function to update display elements
function updateDisplayElements() {
    // Update profile picture
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePicture.src = userData.profilePicture || 'https://via.placeholder.com/150';
    }

    // Update name
    const displayName = document.getElementById('displayName');
    if (displayName) {
        displayName.textContent = `${userData.firstName} ${userData.lastName}`;
    }

    // Update role
    const displayRole = document.getElementById('displayRole');
    if (displayRole) {
        displayRole.textContent = userData.role || 'Evaluator';
    }

    // Update level
    const displayLevel = document.getElementById('displayLevel');
    if (displayLevel) {
        displayLevel.textContent = userData.level ? `${userData.level.charAt(0).toUpperCase() + userData.level.slice(1)} Level` : '';
    }

    // Update status
    const displayStatus = document.getElementById('displayStatus');
    if (displayStatus) {
        const status = userData.status || 'active';
        displayStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        displayStatus.className = `badge status-badge ${status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`;
    }
}

// Function to populate form fields
function populateFormFields() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    // Set form field values
    const fields = ['firstName', 'lastName', 'email', 'department', 'role'];
    fields.forEach(field => {
        const input = profileForm.querySelector(`[name="${field}"]`);
        if (input && userData[field]) {
            input.value = userData[field];
        }
    });
}

// Function to show toast notifications
function showToast(type, message) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '5';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

// Handle profile form submission
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!window.userContext.requireAuth()) return;

        const submitButton = this.querySelector('button[type="submit"]');
        if (!submitButton) return;

        // Disable submit button and show loading state
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';

        try {
            // Get form data
            const formData = new FormData(this);
            const updatedData = Object.fromEntries(formData.entries());

            // Send to backend
            const response = await fetch(`${window.API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            // Update local user data
            userData = await response.json();
            
            // Update display elements
            updateDisplayElements();
            
            showToast('success', 'Profile updated successfully');

        } catch (error) {
            console.error('Error:', error);
            showToast('error', error.message || 'Failed to update profile');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Handle password form submission
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!window.userContext.requireAuth()) return;

        const submitButton = this.querySelector('button[type="submit"]');
        if (!submitButton) return;

        // Get password values
        const currentPassword = this.querySelector('[name="currentPassword"]').value;
        const newPassword = this.querySelector('[name="newPassword"]').value;
        const confirmPassword = this.querySelector('[name="confirmPassword"]').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            showToast('error', 'New passwords do not match');
            return;
        }

        // Disable submit button and show loading state
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';

        try {
            // Send to backend
            const response = await fetch(`${window.API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            showToast('success', 'Password updated successfully');
            this.reset();

        } catch (error) {
            console.error('Error:', error);
            showToast('error', error.message || 'Failed to update password');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Handle profile picture upload
const profilePictureBtn = document.querySelector('.profile-picture-btn');
const profilePicture = document.getElementById('profilePicture');

if (profilePictureBtn && profilePicture) {
    profilePictureBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async function(e) {
            if (!e.target.files?.length) return;
            
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('profilePicture', file);

            try {
                const response = await fetch(`${window.API_BASE_URL}/users/profile-picture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload profile picture');
                }

                const data = await response.json();
                profilePicture.src = data.profilePicture;
                showToast('success', 'Profile picture updated successfully');

            } catch (error) {
                console.error('Error:', error);
                showToast('error', error.message || 'Failed to upload profile picture');
            }
        };
        
        input.click();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!window.userContext.requireAuth()) return;
    loadUserData();
});