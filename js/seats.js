const TICKET_PRICE = 12;
const ROWS = 8;
const SEATS_PER_ROW = 10;
const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const takenSeats = [
    'A4', 'A5', 'B3', 'B6', 'C4', 'C5', 'D7', 'D8', 
    'E2', 'F5', 'F6', 'G3', 'G4', 'G8'
];

let selectedSeats = [];

const seatsGrid = document.getElementById('seatsGrid');

if (seatsGrid) {
    for (let row = 0; row < ROWS; row++) {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-label';
        rowLabel.textContent = ROW_LETTERS[row];
        seatRow.appendChild(rowLabel);
        
        for (let seat = 1; seat <= SEATS_PER_ROW; seat++) {
            const seatId = `${ROW_LETTERS[row]}${seat}`;
            const seatBtn = document.createElement('button');
            seatBtn.className = 'seat';
            seatBtn.dataset.seat = seatId;
            
            if (takenSeats.includes(seatId)) {
                seatBtn.classList.add('taken');
                seatBtn.disabled = true;
            } else {
                seatBtn.classList.add('available');
                seatBtn.addEventListener('click', toggleSeat);
            }
            
            seatRow.appendChild(seatBtn);
        }
        
        seatsGrid.appendChild(seatRow);
    }
}

function toggleSeat(e) {
    const seatBtn = e.target;
    const seatId = seatBtn.dataset.seat;
    
    if (seatBtn.classList.contains('selected')) {
        seatBtn.classList.remove('selected');
        seatBtn.classList.add('available');
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
        seatBtn.classList.remove('available');
        seatBtn.classList.add('selected');
        selectedSeats.push(seatId);
    }
    
    updateSummary();
}

function updateSummary() {
    const selectedSeatsEl = document.getElementById('selectedSeats');
    const totalPriceEl = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (selectedSeatsEl && totalPriceEl && confirmBtn) {
        if (selectedSeats.length === 0) {
            selectedSeatsEl.textContent = '-';
            totalPriceEl.textContent = '$0';
            confirmBtn.disabled = true;
        } else {
            selectedSeatsEl.textContent = selectedSeats.sort().join(', ');
            totalPriceEl.textContent = `$${selectedSeats.length * TICKET_PRICE}`;
            confirmBtn.disabled = false;
        }
    }
}

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movie');
const showtime = urlParams.get('showtime');

const movieTitles = {
    'inception': 'Inception',
    'shawshank': 'The Shawshank Redemption',
    'dark-knight': 'The Dark Knight',
    'interstellar': 'Interstellar',
    'pulp-fiction': 'Pulp Fiction',
    'matrix': 'The Matrix',
    'forrest-gump': 'Forrest Gump',
    'godfather': 'The Godfather'
};

const movieTitleEl = document.getElementById('movieTitle');
if (movieTitleEl && movieId && movieTitles[movieId]) {
    movieTitleEl.textContent = movieTitles[movieId];
}

const confirmBtn = document.getElementById('confirmBtn');
if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
        if (selectedSeats.length > 0) {
            const seatsString = selectedSeats.sort().join(',');
            window.location.href = `payment.html?movie=${movieId}&showtime=${encodeURIComponent(showtime || '')}&seats=${encodeURIComponent(seatsString)}`;
        }
    });
}