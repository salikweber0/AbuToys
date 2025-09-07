// =================== MOBILE NAVIGATION ===================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// =================== NAVBAR SCROLL EFFECT ===================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    }
});

// =================== MOBILE-OPTIMIZED LOCATION SYSTEM ===================
let isLocationAllowed = false;
let isAhmedabadUser = false;
let locationCheckAttempted = false;
let locationAttempts = 0;
const MAX_LOCATION_ATTEMPTS = 3;

// Detect if mobile device
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768 ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

// Check if location permissions are already granted
async function checkLocationPermission() {
    if ('permissions' in navigator) {
        try {
            const result = await navigator.permissions.query({name: 'geolocation'});
            console.log('Location permission status:', result.state);
            return result.state;
        } catch (error) {
            console.log('Permission API not supported:', error);
            return 'unknown';
        }
    }
    return 'unknown';
}

// Enhanced mobile location popup with better UX
function showMobileLocationPopup(message, buttons = []) {
    const existingPopup = document.getElementById('location-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'location-popup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); display: flex; align-items: center;
        justify-content: center; z-index: 10001; opacity: 0;
        transition: opacity 0.3s ease; backdrop-filter: blur(5px);
    `;

    let buttonsHTML = '';
    buttons.forEach(btn => {
        buttonsHTML += `<button onclick="${btn.action}" style="
            padding: 14px 28px; margin: 8px; background: ${btn.color || '#FF6B6B'};
            color: white; border: none; border-radius: 25px; cursor: pointer;
            font-size: 1rem; font-weight: 600; transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); min-width: 120px;
        " onmouseover="this.style.transform='scale(1.05)'" 
           onmouseout="this.style.transform='scale(1)'">${btn.text}</button>`;
    });

    popup.innerHTML = `
        <div style="
            background: white; padding: 2.5rem; border-radius: 20px;
            max-width: 380px; width: 90%; text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
        ">
            <div style="font-size: 2.5rem; margin-bottom: 1.2rem;">📍</div>
            <p style="
                font-family: 'Poppins', sans-serif; font-size: 1.1rem;
                margin-bottom: 2rem; color: #333; line-height: 1.6;
                font-weight: 500;
            ">${message}</p>
            ${buttonsHTML}
        </div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => popup.style.opacity = '1', 10);
}

function hideMobileLocationPopup() {
    const popup = document.getElementById('location-popup');
    if (popup) {
        popup.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => popup.remove(), 300);
    }
}

