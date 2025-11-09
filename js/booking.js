const movieData = {
    'inception': {
        title: 'Inception',
        year: '2010',
        rating: '8.8',
        duration: '2h 28m',
        genres: ['Sci-Fi', 'Action'],
        poster: 'https://www.johnpaulcaponigro.com/blog/wp-content/uploads/2024/03/Inception.jpg',
        synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
        imdbID: 'tt1375666'
    },
    'shawshank': {
        title: 'The Shawshank Redemption',
        year: '1994',
        rating: '9.3',
        duration: '2h 22m',
        genres: ['Drama'],
        poster: 'https://static.wikitide.net/allthetropeswiki/e/e7/Shawshank_Redemption.jpg',
        synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        imdbID: 'tt0111161'
    },
    'dark-knight': {
        title: 'The Dark Knight',
        year: '2008',
        rating: '9.0',
        duration: '2h 32m',
        genres: ['Action', 'Drama'],
        poster: 'https://static.wikitide.net/allthetropeswiki/2/2e/The_Dark_Knight_Film_Poster.jpg',
        synopsis: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests to fight injustice.',
        imdbID: 'tt0468569'
    },
    'interstellar': {
        title: 'Interstellar',
        year: '2014',
        rating: '8.6',
        duration: '2h 49m',
        genres: ['Sci-Fi', 'Drama'],
        poster: 'https://static.wikitide.net/allthetropeswiki/thumb/8/87/Interestelar_Portuguese_Language_Poster.jpg/450px-Interestelar_Portuguese_Language_Poster.jpg',
        synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        imdbID: 'tt0816692'
    },
    'pulp-fiction': {
        title: 'Pulp Fiction',
        year: '1994',
        rating: '8.9',
        duration: '2h 34m',
        genres: ['Drama', 'Crime'],
        poster: 'https://static.wikitide.net/allthetropeswiki/7/70/Pulp_Fiction_sm_6352.jpg',
        synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        imdbID: 'tt0110912'
    },
    'matrix': {
        title: 'The Matrix',
        year: '1999',
        rating: '8.7',
        duration: '2h 16m',
        genres: ['Sci-Fi', 'Action'],
        poster: 'https://static.wikitide.net/allthetropeswiki/d/d4/MATRIX.jpg',
        synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
        imdbID: 'tt0133093'
    },
    'forrest-gump': {
        title: 'Forrest Gump',
        year: '1994',
        rating: '8.8',
        duration: '2h 22m',
        genres: ['Drama', 'Romance'],
        poster: 'https://resizing.flixster.com/hqcqFfWf1syt2OrGlbW7LDvfj9Y=/fit-in/352x330/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p15829_v_v13_aa.jpg',
        synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
        imdbID: 'tt0109830'
    },
    'godfather': {
        title: 'The Godfather',
        year: '1972',
        rating: '9.2',
        duration: '2h 55m',
        genres: ['Drama', 'Crime'],
        poster: 'https://static.wikitide.net/allthetropeswiki/f/f6/The-godfather-poster-c12172921.jpg',
        synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        imdbID: 'tt0068646'
    }
};

