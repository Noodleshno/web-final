// OMDb API Integration
// API key is loaded from config.js

// Cache for movie details to avoid multiple API calls
const movieDetailsCache = {};

// Current state
let currentPage = 1;
let currentSearchQuery = '';
let currentGenre = '';
let isLoading = false;
let hasMoreMovies = true;
let allMovies = [];
let currentFilter = 'all'; // 'all', 'trending', 'genre'

// Genre mapping for OMDb API
const GENRE_MAP = {
    'Action': 'action',
    'Drama': 'drama',
    'Comedy': 'comedy',
    'Horror': 'horror',
    'Romance': 'romance',
    'Sci-Fi': 'sci-fi'
};

// Get default popular movies for initial load
const DEFAULT_SEARCH_TERMS = ['action', 'drama', 'comedy', 'sci-fi', 'thriller'];

// Initialize movies page
document.addEventListener('DOMContentLoaded', () => {
    const movieGallery = document.querySelector('.movie-gallery');
    const searchInput = document.querySelector('.search-input');
    const categoryTags = document.querySelectorAll('.category-tag');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!movieGallery) return;
    
    // Load initial movies
    loadInitialMovies();
    
    // Search functionality
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    searchMovies(query);
                } else if (query.length === 0) {
                    // Reset to "All" when search is cleared
                    const categoryTags = document.querySelectorAll('.category-tag');
                    categoryTags.forEach(tag => tag.classList.remove('active'));
                    if (categoryTags.length > 0) {
                        categoryTags[0].classList.add('active'); // Activate "All" tag
                    }
                    loadInitialMovies();
                }
            }, 500);
        });
        
        // Handle Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    searchMovies(query);
                }
            }
        });
    }
    
    // Category filter
    if (categoryTags.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const category = tag.textContent.trim();
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
                // Clear search
                if (searchInput) {
                    searchInput.value = '';
                }
                
                if (category === 'All') {
                    currentFilter = 'all';
                    currentGenre = '';
                    loadInitialMovies();
                } else if (category === 'Trending') {
                    currentFilter = 'trending';
                    currentGenre = '';
                    loadTrendingMovies();
                } else {
                    currentFilter = 'genre';
                    currentGenre = category;
                    loadMoviesByGenre(category);
                }
            });
        });
    }
    
    // Load More button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (currentSearchQuery) {
                loadMoreSearchResults();
            } else if (currentFilter === 'trending') {
                loadMoreTrendingMovies();
            } else if (currentFilter === 'genre') {
                loadMoreMoviesByGenre();
            } else {
                loadMoreMovies();
            }
        });
    }
    
    // Handle movie card clicks
    movieGallery.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if (card) {
            const imdbId = card.dataset.imdbId;
            if (imdbId) {
                window.location.href = `booking.html?imdbId=${imdbId}`;
            }
        }
    });
});

// Load initial movies (mix of popular movies)
async function loadInitialMovies() {
    currentPage = 1;
    currentSearchQuery = '';
    currentGenre = '';
    currentFilter = 'all';
    allMovies = [];
    hasMoreMovies = true;
    
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    movieGallery.innerHTML = '<div class="loading-message">Loading movies...</div>';
    isLoading = true;
    
    // Try to load popular movies
    // Using multiple search terms to get variety
    const searchPromises = DEFAULT_SEARCH_TERMS.slice(0, 3).map(term => 
        searchMoviesAPI(term, 1)
    );
    
    try {
        const results = await Promise.all(searchPromises);
        const combinedMovies = [];
        
        results.forEach(result => {
            if (result && result.Search) {
                combinedMovies.push(...result.Search);
            }
        });
        
        // Remove duplicates and get first 15 unique movies
        const uniqueMovies = removeDuplicates(combinedMovies);
        allMovies = uniqueMovies.slice(0, 15);
        
        // Load details for each movie
        await loadMovieDetails(allMovies);
        
        // Check if we can load more
        hasMoreMovies = combinedMovies.length >= 15;
        
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading initial movies:', error);
        showErrorMessage('Failed to load movies. Please check your API key.');
    } finally {
        isLoading = false;
    }
}

