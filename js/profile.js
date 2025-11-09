
const PROFILES_STORAGE_KEY = 'cineholicProfiles'; 
const CURRENT_USER_KEY = 'cineholicCurrentUser';

const DEFAULT_AVATAR_SVG = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
  <rect width='100%' height='100%' fill='#e6e9ee'/>
  <circle cx='60' cy='40' r='24' fill='#cfd6e3'/>
  <path d='M30 88c6-10 18-16 30-16s24 6 30 16' fill='#cfd6e3'/>
</svg>`;
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(DEFAULT_AVATAR_SVG);

const defaultProfile = {
    fullName: 'John Doe',
    email: 'john.doe@cinemaholic.com',
    phone: '+7 777 777 7777',
    profilePicture: DEFAULT_AVATAR
};

function getCurrentUserEmail() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        return obj && obj.email ? obj.email.toLowerCase() : null;
    } catch (e) {
        return null;
    }
}

function loadProfile() {
    const email = getCurrentUserEmail();
    if (email) {
        const profilesRaw = localStorage.getItem(PROFILES_STORAGE_KEY);
        let profiles = {};
        try { profiles = profilesRaw ? JSON.parse(profilesRaw) : {}; } catch (e) { profiles = {}; }

        const profile = profiles[email];
        if (profile) return profile;

        return {
            fullName: '',
            email: email,
            phone: '',
            profilePicture: DEFAULT_AVATAR
        };
    }

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        try { return JSON.parse(savedProfile); } catch (e) {  }
    }

    return defaultProfile;
}

function saveProfile(profileData) {
    const email = getCurrentUserEmail();
    if (email) {
        const profilesRaw = localStorage.getItem(PROFILES_STORAGE_KEY);
        let profiles = {};
        try { profiles = profilesRaw ? JSON.parse(profilesRaw) : {}; } catch (e) { profiles = {}; }

        profiles[email] = profileData;
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        return;
    }

    localStorage.setItem('userProfile', JSON.stringify(profileData));
}

function updateProfileUI(profile) {
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    
    document.getElementById('sidebarName').textContent = profile.fullName || 'John Doe';
    document.getElementById('sidebarEmail').textContent = profile.email || 'john.doe@cinemaholic.com';
    
    updateProfilePicture(profile.profilePicture || DEFAULT_AVATAR);
}

function updateProfilePicture(imageData) {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const avatarImage = document.getElementById('avatarImage');
    const profilePreview = document.getElementById('profilePreview');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadText = document.getElementById('uploadText');
    
    if (imageData) {
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (avatarImage) {
            avatarImage.src = imageData;
            avatarImage.style.display = 'block';
        }
        
        if (uploadIcon) uploadIcon.style.display = 'none';
        if (profilePreview) {
            profilePreview.src = imageData;
            profilePreview.style.display = 'block';
        }
        if (uploadText) uploadText.textContent = 'Click to change image';
    } else {
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
        if (avatarImage) avatarImage.style.display = 'none';
        if (uploadIcon) uploadIcon.style.display = 'block';
        if (profilePreview) profilePreview.style.display = 'none';
        if (uploadText) uploadText.textContent = 'Click to upload or drag and drop';
    }
}

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('File size exceeds 5MB limit'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

function animateSaveSuccess(button) {
    if (!button) return;
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.classList.add('save-success');

    button.innerHTML = `<span class="material-symbols-outlined save-check">check_circle</span><span>Saved</span>`;

    setTimeout(() => {
        button.classList.remove('save-success');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }, 1400);
}

document.addEventListener('DOMContentLoaded', () => {

    let currentProfile = loadProfile();
    updateProfileUI(currentProfile);

    let currentProfilePicture = currentProfile.profilePicture || null;

    const profileForm = document.getElementById('profileForm');
    const saveBtn = profileForm ? profileForm.querySelector('.save-btn') : null;
    const cancelBtn = profileForm ? profileForm.querySelector('.cancel-btn') : document.querySelector('.cancel-btn');
    const uploadBox = document.getElementById('uploadBox');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const avatarEditBtn = document.getElementById('avatarEditBtn');

    profileForm && profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const profileData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            profilePicture: currentProfilePicture
        };

        if (!profileData.fullName || !profileData.email) {
            alert('Please fill in all required fields (Name and Email)');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        const email = getCurrentUserEmail();
        if (email) {
            try {
                const backupsRaw = sessionStorage.getItem(BACKUP_STORAGE_KEY);
                const backups = backupsRaw ? JSON.parse(backupsRaw) : {};

                const preSaved = loadProfile();
                backups[email] = preSaved;
                sessionStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
                console.log('[profile] backup saved for', email, preSaved);
            } catch (err) {
                console.error('[profile] backup failed', err);
            }
        }

        saveProfile(profileData);

        currentProfile = profileData;
        currentProfilePicture = profileData.profilePicture;

        updateProfileUI(profileData);

        if (profilePictureInput) profilePictureInput.value = '';

        animateSaveSuccess(saveBtn);
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const email = getCurrentUserEmail();

            if (email) {
                try {
                    const backupsRaw = sessionStorage.getItem(BACKUP_STORAGE_KEY);
                    const backups = backupsRaw ? JSON.parse(backupsRaw) : {};
                    const backup = backups[email];
                    if (backup) {

                        saveProfile(backup);

                        delete backups[email];
                        sessionStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));

                        currentProfile = backup;
                        currentProfilePicture = backup.profilePicture || DEFAULT_AVATAR;
                        updateProfileUI(currentProfile);
                        if (profilePictureInput) profilePictureInput.value = '';

                        animateRevert(saveBtn);
                        console.log('[profile] restored backup for', email, backup);
                        return;
                    }
                } catch (err) {
                    console.error('[profile] error reading backups', err);

                }
            }

            const saved = loadProfile();
            currentProfile = saved;
            currentProfilePicture = saved && saved.profilePicture ? saved.profilePicture : DEFAULT_AVATAR;

            updateProfileUI(currentProfile);
            if (profilePictureInput) profilePictureInput.value = '';

            if (saveBtn) saveBtn.disabled = false;
        });
    }

    uploadBox && uploadBox.addEventListener('click', () => {
        profilePictureInput && profilePictureInput.click();
    });

    profilePictureInput && profilePictureInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64Image = await imageToBase64(file);

                currentProfilePicture = base64Image;

                updateProfilePicture(base64Image);
            } catch (error) {
                alert(error.message || 'Error uploading image. Please try again.');
            }
        }
    });

    uploadBox && uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#e53935';
        uploadBox.style.backgroundColor = '#fff5f5';
        if (document.body.classList.contains('dark-mode')) {
            uploadBox.style.backgroundColor = '#2a2a2a';
        }
    });

    uploadBox && uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
        if (document.body.classList.contains('dark-mode')) {
            uploadBox.style.backgroundColor = '#1a1a1a';
        }
    });

    uploadBox && uploadBox.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
        if (document.body.classList.contains('dark-mode')) {
            uploadBox.style.backgroundColor = '#1a1a1a';
        }

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            try {
                const base64Image = await imageToBase64(file);

                currentProfilePicture = base64Image;

                updateProfilePicture(base64Image);
            } catch (error) {
                alert(error.message || 'Error uploading image. Please try again.');
            }
        } else {
            alert('Please drop an image file');
        }
    });

    avatarEditBtn && avatarEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profilePictureInput && profilePictureInput.click();
    });
});

