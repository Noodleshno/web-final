// script.js
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

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// ========== MOVIES.HTML SPECIFIC CODE ==========
// Проверяем наличие movie-gallery перед выполнением кода
const movieGallery = document.querySelector('.movie-gallery');

if (movieGallery) {
    // Только теперь ищем остальные элементы
    const categoryTags = document.querySelectorAll('.category-tag');
    const movieCards = document.querySelectorAll('.movie-card');

    // Create no movies message element
    const noMoviesMessage = document.createElement('div');
    noMoviesMessage.className = 'no-movies-message';
    noMoviesMessage.innerHTML = '<span class="material-symbols-outlined">movie_filter</span><p>Unfortunately, there are no movies available in this genre.</p>';
    noMoviesMessage.style.display = 'none';

    // Insert message after movie gallery
    if (movieGallery.parentNode) {
        movieGallery.parentNode.insertBefore(noMoviesMessage, movieGallery.nextSibling);
    }

    // Category Filter Functionality
    if (categoryTags.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                // Remove active class from all tags
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
                const selectedCategory = tag.textContent.trim();
                let visibleCount = 0;
                
                // Filter movies
                movieCards.forEach(card => {
                    const movieGenre = card.querySelector('.movie-genre').textContent.trim();
                    
                    if (selectedCategory === 'All') {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else if (selectedCategory === 'Trending') {
                        // Show movies with rating >= 9
                        const ratingElement = card.querySelector('.movie-rating');
                        if (ratingElement) {
                            const ratingText = ratingElement.textContent.trim();
                            const ratingMatch = ratingText.match(/[\d.]+/);
                            const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
                            
                            if (rating >= 9) {
                                card.style.display = 'flex';
                                visibleCount++;
                            } else {
                                card.style.display = 'none';
                            }
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (movieGenre === selectedCategory) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Show/hide no movies message
                if (visibleCount === 0) {
                    noMoviesMessage.style.display = 'flex';
                    movieGallery.style.display = 'none';
                } else {
                    noMoviesMessage.style.display = 'none';
                    movieGallery.style.display = 'grid';
                }
            });
        });
    }

    // Movie ID mapping based on titles
    const movieIdMap = {
        'Inception': 'inception',
        'The Shawshank Redemption': 'shawshank',
        'The Dark Knight': 'dark-knight',
        'Interstellar': 'interstellar',
        'Pulp Fiction': 'pulp-fiction',
        'The Matrix': 'matrix',
        'Forrest Gump': 'forrest-gump',
        'The Godfather': 'godfather'
    };

    // Set cursor for all cards
    if (movieCards.length > 0) {
        movieCards.forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
    
    // Use event delegation on the gallery container
    movieGallery.addEventListener('click', function(e) {
        // Find the closest movie card
        const card = e.target.closest('.movie-card');
        
        if (card) {
            const titleElement = card.querySelector('.movie-title');
            if (titleElement) {
                const movieTitle = titleElement.textContent.trim();
                const movieId = movieIdMap[movieTitle];
                
                if (movieId) {
                    window.location.href = `booking.html?movie=${movieId}`;
                }
            }
        }
    });
}