// Main mobile location function with enhanced error handling
async function requestMobileLocation() {
    hideBanner();
    locationAttempts++;
    
    console.log(`Location attempt #${locationAttempts}`);
    
    if (!navigator.geolocation) {
        showMobileLocationPopup(
            '⚠ Your device/browser does not support location.\n\nPlease use a modern browser or contact manually.',
            [
                { text: 'WhatsApp', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Close', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }

    const isSecure = location.protocol === 'https:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1' ||
                    location.hostname.includes('github.io') ||
                    location.hostname.includes('netlify.app') ||
                    location.hostname.includes('vercel.app');
    
    if (!isSecure) {
        showMobileLocationPopup(
            '🔒 Location only works on secure (HTTPS) websites.\n\nUse GitHub Pages or other HTTPS hosting.',
            [
                { text: 'Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Understood', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }

    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus === 'denied') {
        showMobileLocationPopup(
            '⚠️ Location permission was denied earlier!\n\nTo enable on mobile:\n\n📱 Go to browser settings and allow location for this site\n\n🔄 Or refresh the page and try again',
            [
                { text: 'Page Refresh', action: 'location.reload()', color: '#4ECDC4' },
                { text: 'Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Close', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }

    showMobileLocationPopup(`📍 Detecting location...\n\n${isMobileDevice() ? '📱 Mobile detected' : '💻 Desktop detected'}\n\nPlease click "Allow" when browser asks.`);

    const locationOptions = {
        enableHighAccuracy: isMobileDevice() ? false : true,
        timeout: isMobileDevice() ? 20000 : 15000,
        maximumAge: 300000
    };

    const timeoutId = setTimeout(() => {
        showMobileLocationPopup(
            '⏰ Location detection is taking too long!\n\nSome tips:\n• Turn on GPS\n• Go to open area\n• Ensure strong WiFi/Data',
            [
                { text: 'Try Again', action: 'requestMobileLocation()', color: '#FF6B6B' },
                { text: 'Manual Contact', action: 'manualWhatsApp()', color: '#25D366' }
            ]
        );
    }, locationOptions.timeout + 2000);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            clearTimeout(timeoutId);
            isLocationAllowed = true;
            locationCheckAttempted = true;
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log(`✅ Location success: ${lat}, ${lon} (Accuracy: ${accuracy}m)`);
            
            const ahmedabadBounds = {
                north: 23.40,
                south: 22.60,
                east: 73.00,
                west: 72.10
            };
            
            if (lat >= ahmedabadBounds.south && lat <= ahmedabadBounds.north &&
                lon >= ahmedabadBounds.west && lon <= ahmedabadBounds.east) {
                
                isAhmedabadUser = true;
                showMobileLocationPopup(
                    '✅ Perfect! You are in Ahmedabad.\n\n🎯 Location verified successfully!\n\nNow you can order products.',
                    [{ text: '🎉 Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
                
                setTimeout(hideMobileLocationPopup, 4000);
                
            } else {
                isAhmedabadUser = false;
                
                const ahmedabadCenter = { lat: 23.0225, lon: 72.5714 };
                const distance = calculateDistance(lat, lon, ahmedabadCenter.lat, ahmedabadCenter.lon);
                
                showMobileLocationPopup(
                    `📍 Your location: ${distance.toFixed(1)} km away from Ahmedabad\n\n😔 Sorry! We only deliver in Ahmedabad city.\n\n📜 We will add other cities soon!`,
                    [
                        { text: 'Understood', action: 'hideMobileLocationPopup()' },
                        { text: 'Still Contact', action: 'manualWhatsApp()', color: '#25D366' }
                    ]
                );
            }
        },
        (error) => {
            clearTimeout(timeoutId);
            isLocationAllowed = false;
            locationCheckAttempted = true;
            
            console.error('Location error:', error);
            
            let errorMsg = '';
            let buttons = [];
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = `🚫 Location permission denied!\n\n📱 Steps to enable on mobile:\n\n1️⃣ Go to browser menu (⋮)\n2️⃣ Open "Site settings" or "Permissions"\n3️⃣ Set "Location" to "Allow"\n4️⃣ Refresh page\n\n🔄 Or turn on location in your phone's main settings.`;
                    buttons = [
                        { text: '🔄 Page Refresh', action: 'location.reload()', color: '#4ECDC4' },
                        { text: '📱 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                        { text: 'Later', action: 'hideMobileLocationPopup()', color: '#6c757d' }
                    ];
                    break;
                    
                case error.POSITION_UNAVAILABLE:
                    errorMsg = `📡 GPS signal not found!\n\n${isMobileDevice() ? '📱 Mobile tips:' : '💻 Desktop tips:'}\n\n• Turn on GPS/Location services\n• Go to open area (outside building)\n• Ensure strong network connection\n• Wait a few seconds`;
                    buttons = [
                        { text: '🔄 Try Again', action: 'requestMobileLocation()', color: '#FF6B6B' },
                        { text: '📞 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' }
                    ];
                    break;
                    
                case error.TIMEOUT:
                    errorMsg = `⏰ Location detection taking too long!\n\n${isMobileDevice() ? '📱 Mobile solutions:' : '💻 Desktop solutions:'}\n\n• Check internet connection\n• Ensure strong GPS signal\n• Wait a few seconds and try again`;
                    
                    if (locationAttempts < MAX_LOCATION_ATTEMPTS) {
                        buttons = [
                            { text: '🔄 Try Again', action: 'requestMobileLocation()', color: '#FF6B6B' },
                            { text: '📱 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' }
                        ];
                    } else {
                        buttons = [
                            { text: '📱 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                            { text: 'Close', action: 'hideMobileLocationPopup()' }
                        ];
                    }
                    break;
                    
                default:
                    errorMsg = `⚠ Technical problem with location.\n\n${isMobileDevice() ? '📱 Mobile device detected' : '💻 Desktop detected'}\n\n• Update your browser\n• Or contact manually`;
                    buttons = [
                        { text: '📱 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                        { text: 'Close', action: 'hideMobileLocationPopup()' }
                    ];
            }
            
            showMobileLocationPopup(errorMsg, buttons);
        },
        locationOptions
    );
}

// Distance calculation helper
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// =================== BUTTON ACTIONS ===================
function executeAction(actionType, productName = '') {
    if (!locationCheckAttempted) {
        showMobileLocationPopup(
            '📍 Location Verification Required\n\nFirst give location permission so we can verify that you are in Ahmedabad.\n\n🔒 This is safe for your privacy.',
            [
                { text: '✅ Allow Location', action: 'requestMobileLocation()', color: '#4ECDC4' },
                { text: '❌ Cancel', action: 'hideMobileLocationPopup()', color: '#6c757d' }
            ]
        );
        return;
    }
    
    if (!isLocationAllowed) {
        showMobileLocationPopup(
            `⚠️ Location permission not granted!\n\nEnable location on ${isMobileDevice() ? '📱 Mobile' : '💻 Desktop'}:\n\n🔧 Go to browser settings and allow location for this site\n\n🔄 Or refresh page and try again`,
            [
                { text: '🔄 Refresh', action: 'location.reload()', color: '#4ECDC4' },
                { text: '📱 Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Understood', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }
    
    if (!isAhmedabadUser) {
        showMobileLocationPopup(
            '😔 Sorry! You are not in Ahmedabad city.\n\n🚚 We only deliver toys in Ahmedabad.\n\n📜 We will add other cities soon!',
            [
                { text: 'Understood', action: 'hideMobileLocationPopup()' },
                { text: 'Still Contact', action: 'manualWhatsApp()', color: '#25D366' }
            ]
        );
        return;
    }
    
    if (actionType === 'whatsapp') {
        let userName = '';
        
        if (isMobileDevice()) {
            userName = prompt('🧸 Tell us your name:') || 'Customer';
        } else {
            userName = prompt('Tell us your name:') || 'Customer';
        }
        
        if (userName && userName.trim()) {
            let message = `Hi! 👋 I am ${userName.trim()} from Ahmedabad.`;
            
            if (productName) {
                message += ` I want to order *${productName}*. 🧸`;
            } else {
                message += ` I am interested in your toys. Please send details. 🎯`;
            }
            
            message += `\n\n📍 Location verified ✅`;
            
            const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
            
            if (isMobileDevice()) {
                window.location.href = whatsappURL;
            } else {
                window.open(whatsappURL, '_blank');
            }
            
        } else {
            alert('Please enter your name! 😊');
        }
        
    } else if (actionType === 'call') {
        if (isMobileDevice()) {
            window.location.href = 'tel:+919879254030';
        } else {
            showMobileLocationPopup(
                '📞 Our Contact Number:\n\n+91 9879254030\n\n💻 Dial from your mobile phone from desktop.',
                [
                    { text: '📱 WhatsApp', action: 'executeAction("whatsapp")', color: '#25D366' },
                    { text: 'Copy Number', action: 'copyPhoneNumber()', color: '#4ECDC4' },
                    { text: 'Close', action: 'hideMobileLocationPopup()' }
                ]
            );
        }
    }
}

// Copy phone number function
function copyPhoneNumber() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText('+919879254030').then(() => {
            alert('📋 Phone number copied! Now dial from your phone.');
            hideMobileLocationPopup();
        });
    } else {
        alert('📞 Number: +919879254030 (dial manually)');
        hideMobileLocationPopup();
    }
}

// Manual contact option
function manualWhatsApp() {
    hideMobileLocationPopup();
    
    const userName = isMobileDevice() ? 
        prompt('🧸 Tell us your name:') || 'Customer' :
        prompt('Tell us your name:') || 'Customer';
        
    if (userName && userName.trim()) {
        const message = `Hi! 👋 I am ${userName.trim()}.

📍 Please confirm if I am in Ahmedabad or not.

🧸 I am interested in your toys.`;
        const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
        
        if (isMobileDevice()) {
            window.location.href = whatsappURL;
        } else {
            window.open(whatsappURL, '_blank');
        }
    }
}

// =================== PRODUCT IMAGE SLIDER FUNCTIONALITY ===================
function initializeProductImageSliders() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const images = card.querySelectorAll('.product-img');
        const prevBtn = card.querySelector('.prev-img');
        const nextBtn = card.querySelector('.next-img');
        let currentImageIndex = 0;
        
        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }
        
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            showImage(currentImageIndex);
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % images.length;
            showImage(currentImageIndex);
        });
    });
}

// =================== PRODUCT CATEGORY FILTERS ===================
function initializeProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            productCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update results message
            const visibleCards = document.querySelectorAll('.product-card[style*="block"]').length;
            showFilterResults(category, visibleCards);
        });
    });
}

function showFilterResults(category, count) {
    const categoryNames = {
        'all': 'All Products',
        'teddy': 'Teddy Bears',
        'cars': 'RC Cars',
        'dolls': 'Dolls',
        'blocks': 'Building Blocks',
        'weapons': 'Toy Weapons',
        'helicopters': 'Helicopters'
    };
    
    const categoryName = categoryNames[category] || category;
    const message = count > 0 ? 
        `Found ${count} products in ${categoryName}` :
        `No products found in ${categoryName}`;
    
    // Show temporary result message
    const resultDiv = document.getElementById('filter-results') || document.createElement('div');
    resultDiv.id = 'filter-results';
    resultDiv.textContent = message;
    resultDiv.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8); color: white; padding: 15px 25px;
        border-radius: 10px; z-index: 1000; font-size: 0.9rem;
    `;
    
    if (!document.getElementById('filter-results')) {
        document.body.appendChild(resultDiv);
    }
    
    setTimeout(() => {
        if (resultDiv) resultDiv.remove();
    }, 2000);
}

// =================== SEARCH FUNCTIONALITY ===================
function initializeSearchFunctionality() {
    const desktopSearch = document.getElementById('desktop-search');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const responsiveSearchBtn = document.getElementById('responsive-search-btn');
    const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
    const mobileSearchClose = document.getElementById('mobile-search-close');
    
    function filterProducts(searchTerm) {
        const productCards = document.querySelectorAll('.product-card');
        let foundProducts = 0;
        
        productCards.forEach(card => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                foundProducts++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (searchTerm) {
            const resultsMsg = foundProducts > 0 ? 
                `🔍 ${foundProducts} products found for "${searchTerm}"` :
                `😔 No product found for "${searchTerm}". Try searching something else.`;
            
            const resultDiv = document.getElementById('search-results') || document.createElement('div');
            resultDiv.id = 'search-results';
            resultDiv.textContent = resultsMsg;
            resultDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8); color: white; padding: 15px 25px;
                border-radius: 10px; z-index: 1000; font-size: 0.9rem;
            `;
            
            if (!document.getElementById('search-results')) {
                document.body.appendChild(resultDiv);
            }
            
            setTimeout(() => {
                if (resultDiv) resultDiv.remove();
            }, 3000);
        }
    }
    
    // Desktop search
    if (desktopSearch) {
        desktopSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
        });
        
        desktopSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase().trim();
                filterProducts(searchTerm);
            }
        });
    }
    
    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
        });
        
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase().trim();
                filterProducts(searchTerm);
            }
        });
    }
    
    // Responsive search button
    if (responsiveSearchBtn && mobileSearchOverlay) {
        responsiveSearchBtn.addEventListener('click', () => {
            mobileSearchOverlay.style.display = 'flex';
            setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
            if (mobileSearchInput) {
                mobileSearchInput.focus();
                mobileSearchInput.click();
            }
        });
        
        mobileSearchOverlay.addEventListener('click', (e) => {
            if (e.target === mobileSearchOverlay) {
                mobileSearchOverlay.style.opacity = '0';
                setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
            }
        });
        
        if (mobileSearchClose) {
            mobileSearchClose.addEventListener('click', () => {
                mobileSearchOverlay.style.opacity = '0';
                setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
            });
        }
    }
}

