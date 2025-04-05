document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.querySelector('input[type="password"]');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('bi-eye');
            this.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Additional password match validation for signup form
            if (form.id === 'signupForm') {
                const password = document.getElementById('signupPassword');
                const confirm = document.getElementById('confirmPassword');
                
                if (password.value !== confirm.value) {
                    confirm.setCustomValidity('Passwords do not match');
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    confirm.setCustomValidity('');
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}); 