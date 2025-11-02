$(document).ready(function() {
    
    
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
        
        $overlay.on('click', function(e) {
            if ($(e.target).hasClass('logo-overlay')) {
                closeLogoOverlay($overlay);
            }
        });
        
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
        
        setTimeout(function() {
            $overlay.addClass('active');
        }, 10);
        
        setTimeout(function() {
            if ($overlay.hasClass('active')) {
                closeLogoOverlay($overlay);
            }
        }, 3000);
    });
    
    $logo.on('click', function(e) {
        if ($(e.target).hasClass('logo-icon') || $(e.target).closest('.logo-icon').length) {
            return; 
        }
        $logoIcon.trigger('click');
    });
    
    
    const $searchBar = $('.search-bar');
    const $searchInput = $('.search-input');
    
    if ($searchBar.length) {
        $searchBar.css({
            opacity: 0,
            transform: 'translateY(-10px)'
        }).delay(600).animate({
            opacity: 1
        }, 500, function() {
            $(this).css('transform', 'translateY(0)');
        });
        
        $searchInput.on('focus', function() {
            $searchBar.addClass('focused');
        }).on('blur', function() {
            $searchBar.removeClass('focused');
        });
    }
    
    
    $('nav').css('opacity', 0).animate({ opacity: 1 }, 300);
    
    $('.btn-primary').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
    
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