// =================== IMAGE LIGHTBOX FUNCTIONALITY ===================
function initializeImageLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const productImages = document.querySelectorAll('.product-img');
    
    productImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex' && e.key === 'Escape') {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

// =================== WISHLIST FUNCTIONALITY ===================
function initializeWishlistFunctionality() {
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isWishlisted = this.classList.contains('wishlisted');
            
            if (isWishlisted) {
                this.style.color = '#FF6B6B';
                this.classList.remove('wishlisted');
            } else {
                this.style.color = 'red';
                this.classList.add('wishlisted');
            }
            
            // Animation feedback
            this.style.transform = 'scale(1.4)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
            
            // Mobile haptic feedback
            if (isMobileDevice() && navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
    });
}

// =================== ORDER BUTTON FUNCTIONALITY ===================
function initializeOrderButtons() {
    document.querySelectorAll('.order-btn').forEach(btn => {
        const parentCard = btn.closest('.product-card');
        let productName = 'Product';
        
        if (parentCard) {
            const nameElement = parentCard.querySelector('h3');
            if (nameElement) {
                productName = nameElement.textContent.trim();
            }
        }
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Order button clicked for: ${productName}`);
            executeAction('whatsapp', productName);
        });
    });
}

// =================== BACK TO TOP BUTTON ===================
function initializeBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', () => {
        const scrollThreshold = isMobileDevice() ? 300 : 500;
        
        if (window.scrollY > scrollThreshold) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'scale(1)';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'scale(0)';
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
        
        if (isMobileDevice() && navigator.vibrate) {
            navigator.vibrate(30);
        }
    });
}

// =================== RESPONSIVE SEARCH BUTTON VISIBILITY ===================
function initializeResponsiveSearchButton() {
    const responsiveSearchBtn = document.getElementById('responsive-search-btn');
    
    if (responsiveSearchBtn) {
        window.addEventListener('scroll', () => {
            if (isMobileDevice()) {
                const scrollThreshold = 200;
                
                if (window.scrollY > scrollThreshold) {
                    responsiveSearchBtn.style.opacity = '1';
                    responsiveSearchBtn.style.transform = 'scale(1)';
                } else {
                    responsiveSearchBtn.style.opacity = '0';
                    responsiveSearchBtn.style.transform = 'scale(0)';
                }
            }
        });
    }
}

// =================== LOAD MORE PRODUCTS FUNCTIONALITY ===================
function initializeLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const productsGrid = document.getElementById('products-grid');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // Simulate loading more products
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
            
            setTimeout(() => {
                // Add more product cards here in a real application
                // For now, just show a message
                showMobileLocationPopup(
                    '🔄 All products loaded!\n\nWe are constantly adding new toys to our collection.\n\nCheck back soon for more amazing products!',
                    [{ text: '✅ Got it!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
                
                loadMoreBtn.textContent = 'All Products Loaded';
                loadMoreBtn.style.background = '#6c757d';
                loadMoreBtn.style.cursor = 'not-allowed';
            }, 1500);
        });
    }
}

// =================== NEWSLETTER FUNCTIONALITY ===================
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput?.value;
            
            if (email && email.includes('@')) {
                if (isMobileDevice()) {
                    showMobileLocationPopup(
                        '📧 Newsletter subscription successful!\n\nThank you for subscribing! 🎉',
                        [{ text: '✅ Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                    );
                } else {
                    alert('📧 Thank you for subscribing!');
                }
                this.reset();
            } else {
                alert('Please enter a valid email address! 📧');
            }
        });
    }
}

// =================== CONTACT FORM FUNCTIONALITY ===================
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isMobileDevice()) {
                showMobileLocationPopup(
                    '📧 Message sent successfully!\n\nWe will reply soon. 🚀',
                    [{ text: '✅ Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
            } else {
                alert('📧 Message sent! We will reply soon.');
            }
            this.reset();
        });
    }
}

// =================== MOBILE LOCATION BANNER ===================
function createLocationBanner() {
    if (document.getElementById('location-banner') || locationCheckAttempted) return;
    
    const banner = document.createElement('div');
    banner.id = 'location-banner';
    banner.style.cssText = `
        position: fixed; 
        ${isMobileDevice() ? 'bottom: 20px; left: 15px; right: 15px;' : 'top: 80px; left: 0; right: 0;'}
        background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
        color: white; padding: ${isMobileDevice() ? '18px' : '15px'}; 
        text-align: center; z-index: 999;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border-radius: ${isMobileDevice() ? '15px' : '0'};
        transform: ${isMobileDevice() ? 'translateY(100%)' : 'translateY(-100%)'};
        transition: transform 0.4s ease;
        backdrop-filter: blur(10px);
    `;
    
    banner.innerHTML = `
        <div style="font-size: ${isMobileDevice() ? '1rem' : '0.95rem'}; margin-bottom: 12px; font-weight: 600;">
            📍 <strong>Location Required</strong><br>
            <span style="font-weight: 400; font-size: 0.9rem;">
                Please allow location to order products
            </span>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button onclick="requestMobileLocation()" style="
                padding: 10px 24px; background: rgba(255, 255, 255, 0.2);
                color: white; border: 2px solid white; border-radius: 25px;
                cursor: pointer; font-size: 0.9rem; font-weight: 600;
                transition: all 0.3s ease; backdrop-filter: blur(5px);
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
               onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                📍 Allow Location
            </button>
            <button onclick="hideBanner()" style="
                padding: 10px 20px; background: transparent;
                color: white; border: 1px solid rgba(255, 255, 255, 0.6); 
                border-radius: 25px; cursor: pointer; font-size: 0.9rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'"
               onmouseout="this.style.background='transparent'">
                ❌ Close
            </button>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 1000);
    
    setTimeout(() => {
        if (document.getElementById('location-banner') && !locationCheckAttempted) {
            hideBanner();
        }
    }, 30000);
}

function hideBanner() {
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.style.transform = isMobileDevice() ? 'translateY(100%)' : 'translateY(-100%)';
        setTimeout(() => banner.remove(), 400);
    }
}

