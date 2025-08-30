document.addEventListener('DOMContentLoaded', () => {
    fetch('./php/auth.php',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getuser' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('user_name_field').textContent = data.data.username + (data.data.organization ? " (" + data.data.organization + ")" : "");
        } else {
            document.getElementById('user_name_field').textContent = 'Guest';
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        document.getElementById('user_name_field').textContent = 'Guest';
    });
});
    

document.addEventListener('DOMContentLoaded', () => {
    const roleNameInput = document.getElementById('roleName');
    const feedback = document.getElementById('roleFeedback');
    const submitBtn = document.getElementById('submitBtn');
    const suggestionsList = document.getElementById('roleSuggestions');

    roleNameInput.addEventListener('input', function () {
        const roleName = this.value.trim();
        feedback.textContent = '';
        suggestionsList.innerHTML = '';

        if (roleName.length === 0) {
            submitBtn.disabled = false;
            return;
        }

        fetch('check_role.php?role=' + encodeURIComponent(roleName))
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    feedback.innerHTML = `<span class="text-danger">Role already exists (ID: ${data.role_id})</span>`;
                    submitBtn.disabled = true;
                } else {
                    feedback.innerHTML = `<span class="text-success">Role name is available</span>`;
                    submitBtn.disabled = false;
                }

                // Autocomplete suggestions
                if (data.matches && data.matches.length > 0) {
                    suggestionsList.innerHTML = '';
                    data.matches.forEach(match => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item list-group-item-action';
                        li.textContent = `${match.role_name} (ID: ${match.role_id})`;
                        li.addEventListener('click', () => {
                            roleNameInput.value = match.role_name;
                            suggestionsList.innerHTML = '';
                            feedback.innerHTML = `<span class="text-danger">Role already exists (ID: ${match.role_id})</span>`;
                            submitBtn.disabled = true;
                        });
                        suggestionsList.appendChild(li);
                    });
                }
            })
            .catch(err => {
                console.error(err);
                feedback.textContent = 'Error checking role';
            });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roleForm');
    const feedback = document.getElementById('roleFeedback');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const roleName = document.getElementById('roleName').value.trim();

        if(roleName.length===0){
            feedback.innerHTML = `<span class="text-danger">Role name cannot be empty</span>`;
            return;
        }

        fetch('save_role.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'roleName=' + encodeURIComponent(roleName)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                feedback.innerHTML = `<span class="text-success">${data.message}</span>`;
                form.reset();
                document.getElementById('submitBtn').disabled = false;
                document.getElementById('roleSuggestions').innerHTML = '';
            } else {
                feedback.innerHTML = `<span class="text-danger">${data.message}</span>`;
            }
        })
        .catch(err => {
            console.error(err);
            feedback.textContent = 'Error saving role';
        });
    });
});