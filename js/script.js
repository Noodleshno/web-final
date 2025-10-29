// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

// Loading a saved theme when the page loads
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.textContent = 'light_mode';
} else {
    body.classList.remove('dark-mode');
    themeIcon.textContent = 'dark_mode';
}

// Switch themes
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeIcon.textContent = 'light_mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = 'dark_mode';
        localStorage.setItem('theme', 'light');
    }
});


// Category Filter Functionality
const categoryTags = document.querySelectorAll('.category-tag');

categoryTags.forEach(tag => {
    tag.addEventListener('click', () => {
        categoryTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
    });
});