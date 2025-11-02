document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieTitle = urlParams.get('movie');
    const dateTime = urlParams.get('datetime');
    const seats = urlParams.get('seats');
    const total = urlParams.get('total');
    
    const movieTitleEl = document.getElementById('movieTitle');
    const dateTimeEl = document.getElementById('dateTime');
    const seatsEl = document.getElementById('seats');
    const totalEl = document.getElementById('total');
    
    if (movieTitle && movieTitleEl) {
        movieTitleEl.textContent = decodeURIComponent(movieTitle);
    }
    if (dateTime && dateTimeEl) {
        dateTimeEl.textContent = decodeURIComponent(dateTime);
    }
    if (seats && seatsEl) {
        seatsEl.textContent = decodeURIComponent(seats);
    }
    if (total && totalEl) {
        totalEl.textContent = total;
    }
    
    let countdown = 10;
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.href = 'movies.html';
            }
        }, 1000);
    }
});