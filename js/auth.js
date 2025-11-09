document.addEventListener('DOMContentLoaded', () => {



    function sanitizeAbsoluteImagePaths() {
        try {
            const imgs = Array.from(document.querySelectorAll('img'));
            imgs.forEach((img) => {
                const src = img.getAttribute('src') || '';

                if (/^[A-Za-z]:\\/.test(src) || src.startsWith('file:') || src.startsWith('\\\\')) {
                    console.info('Sanitized absolute image src on auth page:', src);
                    img.setAttribute('src', 'images/favicon.png');
                }
            });
        } catch (e) {

            console.debug('sanitizeAbsoluteImagePaths failed', e);
        }
    }

    sanitizeAbsoluteImagePaths();
    const MODE = {
        SIGN_IN: 'signin',
        SIGN_UP: 'signup'
    };

    const USERS_STORAGE_KEY = 'cineholicUsers';
    const CURRENT_USER_KEY = 'cineholicCurrentUser';
    const PROFILES_STORAGE_KEY = 'cineholicProfiles'; 

    const authCard = document.querySelector('.auth-card');
    const modeButtons = document.querySelectorAll('.auth-toggle-btn');
    const messageBox = document.getElementById('authMessage');
    const signUpForm = document.getElementById('signUpForm');
    const signInForm = document.getElementById('signInForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const guestAccessBtn = document.getElementById('guestAccessBtn');
    const authCardTitle = authCard ? authCard.querySelector('.auth-card-title') : null;
    const authCardDescription = authCard ? authCard.querySelector('.auth-card-description') : null;

    const signUpSubmitBtn = signUpForm.querySelector('.primary-btn');
    const signInSubmitBtn = signInForm.querySelector('.primary-btn');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function loadUsers() {
        try {
            const raw = localStorage.getItem(USERS_STORAGE_KEY);
            if (!raw) return [];

            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to parse users from storage', error);
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            lastLoginAt: new Date().toISOString()
        }));
    }

    function ensureProfileSeed(user) {
        try {

            const profilesRaw = localStorage.getItem(PROFILES_STORAGE_KEY);
            let profiles = {};
            try { profiles = profilesRaw ? JSON.parse(profilesRaw) : {}; } catch (e) { profiles = {}; }

            const emailKey = (user && user.email) ? user.email.toLowerCase() : null;
            if (!emailKey) return;

            const existing = profiles[emailKey] || null;

            const merged = {
                fullName: user.fullName || (existing && existing.fullName) || '',
                email: user.email || (existing && existing.email) || '',
                phone: user.phone || (existing && existing.phone) || '',

                profilePicture: (existing && existing.profilePicture) || null
            };

            profiles[emailKey] = merged;
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        } catch (error) {
            console.warn('Unable to sync profile stub', error);
        }
    }

    function displayMessage(type, text) {
        messageBox.classList.remove('visible', 'success', 'error', 'info');
        if (!type || !text) {
            messageBox.textContent = '';
            return;
        }

        messageBox.textContent = text;
        messageBox.classList.add('visible', type);
    }

    function clearErrors(form) {
        form.querySelectorAll('input').forEach((input) => clearFieldError(input));
    }

    function clearFieldError(input) {
        const errorElement = input.closest('.form-field')?.querySelector('.input-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        input.removeAttribute('aria-invalid');
    }

    function setFieldError(input, message) {
        const errorElement = input.closest('.form-field')?.querySelector('.input-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
        input.setAttribute('aria-invalid', 'true');
    }

    function toggleMode(mode) {
        authCard.dataset.mode = mode;

        modeButtons.forEach((btn) => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        displayMessage();

        if (mode === MODE.SIGN_UP) {
            signUpForm.classList.add('active');
            signUpForm.removeAttribute('hidden');
            signInForm.classList.remove('active');
            signInForm.setAttribute('hidden', '');
        } else {
            signInForm.classList.add('active');
            signInForm.removeAttribute('hidden');
            signUpForm.classList.remove('active');
            signUpForm.setAttribute('hidden', '');
        }

        clearErrors(signUpForm);
        clearErrors(signInForm);

        if (authCardTitle && authCardDescription) {
            if (mode === MODE.SIGN_UP) {
                authCardTitle.textContent = 'Create your Cinemaholic account';
                authCardDescription.textContent = 'Switch tabs anytime to sign in if you already have an account.';
            } else {
                authCardTitle.textContent = 'Welcome back to Cinemaholic';
                authCardDescription.textContent = 'Need an account? Switch to sign up.';
            }
        }
    }

    function handlePasswordToggle(button) {
        const targetId = button.dataset.target;
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        const makeVisible = input.type === 'password';
        input.type = makeVisible ? 'text' : 'password';
        button.querySelector('.material-symbols-outlined').textContent = makeVisible ? 'visibility_off' : 'visibility';
        button.setAttribute('aria-label', makeVisible ? 'Hide password' : 'Show password');
    }

    function handleSignUpSubmit(event) {
        event.preventDefault();
        displayMessage();
        clearErrors(signUpForm);

    const fullNameInput = document.getElementById('signupFullName');
    const emailInput = document.getElementById('signupEmail');
    const phoneInput = document.getElementById('signupPhone');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');

        let isValid = true;

        const fullName = fullNameInput.value.trim();
        if (!fullName) {
            setFieldError(fullNameInput, 'Please enter your name');
            isValid = false;
        } else if (fullName.length < 2) {
            setFieldError(fullNameInput, 'Name must be at least 2 characters long');
            isValid = false;
        }

        const email = emailInput.value.trim().toLowerCase();
        if (!email) {
            setFieldError(emailInput, 'Please enter your email');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            setFieldError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        const password = passwordInput.value;
        if (!password) {
            setFieldError(passwordInput, 'Please enter a password');
            isValid = false;
        } else if (password.length < 6) {
            setFieldError(passwordInput, 'Password must be at least 6 characters long');
            isValid = false;
        }

        const confirmPassword = confirmPasswordInput.value;
        if (!confirmPassword) {
            setFieldError(confirmPasswordInput, 'Please confirm your password');
            isValid = false;
        } else if (password && confirmPassword !== password) {
            setFieldError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        }

        const users = loadUsers();
        if (email && users.some((user) => user.email === email)) {
            setFieldError(emailInput, 'An account with this email already exists');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        signUpSubmitBtn.disabled = true;

        const now = new Date().toISOString();
        const newUser = {
            fullName,
            email,
            phone: phoneInput ? phoneInput.value.trim() : '',
            password,
            createdAt: now,
            updatedAt: now
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        ensureProfileSeed(newUser);

        displayMessage('success', 'Account created successfully! Redirecting...');
        signUpForm.reset();

        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1400);
    }

    function handleSignInSubmit(event) {
        event.preventDefault();
        displayMessage();
        clearErrors(signInForm);

        const emailInput = document.getElementById('signinEmail');
        const passwordInput = document.getElementById('signinPassword');

        let isValid = true;

        const email = emailInput.value.trim().toLowerCase();
        if (!email) {
            setFieldError(emailInput, 'Please enter your email');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            setFieldError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        const password = passwordInput.value;
        if (!password) {
            setFieldError(passwordInput, 'Please enter your password');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        signInSubmitBtn.disabled = true;

        const users = loadUsers();
        const user = users.find((item) => item.email === email);

        if (!user) {
            setFieldError(emailInput, 'We couldn’t find an account with this email');
            signInSubmitBtn.disabled = false;
            return;
        }

        if (user.password !== password) {
            setFieldError(passwordInput, 'Incorrect password');
            signInSubmitBtn.disabled = false;
            return;
        }

        setCurrentUser(user);
        ensureProfileSeed(user);
        displayMessage('success', 'Welcome back! Taking you to the homepage...');

        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1100);
    }

    function handleForgotPassword() {
        displayMessage();

        const emailValue = signInForm.querySelector('#signinEmail').value.trim().toLowerCase();
        if (!emailValue) {
            displayMessage('error', 'Enter your email to receive a reset link');
            return;
        }

        if (!emailPattern.test(emailValue)) {
            displayMessage('error', 'Check the email format and try again');
            return;
        }

        const users = loadUsers();
        const userExists = users.some((user) => user.email === emailValue);

        if (!userExists) {
            displayMessage('error', 'We couldn’t find an account with that email');
            return;
        }

        displayMessage('info', 'We just sent reset instructions to ' + emailValue + '. (Demo)');
    }

    function handleGuestAccess() {
        localStorage.removeItem(CURRENT_USER_KEY);
        displayMessage('info', 'Continuing as guest...');

        setTimeout(() => {
            window.location.href = 'main_guest.html';
        }, 600);
    }

    modeButtons.forEach((button) => {
        button.addEventListener('click', () => toggleMode(button.dataset.mode));
    });

    document.querySelectorAll('[data-action="switch-to-signin"]').forEach((button) => {
        button.addEventListener('click', () => toggleMode(MODE.SIGN_IN));
    });

    document.querySelectorAll('[data-action="switch-to-signup"]').forEach((button) => {
        button.addEventListener('click', () => toggleMode(MODE.SIGN_UP));
    });

    document.querySelectorAll('.password-toggle').forEach((button) => {
        button.addEventListener('click', () => handlePasswordToggle(button));
    });

    signUpForm.addEventListener('input', (event) => {
        if (event.target.matches('input')) {
            clearFieldError(event.target);
        }
    });

    signInForm.addEventListener('input', (event) => {
        if (event.target.matches('input')) {
            clearFieldError(event.target);
        }
    });

    signUpForm.addEventListener('submit', handleSignUpSubmit);
    signInForm.addEventListener('submit', handleSignInSubmit);
    forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    guestAccessBtn.addEventListener('click', handleGuestAccess);

    const urlParams = new URLSearchParams(window.location.search);
    const initialMode = urlParams.get('mode');
    if (initialMode === MODE.SIGN_IN) {
        toggleMode(MODE.SIGN_IN);
    } else {
        toggleMode(MODE.SIGN_UP);
    }
});
