// Tickets Management
// Load and display user tickets

// Format date for display
function formatTicketDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

// Parse date from various formats
function parseTicketDate(dateString) {
    if (!dateString) return null;
    
    // Try ISO format first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }
    
    // Try "MMM DD, YYYY" format (e.g., "Oct 28, 2025")
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const match = dateString.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (match) {
        const month = months[match[1]];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        if (month !== undefined) {
            return new Date(year, month, day);
        }
    }
    
    return null;
}

// Check if ticket is upcoming (date is in the future)
function isUpcomingTicket(ticket) {
    try {
        let ticketDate = null;
        
        if (ticket.date) {
            ticketDate = parseTicketDate(ticket.date);
        }
        
        if (!ticketDate && ticket.bookingDate) {
            ticketDate = new Date(ticket.bookingDate);
        }
        
        if (!ticketDate || isNaN(ticketDate.getTime())) {
            // If we can't parse the date, consider it completed (safe default)
            return false;
        }
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        ticketDate.setHours(0, 0, 0, 0);
        
        // Consider ticket upcoming if date is today or in the future
        return ticketDate >= now;
    } catch (e) {
        console.error('Error checking if ticket is upcoming:', e);
        return false;
    }
}

// Load movie details from API if imdbId is available
async function loadMovieDetailsForTicket(ticket) {
    if (ticket.imdbId && typeof OMDB_API_KEY !== 'undefined' && OMDB_API_KEY !== 'your_api_key_here' && typeof OMDB_BASE_URL !== 'undefined') {
        try {
            const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${ticket.imdbId}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.Response === 'True') {
                return {
                    title: data.Title,
                    genre: data.Genre ? data.Genre.split(',')[0].trim() : 'Movie',
                    poster: (data.Poster && data.Poster !== 'N/A') ? data.Poster : ticket.moviePoster || 'https://via.placeholder.com/150x200?text=No+Poster'
                };
            }
        } catch (error) {
            console.error('Error loading movie details for ticket:', error);
        }
    }
    
    // Return existing ticket data or defaults
    return {
        title: ticket.movieTitle || 'Movie',
        genre: ticket.movieGenre || 'Movie',
        poster: ticket.moviePoster || 'https://via.placeholder.com/150x200?text=No+Poster'
    };
}

// Create ticket card HTML
function createTicketCard(ticket, isUpcoming) {
    return `
        <div class="ticket-card ${isUpcoming ? 'upcoming' : 'completed'}">
            <div class="ticket-poster">
                <img src="${ticket.poster}" alt="${ticket.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/150x200?text=No+Poster'">
            </div>
            <div class="ticket-info">
                <div class="ticket-header">
                    <div>
                        <h3>${ticket.title}</h3>
                        <p class="ticket-genre">${ticket.genre}</p>
                    </div>
                    <span class="status-badge ${isUpcoming ? 'upcoming' : 'completed'}">
                        ${isUpcoming ? 'Upcoming' : '✓ Completed'}
                    </span>
                </div>
                <div class="ticket-details">
                    <div class="detail-item">
                        <span class="material-symbols-outlined">calendar_today</span>
                        <div>
                            <span class="detail-label">Date</span>
                            <span class="detail-value">${ticket.date}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="material-symbols-outlined">schedule</span>
                        <div>
                            <span class="detail-label">Time</span>
                            <span class="detail-value">${ticket.time}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="material-symbols-outlined">event_seat</span>
                        <div>
                            <span class="detail-label">Seats</span>
                            <span class="detail-value">${ticket.seats}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="material-symbols-outlined">location_on</span>
                        <div>
                            <span class="detail-label">Theater</span>
                            <span class="detail-value">Cineplex Downtown</span>
                        </div>
                    </div>
                </div>
                ${isUpcoming ? '<button class="view-ticket-btn">View Ticket</button>' : ''}
            </div>
        </div>
    `;
}

// Load and display tickets
async function loadTickets() {
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    
    // Sort tickets by date (upcoming first, then by date descending)
    tickets.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const now = new Date();
        
        const aUpcoming = dateA >= now;
        const bUpcoming = dateB >= now;
        
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        
        return dateB - dateA;
    });
    
    // Get sections
    const sections = document.querySelectorAll('.tickets-section');
    const upcomingSection = sections[0];
    const historySection = sections[1];
    
    if (!upcomingSection || !historySection) {
        console.error('Ticket sections not found');
        return;
    }
    
    // Clear existing ticket cards
    const existingUpcomingCards = upcomingSection.querySelectorAll('.ticket-card');
    existingUpcomingCards.forEach(card => card.remove());
    const existingHistoryCards = historySection.querySelectorAll('.ticket-card');
    existingHistoryCards.forEach(card => card.remove());
    
    // Remove any existing containers or messages
    const existingContainers = upcomingSection.querySelectorAll('.tickets-container-inner, p');
    existingContainers.forEach(el => {
        if (el.classList.contains('tickets-container-inner') || el.tagName === 'P') {
            el.remove();
        }
    });
    const existingHistoryContainers = historySection.querySelectorAll('.tickets-container-inner, p');
    existingHistoryContainers.forEach(el => {
        if (el.classList.contains('tickets-container-inner') || el.tagName === 'P') {
            el.remove();
        }
    });
    
    if (tickets.length === 0) {
        // Show message if no tickets
        const noUpcomingMsg = document.createElement('p');
        noUpcomingMsg.style.cssText = 'text-align: center; color: #777; padding: 2rem;';
        noUpcomingMsg.textContent = 'No upcoming tickets.';
        upcomingSection.appendChild(noUpcomingMsg);
        
        const noHistoryMsg = document.createElement('p');
        noHistoryMsg.style.cssText = 'text-align: center; color: #777; padding: 2rem;';
        noHistoryMsg.textContent = 'No booking history.';
        historySection.appendChild(noHistoryMsg);
        return;
    }
    
    // Load movie details for all tickets
    const ticketsWithDetails = await Promise.all(tickets.map(async (ticket) => {
        const details = await loadMovieDetailsForTicket(ticket);
        return {
            ...ticket,
            title: details.title,
            genre: details.genre,
            poster: details.poster
        };
    }));
    
    // Separate upcoming and completed tickets
    const upcomingTickets = [];
    const completedTickets = [];
    
    ticketsWithDetails.forEach(ticket => {
        if (isUpcomingTicket(ticket)) {
            upcomingTickets.push(ticket);
        } else {
            completedTickets.push(ticket);
        }
    });
    
    // Display upcoming tickets
    if (upcomingTickets.length > 0) {
        upcomingTickets.forEach(ticket => {
            const ticketHTML = createTicketCard(ticket, true);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = ticketHTML;
            upcomingSection.appendChild(tempDiv.firstElementChild);
        });
    } else {
        const noTicketsMsg = document.createElement('p');
        noTicketsMsg.style.cssText = 'text-align: center; color: #777; padding: 2rem;';
        noTicketsMsg.textContent = 'No upcoming tickets.';
        upcomingSection.appendChild(noTicketsMsg);
    }
    
    // Display completed tickets
    if (completedTickets.length > 0) {
        completedTickets.forEach(ticket => {
            const ticketHTML = createTicketCard(ticket, false);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = ticketHTML;
            historySection.appendChild(tempDiv.firstElementChild);
        });
    } else {
        const noHistoryMsg = document.createElement('p');
        noHistoryMsg.style.cssText = 'text-align: center; color: #777; padding: 2rem;';
        noHistoryMsg.textContent = 'No booking history.';
        historySection.appendChild(noHistoryMsg);
    }
}

// Initialize tickets page
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
});