// Load trending movies (new and popular - high rated and recent)
async function loadTrendingMovies() {
    currentPage = 1;
    currentSearchQuery = '';
    currentGenre = '';
    currentFilter = 'trending';
    allMovies = [];
    hasMoreMovies = true;
    
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    movieGallery.innerHTML = '<div class="loading-message">Loading trending movies...</div>';
    isLoading = true;
    
    try {
        // Search for recent popular movies (from 2020-2024)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        
        // Search for popular movies from recent years
        const searchPromises = years.map(year => 
            searchMoviesAPI(year.toString(), 1)
        );
        
        const results = await Promise.all(searchPromises);
        const combinedMovies = [];
        
        results.forEach(result => {
            if (result && result.Search) {
                combinedMovies.push(...result.Search);
            }
        });
        
        // Remove duplicates
        const uniqueMovies = removeDuplicates(combinedMovies);
        
        // Get first 15 movies and load their details to filter by rating
        const moviesToLoad = uniqueMovies.slice(0, 20);
        await loadMovieDetails(moviesToLoad);
        
        // Filter movies with rating >= 7.5 or from last 2 years
        const trendingMovies = moviesToLoad.filter(movie => {
            const detail = movieDetailsCache[movie.imdbID];
            if (detail && detail.Response === 'True') {
                const rating = parseFloat(detail.imdbRating);
                const year = parseInt(detail.Year);
                return (rating >= 7.5) || (year >= currentYear - 2);
            }
            return false;
        });
        
        // Sort by rating (descending) and take top 15
        trendingMovies.sort((a, b) => {
            const ratingA = parseFloat(movieDetailsCache[a.imdbID]?.imdbRating || 0);
            const ratingB = parseFloat(movieDetailsCache[b.imdbID]?.imdbRating || 0);
            return ratingB - ratingA;
        });
        
        allMovies = trendingMovies.slice(0, 15);
        
        // Clear gallery and show only trending movies
        movieGallery.innerHTML = '';
        allMovies.forEach(movie => {
            const detail = movieDetailsCache[movie.imdbID];
            if (detail) {
                createMovieCard(detail, movieGallery);
            } else {
                createMovieCardFromSearch(movie, movieGallery);
            }
        });
        
        hasMoreMovies = trendingMovies.length >= 15;
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading trending movies:', error);
        showErrorMessage('Failed to load trending movies. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Load movies by genre
async function loadMoviesByGenre(genre) {
    currentPage = 1;
    currentSearchQuery = '';
    currentGenre = genre;
    currentFilter = 'genre';
    allMovies = [];
    hasMoreMovies = true;
    
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    movieGallery.innerHTML = '<div class="loading-message">Loading movies...</div>';
    isLoading = true;
    
    try {
        // Map genre to search term
        const searchTerm = GENRE_MAP[genre] || genre.toLowerCase();
        const result = await searchMoviesAPI(searchTerm, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            allMovies = result.Search.slice(0, 15);
            hasMoreMovies = parseInt(result.totalResults) > allMovies.length;
            
            // Load details for each movie
            await loadMovieDetails(allMovies);
            
            // Filter by genre in the details (some movies might not match)
            const genreFiltered = [];
            for (const movie of allMovies) {
                const detail = movieDetailsCache[movie.imdbID];
                if (detail && detail.Response === 'True') {
                    const genres = parseGenres(detail.Genre);
                    if (genres.some(g => g.toLowerCase() === genre.toLowerCase())) {
                        genreFiltered.push(movie);
                    }
                } else {
                    genreFiltered.push(movie);
                }
            }
            
            allMovies = genreFiltered;
            
            updateLoadMoreButton();
        } else {
            movieGallery.innerHTML = '<div class="no-movies-message"><span class="material-symbols-outlined">movie_filter</span><p>No movies found in this genre.</p></div>';
            hasMoreMovies = false;
            updateLoadMoreButton();
        }
    } catch (error) {
        console.error('Error loading movies by genre:', error);
        showErrorMessage('Failed to load movies. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Load more trending movies
async function loadMoreTrendingMovies() {
    if (isLoading || !hasMoreMovies) return;
    
    isLoading = true;
    currentPage++;
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }
    
    // For trending, we'll load more from recent years
    // This is a simplified approach - in a real app you might use a different strategy
    hasMoreMovies = false; // Disable after first load for trending
    updateLoadMoreButton();
    isLoading = false;
}

// Load more movies by genre
async function loadMoreMoviesByGenre() {
    if (isLoading || !hasMoreMovies || !currentGenre) return;
    
    isLoading = true;
    currentPage++;
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }
    
    try {
        const searchTerm = GENRE_MAP[currentGenre] || currentGenre.toLowerCase();
        const result = await searchMoviesAPI(searchTerm, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            const newMovies = result.Search;
            allMovies.push(...newMovies);
            
            // Load details for new movies
            await loadMovieDetails(newMovies);
            
            // Filter by genre
            const genreFiltered = [];
            for (const movie of newMovies) {
                const detail = movieDetailsCache[movie.imdbID];
                if (detail && detail.Response === 'True') {
                    const genres = parseGenres(detail.Genre);
                    if (genres.some(g => g.toLowerCase() === currentGenre.toLowerCase())) {
                        genreFiltered.push(movie);
                    }
                } else {
                    genreFiltered.push(movie);
                }
            }
            
            // Check if we have more movies
            const totalResults = parseInt(result.totalResults);
            hasMoreMovies = allMovies.length < totalResults;
        } else {
            hasMoreMovies = false;
        }
    } catch (error) {
        console.error('Error loading more movies by genre:', error);
    } finally {
        isLoading = false;
        updateLoadMoreButton();
    }
}

// Search movies
async function searchMovies(query) {
    if (isLoading) return;
    
    currentSearchQuery = query;
    currentPage = 1;
    currentGenre = '';
    currentFilter = 'search';
    allMovies = [];
    hasMoreMovies = true;
    
    // Reset category tags
    const categoryTags = document.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => tag.classList.remove('active'));
    if (categoryTags.length > 0) {
        categoryTags[0].classList.add('active'); // Activate "All" tag
    }
    
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    movieGallery.innerHTML = '<div class="loading-message">Loading movies...</div>';
    isLoading = true;
    
    try {
        const result = await searchMoviesAPI(query, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            allMovies = result.Search;
            hasMoreMovies = parseInt(result.totalResults) > allMovies.length;
            
            // Load details for each movie
            await loadMovieDetails(allMovies);
            
            updateLoadMoreButton();
        } else {
            movieGallery.innerHTML = '<div class="no-movies-message"><span class="material-symbols-outlined">movie_filter</span><p>No movies found. Try a different search.</p></div>';
            hasMoreMovies = false;
            updateLoadMoreButton();
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        movieGallery.innerHTML = '<div class="no-movies-message"><span class="material-symbols-outlined">error</span><p>Error searching movies. Please try again.</p></div>';
    } finally {
        isLoading = false;
    }
}

// Load more movies (for initial load)
async function loadMoreMovies() {
    if (isLoading || !hasMoreMovies) return;
    
    isLoading = true;
    currentPage++;
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }
    
    try {
        // Try different search terms to get more movies
        const searchTerm = DEFAULT_SEARCH_TERMS[(currentPage - 1) % DEFAULT_SEARCH_TERMS.length];
        const result = await searchMoviesAPI(searchTerm, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            const newMovies = result.Search.filter(movie => 
                !allMovies.some(existing => existing.imdbID === movie.imdbID)
            );
            
            allMovies.push(...newMovies);
            
            // Load details for new movies
            await loadMovieDetails(newMovies);
            
            // Check if we have more movies
            hasMoreMovies = newMovies.length > 0 && allMovies.length < 50; // Limit to 50 movies
        } else {
            hasMoreMovies = false;
        }
    } catch (error) {
        console.error('Error loading more movies:', error);
    } finally {
        isLoading = false;
        updateLoadMoreButton();
    }
}

// Load more search results
async function loadMoreSearchResults() {
    if (isLoading || !hasMoreMovies || !currentSearchQuery) return;
    
    isLoading = true;
    currentPage++;
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }
    
    try {
        const result = await searchMoviesAPI(currentSearchQuery, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            const newMovies = result.Search;
            allMovies.push(...newMovies);
            
            // Load details for new movies
            await loadMovieDetails(newMovies);
            
            // Check if we have more movies
            const totalResults = parseInt(result.totalResults);
            hasMoreMovies = allMovies.length < totalResults;
        } else {
            hasMoreMovies = false;
        }
    } catch (error) {
        console.error('Error loading more search results:', error);
    } finally {
        isLoading = false;
        updateLoadMoreButton();
    }
}

// Search movies API call
async function searchMoviesAPI(searchQuery, page = 1) {
    // For demo, if no API key is set, use a fallback approach
    if (OMDB_API_KEY === 'your_api_key_here') {
        console.warn('OMDb API key not set. Please get a free API key from https://www.omdbapi.com/apikey.aspx');
        // Return empty result or use mock data
        return { Response: 'False', Error: 'API key required' };
    }
    
    try {
        const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery)}&type=movie&page=${page}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Get movie details by imdbID
async function getMovieDetails(imdbID) {
    // Check cache first
    if (movieDetailsCache[imdbID]) {
        return movieDetailsCache[imdbID];
    }
    
    if (OMDB_API_KEY === 'your_api_key_here') {
        return null;
    }
    
    try {
        const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Cache the result
            movieDetailsCache[imdbID] = data;
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Load details for multiple movies
async function loadMovieDetails(movies) {
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    // Remove loading message if exists
    const loadingMsg = movieGallery.querySelector('.loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
    
    // Load details for each movie (in batches to avoid too many requests)
    const batchSize = 5;
    for (let i = 0; i < movies.length; i += batchSize) {
        const batch = movies.slice(i, i + batchSize);
        const detailPromises = batch.map(movie => getMovieDetails(movie.imdbID));
        const details = await Promise.all(detailPromises);
        
        // Create movie cards
        batch.forEach((movie, index) => {
            const detail = details[index];
            if (detail && detail.Response === 'True') {
                createMovieCard(detail, movieGallery);
            } else {
                // Fallback to basic info if details not available
                createMovieCardFromSearch(movie, movieGallery);
            }
        });
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < movies.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

// Create movie card from detailed movie data
function createMovieCard(movie, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.imdbId = movie.imdbID;
    card.style.cursor = 'pointer';
    
    const poster = movie.Poster && movie.Poster !== 'N/A' 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    const rating = movie.imdbRating && movie.imdbRating !== 'N/A' 
        ? movie.imdbRating 
        : 'N/A';
    
    const runtime = movie.Runtime && movie.Runtime !== 'N/A' 
        ? movie.Runtime 
        : 'N/A';
    
    const genre = movie.Genre && movie.Genre !== 'N/A' 
        ? movie.Genre.split(',')[0].trim() 
        : 'Movie';
    
    const plot = movie.Plot && movie.Plot !== 'N/A' 
        ? movie.Plot.substring(0, 150) + '...' 
        : 'No description available.';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <span class="movie-genre">${genre}</span>
            <div class="movie-meta">
                <div class="movie-rating">
                    <span class="material-symbols-outlined">star</span>
                    ${rating}
                </div>
                <span class="movie-duration">${runtime}</span>
            </div>
        </div>
        <div class="movie-overlay">
            <h3 class="overlay-title">${movie.Title}</h3>
            <p class="overlay-description">${plot}</p>
            <div class="overlay-meta">
                <span>${movie.Year}</span>
                <span>${runtime}</span>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Create movie card from search result (basic info)
function createMovieCardFromSearch(movie, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.imdbId = movie.imdbID;
    card.style.cursor = 'pointer';
    
    const poster = movie.Poster && movie.Poster !== 'N/A' 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <span class="movie-genre">Movie</span>
            <div class="movie-meta">
                <div class="movie-rating">
                    <span class="material-symbols-outlined">star</span>
                    N/A
                </div>
                <span class="movie-duration">${movie.Year}</span>
            </div>
        </div>
        <div class="movie-overlay">
            <h3 class="overlay-title">${movie.Title}</h3>
            <p class="overlay-description">No description available.</p>
            <div class="overlay-meta">
                <span>${movie.Year}</span>
                <span>Movie</span>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Parse genres from comma-separated string
function parseGenres(genreString) {
    if (!genreString || genreString === 'N/A') return ['Movie'];
    return genreString.split(',').map(g => g.trim());
}

// Remove duplicate movies
function removeDuplicates(movies) {
    const seen = new Set();
    return movies.filter(movie => {
        if (seen.has(movie.imdbID)) {
            return false;
        }
        seen.add(movie.imdbID);
        return true;
    });
}

// Update Load More button
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (hasMoreMovies && !isLoading) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.disabled = false;
        } else if (isLoading) {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Show error message
function showErrorMessage(message) {
    const movieGallery = document.querySelector('.movie-gallery');
    if (movieGallery) {
        movieGallery.innerHTML = `
            <div class="no-movies-message">
                <span class="material-symbols-outlined">error</span>
                <p>${message}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                    Get a free API key from <a href="https://www.omdbapi.com/apikey.aspx" target="_blank">OMDb API</a>
                </p>
            </div>
        `;
    }
}

// Export function to get movie details (for use in booking.js)
window.getMovieDetailsByImdbId = getMovieDetails;

