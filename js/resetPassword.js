document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError('Invalid or missing reset token. Please request a new password reset.');
        disableForm();
        return;
    }

    // Password validation requirements
    const requirements = {
        length: { regex: /.{8,}/, element: document.getElementById('lengthReq') },
        upper: { regex: /[A-Z]/, element: document.getElementById('upperReq') },
        lower: { regex: /[a-z]/, element: document.getElementById('lowerReq') },
        number: { regex: /[0-9]/, element: document.getElementById('numberReq') }
    };

    // Update requirement status
    function updateRequirements(password) {
        for (const [key, requirement] of Object.entries(requirements)) {
            const isValid = requirement.regex.test(password);
            const icon = requirement.element.querySelector('i');
            icon.className = `fas fa-${isValid ? 'check' : 'circle'}`;
            requirement.element.classList.toggle('valid', isValid);
            requirement.element.classList.toggle('invalid', !isValid);
        }
    }

    // Password input event listener
    passwordInput.addEventListener('input', () => {
        updateRequirements(passwordInput.value);
        validatePasswordMatch();
    });

    // Confirm password input event listener
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Validate password match
    function validatePasswordMatch() {
        const isMatch = passwordInput.value === confirmPasswordInput.value;
        confirmPasswordInput.classList.toggle('is-invalid', !isMatch && confirmPasswordInput.value);
        return isMatch;
    }

    // Clear previous error messages
    function clearErrors() {
        const existingAlerts = document.querySelectorAll('.alert:not(.alert-info)');
        existingAlerts.forEach(alert => alert.remove());
    }

    // Show error message
    function showError(message) {
        clearErrors();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        resetPasswordForm.insertBefore(errorDiv, resetPasswordForm.firstChild);
    }

    // Show success message
    function showSuccess(message) {
        clearErrors();
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        resetPasswordForm.insertBefore(successDiv, resetPasswordForm.firstChild);
    }

    // Disable form
    function disableForm() {
        const inputs = resetPasswordForm.querySelectorAll('input, button');
        inputs.forEach(input => input.disabled = true);
    }

    // Validate password
    function validatePassword(password) {
        return Object.values(requirements).every(req => req.regex.test(password));
    }

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate password requirements
        if (!validatePassword(password)) {
            showError('Please ensure your password meets all requirements.');
            return;
        }

        // Check if passwords match
        if (!validatePasswordMatch()) {
            showError('Passwords do not match.');
            return;
        }

        try {
            // Show loading state
            const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Resetting...';

            const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            // Show success message and redirect
            showSuccess('Password reset successful! Redirecting to login...');
            disableForm();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            showError(error.message || 'Failed to reset password. Please try again.');
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
