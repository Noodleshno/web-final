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

if (movieGallery) {
    const categoryTags = document.querySelectorAll('.category-tag');
    const movieCards = document.querySelectorAll('.movie-card');

    const noMoviesMessage = document.createElement('div');
    noMoviesMessage.className = 'no-movies-message';
    noMoviesMessage.innerHTML = '<span class="material-symbols-outlined">movie_filter</span><p>Unfortunately, there are no movies available in this genre.</p>';
    noMoviesMessage.style.display = 'none';

    if (movieGallery.parentNode) {
        movieGallery.parentNode.insertBefore(noMoviesMessage, movieGallery.nextSibling);
    }

    if (categoryTags.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
                const selectedCategory = tag.textContent.trim();
                let visibleCount = 0;
                
                movieCards.forEach(card => {
                    const movieGenre = card.querySelector('.movie-genre').textContent.trim();
                    
                    if (selectedCategory === 'All') {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else if (selectedCategory === 'Trending') {
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

    if (movieCards.length > 0) {
        movieCards.forEach(card => {
            card.style.cursor = 'pointer';
        });
    }
    
    movieGallery.addEventListener('click', function(e) {
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