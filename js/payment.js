const TICKET_PRICE = 12;
const SERVICE_FEE = 2;
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movie');
const imdbId = urlParams.get('imdbId');
const showtime = urlParams.get('showtime');
const seats = urlParams.get('seats');

const movieData = {
    'inception': {
        title: 'Inception',
        genres: 'Sci-Fi, Action',
        poster: 'https://www.johnpaulcaponigro.com/blog/wp-content/uploads/2024/03/Inception.jpg'
    },
    'shawshank': {
        title: 'The Shawshank Redemption',
        genres: 'Drama',
        poster: 'https://static.wikitide.net/allthetropeswiki/e/e7/Shawshank_Redemption.jpg'
    },
    'dark-knight': {
        title: 'The Dark Knight',
        genres: 'Action, Drama',
        poster: 'https://static.wikitide.net/allthetropeswiki/2/2e/The_Dark_Knight_Film_Poster.jpg'
    },
    'interstellar': {
        title: 'Interstellar',
        genres: 'Sci-Fi, Drama',
        poster: 'https://static.wikitide.net/allthetropeswiki/thumb/8/87/Interestelar_Portuguese_Language_Poster.jpg/450px-Interestelar_Portuguese_Language_Poster.jpg'
    },
    'pulp-fiction': {
        title: 'Pulp Fiction',
        genres: 'Drama, Crime',
        poster: 'https://static.wikitide.net/allthetropeswiki/7/70/Pulp_Fiction_sm_6352.jpg'
    },
    'matrix': {
        title: 'The Matrix',
        genres: 'Sci-Fi, Action',
        poster: 'https://static.wikitide.net/allthetropeswiki/d/d4/MATRIX.jpg'
    },
    'forrest-gump': {
        title: 'Forrest Gump',
        genres: 'Drama, Romance',
        poster: 'https://resizing.flixster.com/hqcqFfWf1syt2OrGlbW7LDvfj9Y=/fit-in/352x330/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p15829_v_v13_aa.jpg'
    },
    'godfather': {
        title: 'The Godfather',
        genres: 'Drama, Crime',
        poster: 'https://static.wikitide.net/allthetropeswiki/f/f6/The-godfather-poster-c12172921.jpg'
    }
};

async function loadMovieData() {
    const titleEl = document.getElementById('movieTitleSmall');
    const genreEl = document.getElementById('movieGenreSmall');
    const posterEl = document.getElementById('moviePosterSmall');
    
    if (!titleEl || !genreEl || !posterEl) return;
    
    if (imdbId) {
        if (typeof OMDB_API_KEY !== 'undefined' && OMDB_API_KEY !== 'your_api_key_here' && typeof OMDB_BASE_URL !== 'undefined') {
            try {
                const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.Response === 'True') {
                    titleEl.textContent = data.Title || 'Movie';
                    genreEl.textContent = (data.Genre && data.Genre !== 'N/A') ? data.Genre : 'Movie';
                    posterEl.src = (data.Poster && data.Poster !== 'N/A') ? data.Poster : 'https://via.placeholder.com/150x200?text=No+Poster';
                    posterEl.alt = data.Title || 'Movie';
                    posterEl.onerror = function() {
                        this.src = 'https://via.placeholder.com/150x200?text=No+Poster';
                    };
                    return;
                }
            } catch (error) {
                console.error('Error loading movie data:', error);
            }
        }
        
        titleEl.textContent = 'Movie';
        genreEl.textContent = 'Movie';
        posterEl.src = 'https://via.placeholder.com/150x200?text=No+Poster';
    } else if (movieId && movieData[movieId]) {
        const movie = movieData[movieId];
        titleEl.textContent = movie.title;
        genreEl.textContent = movie.genres;
        posterEl.src = movie.poster;
        posterEl.alt = movie.title;
    }
}

loadMovieData();

if (showtime) {
    document.getElementById('bookingTime').textContent = showtime;
}

if (seats) {
    const seatArray = seats.split(',');
    const seatCount = seatArray.length;
    
    document.getElementById('bookingSeats').textContent = seats;
    
    const ticketsTotal = seatCount * TICKET_PRICE;
    const grandTotal = ticketsTotal + SERVICE_FEE;
    
    document.getElementById('ticketsPrice').textContent = `$${ticketsTotal.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${grandTotal.toFixed(2)}`;
    
    const ticketsLabel = document.querySelector('.info-row:nth-child(4) .info-label');
    if (ticketsLabel) {
        ticketsLabel.textContent = `Tickets (${seatCount}x)`;
    }
}

const today = new Date();
const showDate = new Date(today);
showDate.setDate(today.getDate() + 3);
const options = { year: 'numeric', month: 'short', day: 'numeric' };
document.getElementById('bookingDate').textContent = showDate.toLocaleDateString('en-US', options);

const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

const expiryDateInput = document.getElementById('expiryDate');
expiryDateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

const cvvInput = document.getElementById('cvv');
cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

const paymentForm = document.getElementById('paymentForm');
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all payment details');
        return;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid card number');
        return;
    }
    
    if (cvv.length < 3) {
        alert('Please enter a valid CVV');
        return;
    }
    
    const movieTitle = document.getElementById('movieTitleSmall').textContent;
    const bookingSeats = document.getElementById('bookingSeats').textContent;
    const bookingTime = document.getElementById('bookingTime').textContent;
    const bookingDateText = document.getElementById('bookingDate').textContent;
    const total = document.getElementById('totalAmount').textContent;
    const movieGenre = document.getElementById('movieGenreSmall').textContent;
    const moviePoster = document.getElementById('moviePosterSmall').src;
    
    const ticket = {
        id: Date.now().toString(),
        movieTitle: movieTitle,
        movieGenre: movieGenre,
        moviePoster: moviePoster,
        date: bookingDateText,
        time: bookingTime,
        seats: bookingSeats,
        total: total,
        imdbId: imdbId || null,
        movieId: movieId || null,
        bookingDate: new Date().toISOString()
    };
    
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    existingTickets.push(ticket);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
    
    const dateTime = `${bookingDateText} - ${bookingTime}`;
    
    window.location.href = `success.html?movie=${encodeURIComponent(movieTitle)}&datetime=${encodeURIComponent(dateTime)}&seats=${encodeURIComponent(bookingSeats)}&total=${total}`;
});