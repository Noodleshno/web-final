const defaultProfile = {
    fullName: 'John Doe',
    email: 'john.doe@cinemaholic.com',
    phone: '+7 777 777 7777',
    profilePicture: null
};

function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        return JSON.parse(savedProfile);
    }
    return defaultProfile;
}

function saveProfile(profileData) {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
}

function updateProfileUI(profile) {
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    
    document.getElementById('sidebarName').textContent = profile.fullName || 'John Doe';
    document.getElementById('sidebarEmail').textContent = profile.email || 'john.doe@cinemaholic.com';
    
    updateProfilePicture(profile.profilePicture || null);
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

document.addEventListener('DOMContentLoaded', () => {
    let currentProfile = loadProfile();
    updateProfileUI(currentProfile);
    
    let currentProfilePicture = currentProfile.profilePicture || null;
    
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.querySelector('.cancel-btn');
    const uploadBox = document.getElementById('uploadBox');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    
    profileForm.addEventListener('submit', (e) => {
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
        
        saveProfile(profileData);
        
        currentProfile = profileData;
        currentProfilePicture = profileData.profilePicture;
        
        updateProfileUI(profileData);
        
        profilePictureInput.value = '';
        
        alert('Profile updated successfully!');
    });
    
    cancelBtn.addEventListener('click', () => {
        currentProfile = loadProfile();
        currentProfilePicture = currentProfile.profilePicture || null;
        updateProfileUI(currentProfile);
        profilePictureInput.value = '';
    });
    
    uploadBox.addEventListener('click', () => {
        profilePictureInput.click();
    });
    
    profilePictureInput.addEventListener('change', async (e) => {
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
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#e53935';
        uploadBox.style.backgroundColor = '#fff5f5';
        if (document.body.classList.contains('dark-mode')) {
            uploadBox.style.backgroundColor = '#2a2a2a';
        }
    });
    
    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
        if (document.body.classList.contains('dark-mode')) {
            uploadBox.style.backgroundColor = '#1a1a1a';
        }
    });
    
    uploadBox.addEventListener('drop', async (e) => {
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
    
    avatarEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profilePictureInput.click();
    });
});

