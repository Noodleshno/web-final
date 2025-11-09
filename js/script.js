const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.textContent = 'light_mode';
} else {
    body.classList.remove('dark-mode');
    themeIcon.textContent = 'dark_mode';
}

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

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

const movieGallery = document.querySelector('.movie-gallery');

if (movieGallery && typeof window.loadInitialMovies === 'undefined') {
    const categoryTags = document.querySelectorAll('.category-tag');
    const movieCards = document.querySelectorAll('.movie-card');

    if (categoryTags.length > 0 && movieCards.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
                const selectedCategory = tag.textContent.trim();
                
                movieCards.forEach(card => {
                    const movieGenre = card.querySelector('.movie-genre')?.textContent.trim();
                    
                    if (selectedCategory === 'All') {
                        card.style.display = 'flex';
                    } else if (selectedCategory === 'Trending') {
                        const ratingElement = card.querySelector('.movie-rating');
                        if (ratingElement) {
                            const ratingText = ratingElement.textContent.trim();
                            const ratingMatch = ratingText.match(/[\d.]+/);
                            const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
                            card.style.display = rating >= 9 ? 'flex' : 'none';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (movieGenre === selectedCategory) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}