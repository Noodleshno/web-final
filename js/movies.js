const movieDetailsCache = {};

let currentPage = 1;
let currentSearchQuery = '';
let currentGenre = '';
let isLoading = false;
let hasMoreMovies = true;
let allMovies = [];
let currentFilter = 'all';

const GENRE_MAP = {
    'Action': 'action',
    'Drama': 'drama',
    'Comedy': 'comedy',
    'Horror': 'horror',
    'Romance': 'romance',
    'Sci-Fi': 'sci-fi'
};

const DEFAULT_SEARCH_TERMS = ['action', 'drama', 'comedy', 'sci-fi', 'thriller'];

document.addEventListener('DOMContentLoaded', () => {
    const movieGallery = document.querySelector('.movie-gallery');
    const searchInput = document.querySelector('.search-input');
    const categoryTags = document.querySelectorAll('.category-tag');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!movieGallery) return;
    
    loadInitialMovies();
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    searchMovies(query);
                } else if (query.length === 0) {
                    const categoryTags = document.querySelectorAll('.category-tag');
                    categoryTags.forEach(tag => tag.classList.remove('active'));
                    if (categoryTags.length > 0) {
                        categoryTags[0].classList.add('active');
                    }
                    loadInitialMovies();
                }
            }, 500);
        });
        
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
    
    if (categoryTags.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const category = tag.textContent.trim();
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
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
        
        const uniqueMovies = removeDuplicates(combinedMovies);
        allMovies = uniqueMovies.slice(0, 15);
        
        await loadMovieDetails(allMovies);
        
        hasMoreMovies = combinedMovies.length >= 15;
        
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading initial movies:', error);
        showErrorMessage('Failed to load movies. Please check your API key.');
    } finally {
        isLoading = false;
    }
}

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
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        
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
        
        const uniqueMovies = removeDuplicates(combinedMovies);
        
        const moviesToLoad = uniqueMovies.slice(0, 20);
        await loadMovieDetails(moviesToLoad);
        
        const trendingMovies = moviesToLoad.filter(movie => {
            const detail = movieDetailsCache[movie.imdbID];
            if (detail && detail.Response === 'True') {
                const rating = parseFloat(detail.imdbRating);
                const year = parseInt(detail.Year);
                return (rating >= 7.5) || (year >= currentYear - 2);
            }
            return false;
        });
        
        trendingMovies.sort((a, b) => {
            const ratingA = parseFloat(movieDetailsCache[a.imdbID]?.imdbRating || 0);
            const ratingB = parseFloat(movieDetailsCache[b.imdbID]?.imdbRating || 0);
            return ratingB - ratingA;
        });
        
        allMovies = trendingMovies.slice(0, 15);
        
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
        const searchTerm = GENRE_MAP[genre] || genre.toLowerCase();
        const result = await searchMoviesAPI(searchTerm, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            allMovies = result.Search.slice(0, 15);
            hasMoreMovies = parseInt(result.totalResults) > allMovies.length;
            
            await loadMovieDetails(allMovies);
            
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

async function loadMoreTrendingMovies() {
    if (isLoading || !hasMoreMovies) return;
    
    isLoading = true;
    currentPage++;
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }
    
    hasMoreMovies = false;
    updateLoadMoreButton();
    isLoading = false;
}

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
            
            await loadMovieDetails(newMovies);
            
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

async function searchMovies(query) {
    if (isLoading) return;
    
    currentSearchQuery = query;
    currentPage = 1;
    currentGenre = '';
    currentFilter = 'search';
    allMovies = [];
    hasMoreMovies = true;
    
    const categoryTags = document.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => tag.classList.remove('active'));
    if (categoryTags.length > 0) {
        categoryTags[0].classList.add('active');
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
        const searchTerm = DEFAULT_SEARCH_TERMS[(currentPage - 1) % DEFAULT_SEARCH_TERMS.length];
        const result = await searchMoviesAPI(searchTerm, currentPage);
        
        if (result && result.Response === 'True' && result.Search) {
            const newMovies = result.Search.filter(movie => 
                !allMovies.some(existing => existing.imdbID === movie.imdbID)
            );
            
            allMovies.push(...newMovies);
            
            await loadMovieDetails(newMovies);
            
            hasMoreMovies = newMovies.length > 0 && allMovies.length < 50;
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
            
            await loadMovieDetails(newMovies);
            
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

async function searchMoviesAPI(searchQuery, page = 1) {
    if (OMDB_API_KEY === 'your_api_key_here') {
        console.warn('OMDb API key not set. Please get a free API key from https://www.omdbapi.com/apikey.aspx');
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

async function getMovieDetails(imdbID) {
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
            movieDetailsCache[imdbID] = data;
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function loadMovieDetails(movies) {
    const movieGallery = document.querySelector('.movie-gallery');
    if (!movieGallery) return;
    
    const loadingMsg = movieGallery.querySelector('.loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
    
    const batchSize = 5;
    for (let i = 0; i < movies.length; i += batchSize) {
        const batch = movies.slice(i, i + batchSize);
        const detailPromises = batch.map(movie => getMovieDetails(movie.imdbID));
        const details = await Promise.all(detailPromises);
        
        batch.forEach((movie, index) => {
            const detail = details[index];
            if (detail && detail.Response === 'True') {
                createMovieCard(detail, movieGallery);
            } else {
                createMovieCardFromSearch(movie, movieGallery);
            }
        });
        
        if (i + batchSize < movies.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

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

function parseGenres(genreString) {
    if (!genreString || genreString === 'N/A') return ['Movie'];
    return genreString.split(',').map(g => g.trim());
}

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

window.getMovieDetailsByImdbId = getMovieDetails;

