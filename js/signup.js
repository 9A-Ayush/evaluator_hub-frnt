document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password validation
    function validatePassword() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity("Passwords don't match");
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    }

    // Clear previous error messages
    function clearErrors() {
        const existingError = signupForm.querySelector('.alert');
        if (existingError) {
            existingError.remove();
        }
    }

    // Show error message
    function showError(message) {
        clearErrors();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = message;
        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }

    passwordInput.addEventListener('change', validatePassword);
    confirmPasswordInput.addEventListener('keyup', validatePassword);

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = passwordInput.value;
        
        // Validate password match
        if (password !== confirmPasswordInput.value) {
            showError("Passwords don't match");
            return;
        }

        try {
            // Show loading state
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating Account...';

            // Clear any previous error messages
            const errorDiv = document.querySelector('.alert-danger');
            if (errorDiv) {
                errorDiv.remove();
            }

            console.log('Attempting registration with:', { firstName, lastName, email });
            
            // Register user
            await window.register({
                firstName,
                lastName,
                email,
                password,
                role: 'user'
            });

            // If registration is successful, the register function will redirect to index.html
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.role = 'alert';
            errorDiv.style.marginBottom = '1rem';
            errorDiv.textContent = error.message || 'Registration failed. Please try again later.';
            
            // Insert error message at the top of the form
            signupForm.insertBefore(errorDiv, signupForm.firstChild);
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
            
            // Scroll to error message
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});