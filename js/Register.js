const handleRegistration = async (e) => {
    e.preventDefault();
    
    try {
        // Form validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            setError('Please accept the Terms and Conditions');
            return;
        }

        console.log('Attempting registration with:', { firstName, lastName, email });
        
        const response = await fetch(window.API_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });

        console.log('Server response status:', response.status);
        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        if (data.success) {
            // Store token
            localStorage.setItem('token', data.token);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } else {
            setError(data.message || 'Registration failed');
        }

    } catch (error) {
        console.error('Registration error:', error);
        setError(error.message || 'Registration failed. Please try again.');
    }
}; 