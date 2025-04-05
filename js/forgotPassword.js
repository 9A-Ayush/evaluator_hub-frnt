 document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');

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
        forgotPasswordForm.insertBefore(errorDiv, forgotPasswordForm.firstChild);
    }

    // Show success message
    function showSuccess(message) {
        clearErrors();
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        forgotPasswordForm.insertBefore(successDiv, forgotPasswordForm.firstChild);
    }

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const email = emailInput.value;

        try {
            // Show loading state
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

            const response = await fetch(`${API_ENDPOINTS.forgotPassword}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process request');
            }

            // Show success message
            showSuccess('Password reset instructions have been sent to your email.');
            emailInput.value = ''; // Clear the email input

        } catch (error) {
            showError(error.message || 'Failed to process request. Please try again.');
        } finally {
            // Reset button state
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Reset Password';
        }
    });
});