// =================== MOBILE PERFORMANCE OPTIMIZATION ===================
function optimizeForMobile() {
    if (isMobileDevice()) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                * { -webkit-tap-highlight-color: transparent; }
                button, .btn { min-height: 44px; min-width: 44px; }
                input, textarea { font-size: 16px !important; }
            }
        `;
        document.head.appendChild(mobileStyles);
        
        console.log('📱 Mobile optimizations applied');
    }
}

// =================== ERROR HANDLING & FALLBACKS ===================
function handleLocationErrors() {
    window.addEventListener('orientationchange', () => {
        if (isLocationAllowed && !isAhmedabadUser) {
            console.log('📱 Orientation changed, rechecking location in 2 seconds...');
            setTimeout(() => {
                if (locationAttempts < MAX_LOCATION_ATTEMPTS) {
                    requestMobileLocation();
                }
            }, 2000);
        }
    });
    
    window.addEventListener('online', () => {
        console.log('🌐 Back online - location services may work better now');
        if (!isLocationAllowed && locationCheckAttempted && locationAttempts < MAX_LOCATION_ATTEMPTS) {
            setTimeout(() => {
                showMobileLocationPopup(
                    '🌐 Internet connection restored!\n\nLocation may work better now.',
                    [
                        { text: '🔄 Try Again', action: 'requestMobileLocation()', color: '#4ECDC4' },
                        { text: 'Skip', action: 'hideMobileLocationPopup()' }
                    ]
                );
            }, 1000);
        }
    });
}

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧸 AbuToys Products Page Loading...');
    
    // Mobile detection and optimization
    const isMobile = isMobileDevice();
    console.log('📱 Device Type:', isMobile ? 'Mobile' : 'Desktop');
    optimizeForMobile();
    
    // Initialize all functionality
    initializeProductImageSliders();
    initializeProductFilters();
    initializeSearchFunctionality();
    initializeImageLightbox();
    initializeWishlistFunctionality();
    initializeOrderButtons();
    initializeBackToTopButton();
    initializeResponsiveSearchButton();
    initializeLoadMoreButton();
    initializeNewsletterForm();
    initializeContactForm();
    
    // Setup error handlers
    handleLocationErrors();
    
    // Show location banner for mobile users
    if (isMobile) {
        console.log('📱 Mobile detected - showing location banner');
        setTimeout(createLocationBanner, 2500);
    } else {
        console.log('💻 Desktop detected - auto location check');
        setTimeout(() => {
            if (!locationCheckAttempted) {
                requestMobileLocation();
            }
        }, 2000);
    }
    
    console.log('✅ AbuToys Products Page Ready!');
});

// =================== GLOBAL FUNCTIONS ===================
window.requestMobileLocation = requestMobileLocation;
window.hideMobileLocationPopup = hideMobileLocationPopup;
window.hideBanner = hideBanner;
window.manualWhatsApp = manualWhatsApp;
window.executeAction = executeAction;
window.copyPhoneNumber = copyPhoneNumber;
window.closeLightbox = closeLightbox;
window.isMobileDevice = isMobileDevice;

// =================== GLOBAL ERROR HANDLER ===================
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (e.error.message.includes('geolocation') || e.error.message.includes('location')) {
        console.log('🔧 Location-related error detected, providing fallback...');
        showMobileLocationPopup(
            '⚠️ Technical issue with location.\n\nContact directly:',
            [
                { text: '📱 WhatsApp', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Close', action: 'hideMobileLocationPopup()' }
            ]
        );
    }
});

// Handle permissions change
if ('permissions' in navigator) {
    navigator.permissions.query({name: 'geolocation'}).then((result) => {
        result.addEventListener('change', () => {
            console.log('📍 Location permission changed to:', result.state);
            if (result.state === 'granted' && !isLocationAllowed) {
                console.log('🎉 Location permission granted! Auto-checking...');
                setTimeout(requestMobileLocation, 500);
            }
        });
    }).catch(e => console.log('Permission monitoring not supported:', e));
}

// Debug information
console.log(`
🧸 AbuToys Products Page - Enhanced Mobile System
📱 Mobile Detection: ${isMobileDevice()}
🔒 HTTPS Status: ${location.protocol === 'https:'}
📍 Geolocation Support: ${!!navigator.geolocation}
🌐 Hostname: ${location.hostname}
📏 Viewport: ${window.innerWidth}x${window.innerHeight}
👆 Touch Support: ${'ontouchstart' in window}

📋 Available Functions:
- Product image sliders with navigation
- Category filters
- Search functionality (desktop + mobile)
- Image lightbox viewer
- Wishlist functionality
- Location-based ordering
- Mobile-optimized interactions
`);