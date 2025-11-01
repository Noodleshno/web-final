// payment.js

const TICKET_PRICE = 12;
const SERVICE_FEE = 2;

// Get booking data from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movie');
const showtime = urlParams.get('showtime');
const seats = urlParams.get('seats');

// Movie data
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

// Load booking information
if (movieId && movieData[movieId]) {
    const movie = movieData[movieId];
    
    // Update movie info
    document.getElementById('movieTitleSmall').textContent = movie.title;
    document.getElementById('movieGenreSmall').textContent = movie.genres;
    document.getElementById('moviePosterSmall').src = movie.poster;
    document.getElementById('moviePosterSmall').alt = movie.title;
}

// Update showtime
if (showtime) {
    document.getElementById('bookingTime').textContent = showtime;
}

// Update seats and calculate price
if (seats) {
    const seatArray = seats.split(',');
    const seatCount = seatArray.length;
    
    document.getElementById('bookingSeats').textContent = seats;
    
    const ticketsTotal = seatCount * TICKET_PRICE;
    const grandTotal = ticketsTotal + SERVICE_FEE;
    
    document.getElementById('ticketsPrice').textContent = `$${ticketsTotal.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${grandTotal.toFixed(2)}`;
    
    // Update ticket count
    const ticketsLabel = document.querySelector('.info-row:nth-child(4) .info-label');
    if (ticketsLabel) {
        ticketsLabel.textContent = `Tickets (${seatCount}x)`;
    }
}

// Set current date
const today = new Date();
const options = { year: 'numeric', month: 'short', day: 'numeric' };
document.getElementById('bookingDate').textContent = today.toLocaleDateString('en-US', options);

// Card number formatting
const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Expiry date formatting
const expiryDateInput = document.getElementById('expiryDate');
expiryDateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// CVV - only numbers
const cvvInput = document.getElementById('cvv');
cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Form submission - переход на success.html
const paymentForm = document.getElementById('paymentForm');
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    // Basic validation
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
    
    // Success message
    const movieTitle = document.getElementById('movieTitleSmall').textContent;
    const bookingSeats = document.getElementById('bookingSeats').textContent;
    const bookingTime = document.getElementById('bookingTime').textContent;
    const bookingDateText = document.getElementById('bookingDate').textContent;
    const total = document.getElementById('totalAmount').textContent;
    
    // Combine date and time
    const dateTime = `${bookingDateText} - ${bookingTime}`;
    
    // Redirect to success page with booking details
    window.location.href = `success.html?movie=${encodeURIComponent(movieTitle)}&datetime=${encodeURIComponent(dateTime)}&seats=${encodeURIComponent(bookingSeats)}&total=${total}`;
});