# Cinemaholic

## Description

**Cinemaholic** is a frontend web application (MPA) for online cinema ticket booking. The platform allows users to:

- **Browse movies** from an extensive collection, with data fetched from the [OMDb API](https://www.omdbapi.com/).
- **View detailed movie information**, including genres, ratings, runtime, and synopsis.
- **Select showtimes and seats** for available movies.
- **Book tickets** and complete the payment process with a simulated checkout.
- **Manage user profiles** and view booking history.
- **Enjoy a responsive, modern UI** with light/dark mode and smooth animations.

---

## Project Structure

```
cinemaholic/
│
├── css/
│   └── style.css                # Main stylesheet for the application
│
├── images/
│   └── favicon.png              # Logo and other image assets
│
├── js/
│   ├── animations.js            # UI animations and effects
│   ├── auth.js                  # Authentication logic (sign in/up, guest mode)
│   ├── booking.js               # Movie details and showtime selection
│   ├── config.js                # API keys and base URLs
│   ├── movies.js                # Movie gallery, search, filtering, OMDb API integration
│   ├── payment.js               # Payment form and ticket saving logic
│   ├── profile.js               # User profile management
│   ├── script.js                # Common UI logic (theme, navigation)
│   ├── seats.js                 # Seat selection grid and logic
│   ├── success.js               # Payment success page logic
│   └── tickets.js               # My Tickets page logic (history, upcoming)
│
├── index.html                   # Home page
├── movies.html                  # Movie gallery and search
├── booking.html                 # Movie details and showtime selection
├── seats.html                   # Seat selection page
├── payment.html                 # Payment and order summary
├── success.html                 # Payment success and ticket summary
├── tickets.html                 # My Tickets (upcoming & history)
├── profile.html                 # User profile and account settings
├── auth.html                    # Sign in / Sign up / Guest access
├── main_guest.html              # Guest landing page
└── README.md                    # Project documentation (this file)
```

---

## Features

- **Multi-Page Application (MPA)**: Each major function is a separate HTML page for clarity and simplicity.
- **Movie Data from OMDb API**: Real movie data, posters, and details are fetched live.
- **User Authentication**: Sign up, sign in, and guest access (all client-side, using localStorage).
- **Profile Management**: Edit profile, upload avatar, and save changes.
- **Booking Flow**: Select showtime, seats, pay, and receive a booking summary.
- **Tickets Management**: View upcoming shows and booking history.
- **Responsive Design**: Works well on desktop and mobile devices.
- **Dark Mode**: Toggle between light and dark themes.
- **Smooth Animations**: Engaging UI with jQuery-powered effects.

---

## Setup & Usage

1. **Clone or Download** this repository.
2. **Obtain a free OMDb API key** from [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).
3. **Set your API key** in `js/config.js`:
    ```js
    const OMDB_API_KEY = 'your_api_key_here';
    const OMDB_BASE_URL = 'https://www.omdbapi.com/';
    ```
4. **Open `index.html` in your browser** to start using the app.

> **Note:** All data is stored in the browser's `localStorage` (no backend required).

---

## Main Pages

- **index.html**: Home page, featured movies, and search.
- **movies.html**: Browse/search/filter all movies.
- **booking.html**: Movie details and showtime selection.
- **seats.html**: Seat selection grid.
- **payment.html**: Payment form and order summary.
- **success.html**: Payment confirmation and ticket summary.
- **tickets.html**: View upcoming and past bookings.
- **profile.html**: Manage user profile and avatar.
- **auth.html**: Sign in, sign up, and guest access.
- **main_guest.html**: Guest mode landing page.

---

## Technologies Used

- **HTML5, CSS3** (responsive, modern design)
- **JavaScript**
- **jQuery** (for some UI animations)
- **OMDb API** (movie data)

---

## Customization

- **Change the logo**: Replace `images/favicon.png`.
- **Update styles**: Edit `css/style.css`.
- **Add more movies**: The app fetches from OMDb, but you can add static movies in `js/booking.js` and `js/payment.js` for demo purposes.

---

## License

This project is for educational/demo purposes only.  
Movie data and images are provided by [OMDb API](https://www.omdbapi.com/).

---
