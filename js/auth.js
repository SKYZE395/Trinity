/**
 * Authentication JavaScript
 * Handles login, signup functionality (email verification removed)
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize authentication handlers
    initializeLoginForm();
    
    /**
     * Initialize Login Form Handler
     */
    function initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginusername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            const successDiv = document.getElementById('loginSuccess');
            
            // Clear previous messages
            clearMessages([errorDiv, successDiv]);
            
            // Validate inputs
            const validation = validateLoginInputs(username, password);
            if (!validation.isValid) {
                showError(errorDiv, validation.message);
                return;
            }
            
            // Submit login request
            submitLogin(username, password, errorDiv, successDiv, this);
        });
    }
    
    /**
     * Validate login inputs
     */
    function validateLoginInputs(username, password) {
        if (!username || !password) {
            return { isValid: false, message: 'Please fill in all fields' };
        }
        
        if (username.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters long' };
        }
        
        return { isValid: true };
    }
    
    /**
     * Submit login request
     */
    function submitLogin(username, password, errorDiv, successDiv, form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        setLoadingState(submitBtn, 'Logging in...', true);
        
        fetch('./php/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(successDiv, 'Login successful! Redirecting...');
                // Redirect to dashboard or home page
                setTimeout(() => {
                    window.location.href = 'index.html' // Change to your desired page
                }, 1500);
            } else {
                showError(errorDiv, data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
            showError(errorDiv, 'An error occurred. Please try again.');
        })
        .finally(() => {
            setLoadingState(submitBtn, originalText, false);
        });
    }

    function clearMessages(elements) {
        elements.forEach(element => {
            if (element) element.textContent = '';
        });
    }
    
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.className = element.className.replace('text-success', 'text-danger');
        }
    }
    
    function showSuccess(element, message) {
        if (element) {
            element.textContent = message;
            element.className = element.className.replace('text-danger', 'text-success');
        }
    }
    
    function setLoadingState(button, text, disabled) {
        if (button) {
            button.textContent = text;
            button.disabled = disabled;
        }
    }
});