async function getMovieDetailsFromAPI(imdbID) {
    if (OMDB_API_KEY === 'your_api_key_here') {
        return null;
    }
    
    try {
    const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&type=movie&plot=full`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

function formatRuntime(runtime) {
    if (!runtime || runtime === 'N/A') return 'N/A';
    const minutes = parseInt(runtime);
    if (isNaN(minutes)) return runtime;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
}

function parseGenres(genreString) {
    if (!genreString || genreString === 'N/A') return ['Movie'];
    return genreString.split(',').map(g => g.trim());
}

const urlParams = new URLSearchParams(window.location.search);
const imdbId = urlParams.get('imdbId');
const movieId = urlParams.get('movie');

let currentMovieId = imdbId || movieId;
let currentImdbId = imdbId;

async function loadMovieData() {
    const posterEl = document.getElementById('moviePoster');
    const titleEl = document.getElementById('movieTitle');
    const ratingEl = document.getElementById('movieRating');
    const durationEl = document.getElementById('movieDuration');
    const yearEl = document.getElementById('movieReleaseYear');
    const movieYearEl = document.getElementById('movieYear');
    const synopsisEl = document.getElementById('movieSynopsis');
    const genreContainer = document.getElementById('genreTags');
    
    let movie = null;
    
    if (imdbId) {
        movie = await getMovieDetailsFromAPI(imdbId);
        if (movie && movie.Response === 'True') {
            currentImdbId = imdbId;
        }
    }
    
    if (!movie && movieId && movieData[movieId]) {
        movie = movieData[movieId];
        currentImdbId = movie.imdbID || movieId;
    }
    
    if (movie) {
        if (movie.Response === 'True') {
            if (posterEl) {
                posterEl.src = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Poster';
                posterEl.alt = movie.Title;
                posterEl.onerror = function() {
                    this.src = 'https://via.placeholder.com/400x600?text=No+Poster';
                };
            }
            if (titleEl) titleEl.textContent = movie.Title;
            if (ratingEl) ratingEl.textContent = (movie.imdbRating && movie.imdbRating !== 'N/A') ? movie.imdbRating + ' / 10.0' : 'N/A';
            if (durationEl) durationEl.textContent = formatRuntime(movie.Runtime);
            if (yearEl) yearEl.textContent = movie.Year;
            if (movieYearEl) movieYearEl.textContent = movie.Year;
            if (synopsisEl) synopsisEl.textContent = (movie.Plot && movie.Plot !== 'N/A') ? movie.Plot : 'No synopsis available.';
            
            if (genreContainer) {
                genreContainer.innerHTML = '';
                const genres = parseGenres(movie.Genre);
                genres.forEach(genre => {
                    const badge = document.createElement('span');
                    badge.className = 'genre-badge';
                    badge.textContent = genre;
                    genreContainer.appendChild(badge);
                });
            }
            
            document.title = `${movie.Title} - Book Tickets - Cinemaholic`;
        } else {
            if (posterEl) {
                posterEl.src = movie.poster;
                posterEl.alt = movie.title;
            }
            if (titleEl) titleEl.textContent = movie.title;
            if (ratingEl) ratingEl.textContent = movie.rating + ' / 10.0';
            if (durationEl) durationEl.textContent = movie.duration;
            if (yearEl) yearEl.textContent = movie.year;
            if (movieYearEl) movieYearEl.textContent = movie.year;
            if (synopsisEl) synopsisEl.textContent = movie.synopsis;
            
            if (genreContainer) {
                genreContainer.innerHTML = '';
                movie.genres.forEach(genre => {
                    const badge = document.createElement('span');
                    badge.className = 'genre-badge';
                    badge.textContent = genre;
                    genreContainer.appendChild(badge);
                });
            }
            
            document.title = `${movie.title} - Book Tickets - Cinemaholic`;
        }
    } else {
        if (titleEl) titleEl.textContent = 'Movie not found';
        if (synopsisEl) synopsisEl.textContent = 'Unable to load movie details. Please try again later.';
    }
}

loadMovieData();

const showtimeBtns = document.querySelectorAll('.showtime-btn');
let selectedShowtime = null;

if (showtimeBtns.length > 0) {
    showtimeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showtimeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedShowtime = btn.textContent;
        });
    });
}

const bookBtn = document.querySelector('.book-ticket-btn');
if (bookBtn) {
    bookBtn.addEventListener('click', () => {
        if (selectedShowtime) {
            const movieIdentifier = currentImdbId || currentMovieId;
            if (imdbId) {
                window.location.href = `seats.html?imdbId=${currentImdbId}&showtime=${encodeURIComponent(selectedShowtime)}`;
            } else {
                window.location.href = `seats.html?movie=${currentMovieId}&showtime=${encodeURIComponent(selectedShowtime)}`;
            }
        } else {
            alert('Please select a showtime first!');
        }
    });
}