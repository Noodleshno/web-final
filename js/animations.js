// jQuery Animations for Cinemaholic Website
// Simplified and optimized - only essential animations

$(document).ready(function() {
    
    // ========== MAIN IMAGE ANIMATION ==========
    // Beautiful fade-in and entrance animation for main-image
    
    if ($('.main-img').length) {
        const $mainImg = $('.main-img');
        const $mainImage = $('.main-image');
        
        // Initial state - hidden
        $mainImg.css({
            opacity: 0,
            transform: 'translateY(30px) scale(0.9)'
        });
        
        // Fade in and slide up on load with smooth easing
        setTimeout(function() {
            $mainImg.css({
                transition: 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: 1,
                transform: 'translateY(0) scale(1)'
            });
        }, 400);
        
        // Hover animation similar to movie-card
        $mainImage.hover(
            function() {
                // hover in
                $(this).css({
                    "box-shadow": "0 0 30px rgba(229, 57, 53, 0.5)",
                    "transform": "scale(1.05)"
                });
                $(this).find("img").css({
                    "transform": "scale(1.1)",
                    "animation-play-state": "paused"
                });
            },
            function() {
                // hover out
                $(this).css({
                    "box-shadow": "0 0 0 rgba(229, 57, 53, 0)",
                    "transform": "scale(1)"
                });
                $(this).find("img").css({
                    "transform": "scale(1)",
                    "animation-play-state": "running"
                });
            }
        );
        
        // Subtle parallax effect on scroll (disabled on mobile and during hover)
        if ($(window).width() > 768) {
            let ticking = false;
            let isHovered = false;
            
            $mainImage.on('mouseenter', function() {
                isHovered = true;
            }).on('mouseleave', function() {
                isHovered = false;
            });
            
            $(window).on('scroll', function() {
                if (!ticking && !isHovered) {
                    window.requestAnimationFrame(function() {
                        const scrolled = $(window).scrollTop();
                        const parallaxValue = scrolled * 0.15;
                        
                        if (scrolled < 500) {
                            $mainImg.css({
                                transform: 'translateY(' + parallaxValue + 'px)',
                                transition: 'transform 0.1s ease-out'
                            });
                        }
                        
                        ticking = false;
                    });
                    
                    ticking = true;
                }
            });
        }
    }
    
    // ========== LOGO CLICK ANIMATION ==========
    // Fullscreen overlay animation when logo is clicked
    
    const $logoIcon = $('.logo-icon');
    const $logo = $('.logo');
    let overlayExists = false;
    
    function createLogoOverlay() {
        if (overlayExists) return;
        
        const $overlay = $('<div class="logo-overlay"></div>');
        const $overlayContent = $('<div class="logo-overlay-content"></div>');
        const $overlayLogo = $('<img class="logo-overlay-logo" src="images/favicon.png" alt="Logo">');
        const $overlayText = $('<div class="logo-overlay-text">Cinemaholic</div>');
        const $overlaySubtitle = $('<div class="logo-overlay-subtitle">Your Cinema Experience</div>');
        
        $overlayContent.append($overlayLogo);
        $overlayContent.append($overlayText);
        $overlayContent.append($overlaySubtitle);
        $overlay.append($overlayContent);
        $('body').append($overlay);
        
        overlayExists = true;
        
        // Close overlay on click
        $overlay.on('click', function(e) {
            if ($(e.target).hasClass('logo-overlay')) {
                closeLogoOverlay($overlay);
            }
        });
        
        // Close overlay on ESC key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $overlay.hasClass('active')) {
                closeLogoOverlay($overlay);
            }
        });
        
        return $overlay;
    }
    
    function closeLogoOverlay($overlay) {
        $overlay.removeClass('active');
        setTimeout(function() {
            $overlay.remove();
            overlayExists = false;
        }, 400);
    }
    
    $logoIcon.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $overlay = createLogoOverlay();
        
        // Trigger animation
        setTimeout(function() {
            $overlay.addClass('active');
        }, 10);
        
        // Auto close after 3 seconds
        setTimeout(function() {
            if ($overlay.hasClass('active')) {
                closeLogoOverlay($overlay);
            }
        }, 3000);
    });
    
    // Also make the whole logo clickable
    $logo.on('click', function(e) {
        if ($(e.target).hasClass('logo-icon') || $(e.target).closest('.logo-icon').length) {
            return; // Already handled by logo-icon click
        }
        $logoIcon.trigger('click');
    });
    
    // ========== SEARCH BAR ANIMATIONS ==========
    // Enhanced animations for search bar
    
    const $searchBar = $('.search-bar');
    const $searchInput = $('.search-input');
    
    // Add subtle animation on page load
    if ($searchBar.length) {
        $searchBar.css({
            opacity: 0,
            transform: 'translateY(-10px)'
        }).delay(600).animate({
            opacity: 1
        }, 500, function() {
            $(this).css('transform', 'translateY(0)');
        });
        
        // Enhanced focus effect
        $searchInput.on('focus', function() {
            $searchBar.addClass('focused');
        }).on('blur', function() {
            $searchBar.removeClass('focused');
        });
    }
    
    // ========== MINIMAL ESSENTIAL ANIMATIONS ==========
    
    // Simple fade in for navigation (no delay to avoid glitches)
    $('nav').css('opacity', 0).animate({ opacity: 1 }, 300);
    
    // Smooth hover effects for primary buttons (only essential)
    $('.btn-primary').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
    
    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 600, 'swing');
        }
    });
    
});
