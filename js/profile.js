// Profile Management Script

// Default profile data
const defaultProfile = {
    fullName: 'John Doe',
    email: 'john.doe@cinemaholic.com',
    phone: '+7 777 777 7777',
    profilePicture: null
};

// Load profile data from localStorage or use defaults
function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        return JSON.parse(savedProfile);
    }
    return defaultProfile;
}

// Save profile data to localStorage
function saveProfile(profileData) {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
}

// Update UI with profile data
function updateProfileUI(profile) {
    // Update form fields
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    
    // Update sidebar
    document.getElementById('sidebarName').textContent = profile.fullName || 'John Doe';
    document.getElementById('sidebarEmail').textContent = profile.email || 'john.doe@cinemaholic.com';
    
    // Update profile picture
    updateProfilePicture(profile.profilePicture || null);
}

// Update profile picture in UI
function updateProfilePicture(imageData) {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const avatarImage = document.getElementById('avatarImage');
    const profilePreview = document.getElementById('profilePreview');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadText = document.getElementById('uploadText');
    
    if (imageData) {
        // Show image in sidebar avatar
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (avatarImage) {
            avatarImage.src = imageData;
            avatarImage.style.display = 'block';
        }
        
        // Show preview in upload box
        if (uploadIcon) uploadIcon.style.display = 'none';
        if (profilePreview) {
            profilePreview.src = imageData;
            profilePreview.style.display = 'block';
        }
        if (uploadText) uploadText.textContent = 'Click to change image';
    } else {
        // Show placeholder
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
        if (avatarImage) avatarImage.style.display = 'none';
        if (uploadIcon) uploadIcon.style.display = 'block';
        if (profilePreview) profilePreview.style.display = 'none';
        if (uploadText) uploadText.textContent = 'Click to upload or drag and drop';
    }
}

// Convert image file to base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        // Check file size (5MB max)
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

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    // Load and display profile data
    let currentProfile = loadProfile();
    updateProfileUI(currentProfile);
    
    // Store current profile picture (can be updated before form submission)
    let currentProfilePicture = currentProfile.profilePicture || null;
    
    // Get DOM elements
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.querySelector('.cancel-btn');
    const uploadBox = document.getElementById('uploadBox');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    
    // Handle form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get current profile picture from stored variable
        const profileData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            profilePicture: currentProfilePicture
        };
        
        // Validate required fields
        if (!profileData.fullName || !profileData.email) {
            alert('Please fill in all required fields (Name and Email)');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Save profile
        saveProfile(profileData);
        
        // Update current profile
        currentProfile = profileData;
        currentProfilePicture = profileData.profilePicture;
        
        // Update UI
        updateProfileUI(profileData);
        
        // Reset file input
        profilePictureInput.value = '';
        
        // Show success message
        alert('Profile updated successfully!');
    });
    
    // Handle cancel button
    cancelBtn.addEventListener('click', () => {
        // Reload original profile data
        currentProfile = loadProfile();
        currentProfilePicture = currentProfile.profilePicture || null;
        updateProfileUI(currentProfile);
        // Reset file input
        profilePictureInput.value = '';
    });
    
    uploadBox.addEventListener('click', () => {
        profilePictureInput.click();
    });
    
    // Handle file input change
    profilePictureInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Convert to base64
                const base64Image = await imageToBase64(file);
                
                // Update current profile picture
                currentProfilePicture = base64Image;
                
                // Update UI immediately
                updateProfilePicture(base64Image);
            } catch (error) {
                alert(error.message || 'Error uploading image. Please try again.');
            }
        }
    });
    
    // Handle drag and drop
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
                // Convert to base64
                const base64Image = await imageToBase64(file);
                
                // Update current profile picture
                currentProfilePicture = base64Image;
                
                // Update UI immediately
                updateProfilePicture(base64Image);
            } catch (error) {
                alert(error.message || 'Error uploading image. Please try again.');
            }
        } else {
            alert('Please drop an image file');
        }
    });
    
    // Handle avatar edit button
    avatarEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profilePictureInput.click();
    });
});

