// Handle login form submission
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    sessionStorage.setItem('email', formData.get('email'));
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    fetch("http://your-server-adres/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Login successful!") {
            navigateTo("Landing-page");
        } else {
            document.querySelector('.login-form-error').textContent = data.message;
            document.querySelector('.login-form-error').style.display = "block";
            document.querySelector('.secret-section').style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error);
    });
});

// Handle forget password form submission
document.getElementById("forget-password-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    sessionStorage.setItem('email', formData.get('email'));
    const data = {
        email: formData.get('email')
    };

    fetch("http://your-server-adres/api/login/forget/enter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Password recovery code sent successfully!") {
            navigateTo("forget-code-insert-page");
        } else {
            document.querySelector('.forget-password-error').textContent = data.message;
            document.querySelector('.forget-password-error').style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error);
    });
});

// Handle forget code form submission
document.getElementById("forget-code-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        code: formData.get('code'),
    };

    fetch("http://your-server-adres/api/login/forget/end", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Code successfully verified!") {
            navigateTo("refresh-password-page");
        } else {
            document.querySelector('.forget-code-page-error').textContent = data.message;
            document.querySelector('.forget-code-page-error').style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error!");
    });
});

// Handle refresh password form submission
document.getElementById("refresh-password-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const newPassword = formData.get('new-password');
    const confirmNewPassword = formData.get('confirm-new-password');

    if (newPassword !== confirmNewPassword) {
        document.querySelector('.refresh-password-error').textContent = "New passwords do not match.";
        document.querySelector('.refresh-password-error').style.display = "block";
        return;
    }

    const data = {
        email: sessionStorage.getItem('email'),
        newPassword: newPassword
    };

    fetch("http://your-server-adres/api/login/password/resfresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Password updated successfully!") {
            navigateTo('login-page');
        } else {
            document.querySelector('.refresh-password-error').textContent = data.error || "An error occurred.";
            document.querySelector('.refresh-password-error').style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error!");
    });
});

// Handle sign-up form submission
document.getElementById("sign-up-form").addEventListener("submit", function(event) {
    event.preventDefault();
    document.querySelector('.success-message').style.color = "green";
    document.querySelector('.success-message').textContent = 'Wait a minute...';
    document.querySelector('.success-message').style.display = "block";

    const formData = new FormData(event.target);
    sessionStorage.setItem('email', formData.get('email'));
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        bio: formData.get('bio'),
        birthyear: formData.get('birthyear')
    };

    fetch("http://your-server-adres/api/signup/enter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Verification code sent successfully!") {
            navigateTo("code-insert-page");
        }
        document.querySelector('.success-message').textContent = data.error;
        document.querySelector('.success-message').style.color = "red";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error!");
    });
});

// Handle enter code form submission
document.getElementById("enter-code-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        code: formData.get('code'),
    };

    fetch("http://your-server-adres/api/signup/end", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "User successfully signed up!") {
            navigateTo("Landing-page");
        } else {
            document.querySelector('.insert-page-error').textContent = data.message;
            document.querySelector('.insert-page-error').style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error!");
    });
});
