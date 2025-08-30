document.addEventListener('DOMContentLoaded', function() {
    fetch('./php/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getuser' }),
        credentials: 'same-origin' // Include cookies for session management
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.username) {
            document.getElementById('user_name_field').textContent = data.data.username;
        } else {
            document.getElementById('user_name_field').textContent = 'Guest';
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        document.getElementById('user_name_field').textContent = 'Guest';
    });
});