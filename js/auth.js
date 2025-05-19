// Authentication functionality for Taman Salma Shofa

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorMessages = document.querySelectorAll('.error-message');

// Local Storage Keys
const USERS_STORAGE_KEY = 'tamanSalmaShofa_users';
const CURRENT_USER_KEY = 'tamanSalmaShofa_currentUser';

// Helper function to check if current page is in pages folder
function isInPagesFolder() {
    return window.location.pathname.includes('/pages/');
}

// Helper function to get correct path based on current location
function getPath(path) {
    if (isInPagesFolder()) {
        // If we're in pages folder and the path is for another page in pages folder
        if (path.startsWith('pages/')) {
            return path.replace('pages/', '');
        }
        // If we need to go to root
        if (path === 'index.html') {
            return '../index.html';
        }
        // Otherwise, path is fine
        return path;
    } else {
        // Already in root, paths are fine
        return path;
    }
}

// Initialize users array from local storage or create empty array
function initializeUsers() {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
        return [];
    }
    return JSON.parse(storedUsers);
}

// Check if user is logged in
function checkLoginStatus() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    // Update UI based on login status
    const userActionsElement = document.querySelector('.user-actions');
    
    if (!userActionsElement) return; // Guard clause if element not found
    
    if (currentUser) {
        // User is logged in
        const userData = JSON.parse(currentUser);
        
        // Get correct paths for profile and reviews
        const profilePath = getPath('pages/profile.html');
        const reviewsPath = getPath('pages/reviews.html');
        
        // Create HTML for logged-in user
        const loggedInHTML = `
            <div class="user-profile">
                <img src="${userData.avatar || 'https://via.placeholder.com/150'}" alt="Profile">
                <span>${userData.name}</span>
                <div class="profile-dropdown">
                    <a href="${profilePath}">Profile</a>
                    <a href="${reviewsPath}">My Reviews</a>
                    <a href="#" id="logoutBtn">Logout</a>
                </div>
            </div>
        `;
        
        userActionsElement.innerHTML = loggedInHTML;
        
        // Add event listener for profile dropdown
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', function() {
                const dropdown = this.querySelector('.profile-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            });
        }
        
        // Add event listener for logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // User is not logged in
        const loginPath = getPath('pages/login.html');
        const registerPath = getPath('pages/register.html');
        
        const notLoggedInHTML = `
            <a href="${loginPath}" class="login-btn">Login</a>
            <a href="${registerPath}">Register</a>
        `;
        
        userActionsElement.innerHTML = notLoggedInHTML;
    }
}

// Registration function
function registerUser(name, email, password) {
    const users = initializeUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    // Create new user object
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        avatar: 'https://via.placeholder.com/150',
        joinDate: new Date().toISOString(),
        reviews: []
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to local storage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return { success: true, user: newUser };
}

// Login function
function loginUser(email, password) {
    const users = initializeUsers();
    
    // Find user by email and password
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Store current user in local storage (exclude password for security)
    const userDataForStorage = { ...user };
    delete userDataForStorage.password;
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDataForStorage));
    
    return { success: true, user: userDataForStorage };
}

// Logout function
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = getPath('index.html');
}

// Form validation
function validateForm(formType, formData) {
    let isValid = true;
    
    // Reset error messages
    if (errorMessages) {
        errorMessages.forEach(element => {
            element.style.display = 'none';
            element.parentElement.classList.remove('error');
        });
    }
    
    if (formType === 'register') {
        // Validate name
        const nameError = document.getElementById('nameError');
        if (!formData.name || formData.name.trim().length < 2) {
            if (nameError) {
                nameError.textContent = 'Name must be at least 2 characters';
                nameError.style.display = 'block';
                nameError.parentElement.classList.add('error');
            }
            isValid = false;
        }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailErrorId = formType === 'register' ? 'emailError' : 'loginEmailError';
    const emailError = document.getElementById(emailErrorId);
    
    if (!formData.email || !emailRegex.test(formData.email)) {
        if (emailError) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.style.display = 'block';
            emailError.parentElement.classList.add('error');
        }
        isValid = false;
    }
    
    // Validate password
    const passwordErrorId = formType === 'register' ? 'passwordError' : 'loginPasswordError';
    const passwordError = document.getElementById(passwordErrorId);
    
    if (!formData.password || formData.password.length < 6) {
        if (passwordError) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordError.style.display = 'block';
            passwordError.parentElement.classList.add('error');
        }
        isValid = false;
    }
    
    if (formType === 'register' && formData.password !== formData.confirmPassword) {
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        if (confirmPasswordError) {
            confirmPasswordError.textContent = 'Passwords do not match';
            confirmPasswordError.style.display = 'block';
            confirmPasswordError.parentElement.classList.add('error');
        }
        isValid = false;
    }
    
    return isValid;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users if needed
    initializeUsers();
    
    // Check login status and update UI
    checkLoginStatus();
    
    // Check if login form exists and add event listener
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };
            
            if (validateForm('login', formData)) {
                const loginResult = loginUser(formData.email, formData.password);
                
                if (loginResult.success) {
                    window.location.href = getPath('index.html');
                } else {
                    const loginEmailError = document.getElementById('loginEmailError');
                    if (loginEmailError) {
                        loginEmailError.textContent = loginResult.message;
                        loginEmailError.style.display = 'block';
                        loginEmailError.parentElement.classList.add('error');
                    }
                }
            }
        });
    }
    
    // Check if register form exists and add event listener
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            
            if (validateForm('register', formData)) {
                const registerResult = registerUser(formData.name, formData.email, formData.password);
                
                if (registerResult.success) {
                    // Automatically log in after registration
                    loginUser(formData.email, formData.password);
                    window.location.href = getPath('index.html');
                } else {
                    const emailError = document.getElementById('emailError');
                    if (emailError) {
                        emailError.textContent = registerResult.message;
                        emailError.style.display = 'block';
                        emailError.parentElement.classList.add('error');
                    }
                }
            }
        });
    }
    
    // Handle document clicks for dropdown
    document.addEventListener('click', function(e) {
        const userProfile = document.querySelector('.user-profile');
        const dropdown = document.querySelector('.profile-dropdown');
        
        if (userProfile && dropdown && !userProfile.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});