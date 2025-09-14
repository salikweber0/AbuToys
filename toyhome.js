// =================== LOCATION-BASED ORDERING SYSTEM ===================
// Shop base location: Burkhaposh Masjid, Old City, Halim Ni Khadki, Shahpur, Ahmedabad
const SHOP_LOCATION = {
    lat: 23.037680,
    lon: 72.580419,
    address: "Burkhaposh Masjid, Old City, Halim Ni Khadki, Shahpur, Ahmedabad"
};

// Ahmedabad Municipal Corporation boundary (simplified polygon)
const AHMEDABAD_BOUNDARY = [
    [72.4350, 23.1500], [72.7000, 23.1500], [72.7500, 23.0800],
    [72.7200, 23.0200], [72.6800, 22.9800], [72.6200, 22.9500],
    [72.5500, 22.9300], [72.4800, 22.9500], [72.4200, 22.9800],
    [72.3800, 23.0200], [72.4000, 23.0800], [72.4350, 23.1500]
];

// Location state management
let locationState = {
    isVerified: false,
    userLocation: null,
    isInAhmedabad: false,
    isInDeliveryBoundary: false,
    distance: 0,
    deliveryCharge: 0,
    verificationAttempts: 0,
    maxAttempts: 3
};

// Check if location is already stored
function checkStoredLocation() {
    try {
        const stored = sessionStorage.getItem('abutoys_location');
        if (stored) {
            const data = JSON.parse(stored);
            const now = Date.now();
            // Check if stored data is less than 1 hour old
            if (now - data.timestamp < 3600000) {
                locationState = { ...locationState, ...data };
                updateProductButtons();
                return true;
            }
        }
    } catch (error) {
        console.log('No stored location found');
    }
    return false;
}

// Store location data
function storeLocationData() {
    try {
        const data = {
            ...locationState,
            timestamp: Date.now()
        };
        sessionStorage.setItem('abutoys_location', JSON.stringify(data));
    } catch (error) {
        console.log('Could not store location data');
    }
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate delivery charges based on distance
function calculateDeliveryCharge(distance) {
    if (distance <= 0) return 0;
    
    const roundedDistance = Math.ceil(distance); // Round up to nearest km
    
    if (roundedDistance === 1) {
        return 40; // First km: ₹40
    }
    
    const extraKms = roundedDistance - 1;
    return 40 + (extraKms * 10); // Extra kms: ₹10 each
}

// Point-in-polygon check for Ahmedabad boundary
function isPointInAhmedabad(lat, lon) {
    let inside = false;
    const polygon = AHMEDABAD_BOUNDARY;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i][1] > lat) !== (polygon[j][1] > lat)) &&
            (lon < (polygon[j][0] - polygon[i][0]) * (lat - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
            inside = !inside;
        }
    }
    return inside;
}

// Check if location is within delivery boundary (100km max)
function isInDeliveryBoundary(distance) {
    return distance <= 100;
}

// Update product buttons based on location status
function updateProductButtons() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const orderBtn = card.querySelector('.btn-order');
        const deliveryInfo = card.querySelector('.delivery-charge');
        const productName = card.dataset.product;
        
        if (!orderBtn || !deliveryInfo) return;
        
        if (!locationState.isVerified) {
            // Location not verified
            orderBtn.disabled = true;
            orderBtn.innerHTML = '<span class="btn-text">📍 Location Required</span>';
            orderBtn.className = 'btn btn-order';
            deliveryInfo.textContent = '📍 Allow location for delivery info';
            deliveryInfo.className = 'delivery-charge calculating';
            
        } else if (!locationState.isInAhmedabad) {
            // Outside Ahmedabad
            orderBtn.disabled = true;
            orderBtn.innerHTML = '<span class="btn-text">❌ Not Available</span>';
            orderBtn.className = 'btn btn-order restricted';
            deliveryInfo.textContent = '❌ Delivery not available in your area';
            deliveryInfo.className = 'delivery-charge restricted';
            
        } else if (!locationState.isInDeliveryBoundary) {
            // In Ahmedabad but outside delivery range
            orderBtn.disabled = false;
            orderBtn.innerHTML = '<span class="btn-text">📱 Contact Us</span>';
            orderBtn.className = 'btn btn-order outside-boundary';
            orderBtn.onclick = () => openWhatsAppForOutsideBoundary(productName);
            deliveryInfo.textContent = `⚠️ ${locationState.distance.toFixed(1)}km - Please confirm availability`;
            deliveryInfo.className = 'delivery-charge outside-boundary';
            
        } else {
            // Within delivery boundary
            orderBtn.disabled = false;
            orderBtn.innerHTML = '<span class="btn-text">🛒 Order Now</span>';
            orderBtn.className = 'btn btn-order available';
            orderBtn.onclick = () => openWhatsAppOrder(productName);
            deliveryInfo.textContent = `🚚 ${locationState.distance.toFixed(1)}km | Delivery: ₹${locationState.deliveryCharge}`;
            deliveryInfo.className = 'delivery-charge available';
        }
    });
}

// Show location modal
function showLocationModal(title, message, buttons = []) {
    const modal = document.getElementById('location-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalButtons = document.getElementById('modal-buttons');
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message.replace(/\n/g, '<br>');
    
    // Create buttons
    modalButtons.innerHTML = '';
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `btn ${button.class || 'btn-primary'}`;
        btn.textContent = button.text;
        btn.onclick = button.onclick;
        modalButtons.appendChild(btn);
    });
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => modal.style.display = 'none', 300);
}

// Request location permission
function requestLocation() {
    if (locationState.verificationAttempts >= locationState.maxAttempts) {
        showLocationModal(
            '❌ Maximum Attempts Reached',
            'You have tried location detection multiple times. Please contact us manually for assistance.',
            [
                { text: '📱 WhatsApp Us', onclick: openWhatsAppManual, class: 'btn-whatsapp' },
                { text: 'Close', onclick: closeLocationModal, class: 'btn-outline' }
            ]
        );
        return;
    }
    
    locationState.verificationAttempts++;
    hideBanner();
    
    if (!navigator.geolocation) {
        showLocationModal(
            '❌ Location Not Supported',
            'Your browser does not support location detection. Please contact us manually.',
            [
                { text: '📱 WhatsApp Us', onclick: openWhatsAppManual, class: 'btn-whatsapp' },
                { text: 'Close', onclick: closeLocationModal, class: 'btn-outline' }
            ]
        );
        return;
    }
    
    // Check if HTTPS is required
    const isSecure = location.protocol === 'https:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1';
    
    if (!isSecure && location.hostname !== 'localhost') {
        showLocationModal(
            '🔒 HTTPS Required',
            'Location detection requires a secure connection (HTTPS). Please use a secure hosting service.',
            [
                { text: 'Understood', onclick: closeLocationModal, class: 'btn-primary' }
            ]
        );
        return;
    }
    
    showLocationModal(
        '📍 Detecting Location',
        'Please allow location access when your browser asks.\n\nThis helps us calculate accurate delivery charges.',
        []
    );
    
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
    };
    
    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        options
    );
}

function handleLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    console.log(`Location obtained: ${lat}, ${lon} (Accuracy: ${accuracy}m)`);
    
    locationState.userLocation = { lat, lon };
    locationState.isVerified = true;
    locationState.isInAhmedabad = isPointInAhmedabad(lat, lon);
    locationState.distance = calculateDistance(lat, lon, SHOP_LOCATION.lat, SHOP_LOCATION.lon);
    locationState.deliveryCharge = calculateDeliveryCharge(locationState.distance);
    locationState.isInDeliveryBoundary = isInDeliveryBoundary(locationState.distance);
    
    // Store the data
    storeLocationData();
    
    // Update UI
    updateProductButtons();
    
    // Show result
    if (!locationState.isInAhmedabad) {
        showLocationModal(
            '❌ Outside Delivery Area',
            `Your location is ${locationState.distance.toFixed(1)}km away from Ahmedabad.\n\nSorry! We currently deliver only within Ahmedabad Municipal Corporation limits.\n\nWe are planning to expand to other cities soon!`,
            [
                { text: '📱 Still Contact', onclick: openWhatsAppManual, class: 'btn-whatsapp' },
                { text: 'Understood', onclick: closeLocationModal, class: 'btn-outline' }
            ]
        );
    } else if (!locationState.isInDeliveryBoundary) {
        showLocationModal(
            '⚠️ Outside Standard Delivery',
            `You are ${locationState.distance.toFixed(1)}km away from our shop.\n\nThis is beyond our standard 100km delivery range.\n\nPlease contact us to confirm if delivery is possible.`,
            [
                { text: '📱 Contact Us', onclick: () => { closeLocationModal(); openWhatsAppForOutsideBoundary('inquiry'); }, class: 'btn-whatsapp' },
                { text: 'Understood', onclick: closeLocationModal, class: 'btn-outline' }
            ]
        );
    } else {
        showLocationModal(
            '✅ Location Verified',
            `Great! You are ${locationState.distance.toFixed(1)}km away from our shop.\n\nDelivery charge: ₹${locationState.deliveryCharge}\n\nYou can now place orders!`,
            [
                { text: '🎉 Perfect!', onclick: closeLocationModal, class: 'btn-primary' }
            ]
        );
        
        // Auto close after 3 seconds
        setTimeout(closeLocationModal, 3000);
    }
}

function handleLocationError(error) {
    console.error('Location error:', error);
    
    let title, message, buttons;
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            title = '❌ Location Permission Denied';
            message = 'You denied location access.\n\nTo enable location:\n1. Click the location icon in your browser\'s address bar\n2. Choose "Allow"\n3. Refresh the page\n\nOr contact us manually for assistance.';
            buttons = [
                { text: '🔄 Try Again', onclick: requestLocation, class: 'btn-primary' },
                { text: '📱 Contact Manually', onclick: openWhatsAppManual, class: 'btn-whatsapp' },
                { text: 'Close', onclick: closeLocationModal, class: 'btn-outline' }
            ];
            break;
            
        case error.POSITION_UNAVAILABLE:
            title = '📡 Location Unavailable';
            message = 'Could not determine your location.\n\nPlease:\n• Check if GPS is enabled\n• Move to an area with better signal\n• Try again in a few moments';
            buttons = [
                { text: '🔄 Try Again', onclick: requestLocation, class: 'btn-primary' },
                { text: '📱 Contact Manually', onclick: openWhatsAppManual, class: 'btn-whatsapp' }
            ];
            break;
            
        case error.TIMEOUT:
            title = '⏰ Location Timeout';
            message = 'Location detection is taking too long.\n\nThis might be due to:\n• Weak GPS signal\n• Poor internet connection\n• Device settings';
            
            if (locationState.verificationAttempts < locationState.maxAttempts) {
                buttons = [
                    { text: '🔄 Try Again', onclick: requestLocation, class: 'btn-primary' },
                    { text: '📱 Contact Manually', onclick: openWhatsAppManual, class: 'btn-whatsapp' }
                ];
            } else {
                buttons = [
                    { text: '📱 Contact Manually', onclick: openWhatsAppManual, class: 'btn-whatsapp' },
                    { text: 'Close', onclick: closeLocationModal, class: 'btn-outline' }
                ];
            }
            break;
            
        default:
            title = '❌ Location Error';
            message = 'An unexpected error occurred while detecting location.\n\nPlease try again or contact us manually.';
            buttons = [
                { text: '🔄 Try Again', onclick: requestLocation, class: 'btn-primary' },
                { text: '📱 Contact Manually', onclick: openWhatsAppManual, class: 'btn-whatsapp' }
            ];
    }
    
    showLocationModal(title, message, buttons);
}

// WhatsApp functions
function openWhatsAppOrder(productName) {
    if (!locationState.isVerified || !locationState.isInAhmedabad || !locationState.isInDeliveryBoundary) {
        return;
    }
    
    const message = `✅ Location verified inside Ahmedabad boundary where you deliver. 

I want to order *${productName}*

Distance: ${locationState.distance.toFixed(1)}km | Delivery Charge: ₹${locationState.deliveryCharge}

Please confirm availability and total price. Thank you!`;
    
    const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

function openWhatsAppForOutsideBoundary(productName) {
    let message;
    
    if (productName === 'inquiry') {
        message = `⚠️ Location verified in Ahmedabad city but not inside delivery boundary where you deliver.

Distance: ${locationState.distance.toFixed(1)}km from your shop

Please confirm if delivery is available to my area. Thank you!`;
    } else {
        message = `⚠️ Location verified in Ahmedabad city but not inside delivery boundary where you deliver.

I want to order *${productName}*

Distance: ${locationState.distance.toFixed(1)}km from your shop

Please confirm availability and delivery charges. Thank you!`;
    }
    
    const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

function openWhatsAppManual() {
    closeLocationModal();
    
    const userName = prompt('Please enter your name:') || 'Customer';
    const message = `Hi! I am ${userName}.

📍 I need help with location verification or want to place an order.

Please guide me on how to proceed. Thank you!`;
    
    const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// Banner management
function showLocationBanner() {
    if (locationState.isVerified) return;
    
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.style.display = 'block';
        setTimeout(() => banner.classList.add('show'), 100);
        
        // Auto hide after 30 seconds
        setTimeout(() => {
            if (!locationState.isVerified) {
                hideBanner();
            }
        }, 30000);
    }
}

function hideBanner() {
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.style.display = 'none', 400);
    }
}

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
    
    // Show/hide responsive search button
    const responsiveSearchBtn = document.getElementById('responsive-search-btn');
    if (responsiveSearchBtn) {
        if (window.scrollY > 300) {
            responsiveSearchBtn.style.opacity = '1';
            responsiveSearchBtn.style.transform = 'scale(1)';
        } else {
            responsiveSearchBtn.style.opacity = '0';
            responsiveSearchBtn.style.transform = 'scale(0)';
        }
    }
});

// =================== HERO SLIDER ===================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function nextSlide() {
    if (slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
    }
}

if (slides.length > 0) {
    setInterval(nextSlide, 5000);
}

// =================== SEARCH FUNCTIONALITY ===================
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    products.forEach(product => {
        const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
        const productData = product.dataset.product?.toLowerCase() || '';
        
        if (name.includes(searchTerm) || productData.includes(searchTerm)) {
            product.style.display = 'block';
            foundProducts++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Show results count
    if (searchTerm) {
        console.log(`Found ${foundProducts} products for "${searchTerm}"`);
    }
}

// Setup search functionality
const searchInputs = document.querySelectorAll('.search-input, #mobile-search-input');
searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });
});

// Mobile search overlay
const responsiveSearchBtn = document.getElementById('responsive-search-btn');
const mobileSearchOverlay = document.getElementById('mobile-search-overlay');

if (responsiveSearchBtn && mobileSearchOverlay) {
    responsiveSearchBtn.addEventListener('click', () => {
        mobileSearchOverlay.style.display = 'flex';
        setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
        const searchInput = document.getElementById('mobile-search-input');
        if (searchInput) {
            searchInput.focus();
        }
    });
    
    // Close overlay
    mobileSearchOverlay.addEventListener('click', (e) => {
        if (e.target === mobileSearchOverlay) {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        }
    });
    
    const mobileSearchClose = document.getElementById('mobile-search-close');
    if (mobileSearchClose) {
        mobileSearchClose.addEventListener('click', () => {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        });
    }
}

// =================== FORM HANDLERS ===================
// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput?.value;
        
        if (email && email.includes('@')) {
            alert('📧 Thank you for subscribing!');
            this.reset();
        } else {
            alert('Please enter a valid email address!');
        }
    });
}

// Contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('📧 Message sent! We will reply soon.');
        this.reset();
    });
}

// =================== WISHLIST FUNCTIONALITY ===================
document.querySelectorAll('.wishlist-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isWishlisted = this.style.color === 'red' || this.classList.contains('wishlisted');
        
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
    });
});

// =================== GALLERY LIGHTBOX ===================
document.querySelectorAll('.gallery-item, .product-image').forEach(item => {
    item.addEventListener('click', function(e) {
        const img = this.querySelector('img') || this;
        if (!img || !img.src) return;
        
        e.preventDefault();
        
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.95); display: flex; align-items: center;
            justify-content: center; z-index: 9999; opacity: 0; 
            transition: opacity 0.3s ease;
        `;
        
        lightbox.innerHTML = `
            <div style="position: relative; max-width: 95%; max-height: 95%;">
                <button onclick="this.parentElement.parentElement.remove(); document.body.style.overflow = '';" style="
                    position: absolute; top: -50px; right: -10px; color: white;
                    font-size: 2rem; cursor: pointer; background: rgba(255, 255, 255, 0.2);
                    border: none; border-radius: 50%; width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                ">×</button>
                <img src="${img.src}" style="
                    max-width: 100%; max-height: 100%; border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                " alt="Product Image">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        setTimeout(() => lightbox.style.opacity = '1', 10);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                document.body.style.overflow = '';
                lightbox.remove();
            }
        });
    });
});

// =================== BACK TO TOP BUTTON ===================
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px;
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white;
    border: none; border-radius: 50%; cursor: pointer; font-size: 1.2rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); opacity: 0; transform: scale(0);
    transition: all 0.3s ease; z-index: 1000;
`;

document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.transform = 'scale(1)';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0)';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =================== BUTTON EVENT HANDLERS ===================
// Setup WhatsApp and Call buttons
document.addEventListener('DOMContentLoaded', function() {
    // WhatsApp buttons
    const whatsappBtns = ['#whatsapp-btn', '#cta-whatsapp-btn', '#footer-whatsapp'];
    whatsappBtns.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (locationState.isVerified && locationState.isInAhmedabad) {
                    openWhatsAppOrder('general inquiry');
                } else {
                    openWhatsAppManual();
                }
            });
        }
    });
    
    // Call button
    const callBtn = document.querySelector('#call-btn');
    if (callBtn) {
        callBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('tel:+919879254030', '_self');
        });
    }
});

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧸 AbuToys Enhanced Location System Loading...');
    
    // Check for stored location first
    if (!checkStoredLocation()) {
        // Show location banner after delay
        setTimeout(showLocationBanner, 2000);
    } else {
        console.log('✅ Using stored location data');
    }
    
    // Initialize product buttons
    updateProductButtons();
    
    console.log('✅ AbuToys System Ready!');
});

// Global functions
window.requestLocation = requestLocation;
window.hideBanner = hideBanner;
window.closeLocationModal = closeLocationModal;
window.openWhatsAppOrder = openWhatsAppOrder;
window.openWhatsAppForOutsideBoundary = openWhatsAppForOutsideBoundary;
window.openWhatsAppManual = openWhatsAppManual;

// Debug functions (remove in production)
window.debugLocation = () => {
    console.log('Current location state:', locationState);
    console.log('SHOP_LOCATION:', SHOP_LOCATION);
    console.log('AHMEDABAD_BOUNDARY points:', AHMEDABAD_BOUNDARY.length);
};

window.testLocation = (lat, lon) => {
    locationState.userLocation = { lat, lon };
    locationState.isVerified = true;
    locationState.isInAhmedabad = isPointInAhmedabad(lat, lon);
    locationState.distance = calculateDistance(lat, lon, SHOP_LOCATION.lat, SHOP_LOCATION.lon);
    locationState.deliveryCharge = calculateDeliveryCharge(locationState.distance);
    locationState.isInDeliveryBoundary = isInDeliveryBoundary(locationState.distance);
    
    console.log('Test result:', locationState);
    updateProductButtons();
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    if (e.error && e.error.message && 
        (e.error.message.includes('geolocation') || 
         e.error.message.includes('location'))) {
        
        showLocationModal(
            '⚠️ Technical Error',
            'There was a technical issue with location detection.\n\nPlease try again or contact us manually.',
            [
                { text: '🔄 Try Again', onclick: requestLocation, class: 'btn-primary' },
                { text: '📱 Contact Us', onclick: openWhatsAppManual, class: 'btn-whatsapp' }
            ]
        );
    }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !locationState.isVerified) {
        // Re-show banner when user returns to tab
        setTimeout(showLocationBanner, 1000);
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('🌐 Back online');
    if (!locationState.isVerified && locationState.verificationAttempts < locationState.maxAttempts) {
        setTimeout(() => {
            showLocationModal(
                '🌐 Connection Restored',
                'Internet connection is back! Location detection may work better now.',
                [
                    { text: '🔄 Try Location', onclick: requestLocation, class: 'btn-primary' },
                    { text: 'Skip', onclick: closeLocationModal, class: 'btn-outline' }
                ]
            );
        }, 1000);
    }
});

window.addEventListener('offline', () => {
    console.log('📵 Gone offline');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Clean up any timers or intervals
    document.body.style.overflow = '';
});

console.log(`
🧸 AbuToys Enhanced Location-Based Ordering System
📍 Shop Location: ${SHOP_LOCATION.address}
🏙️ Delivery Area: Ahmedabad Municipal Corporation
📏 Max Distance: 100km
💰 Delivery Charges: ₹40 for 1st km, ₹10 per additional km

🔧 Debug Commands:
- debugLocation(): Show current state
- testLocation(lat, lon): Test with coordinates  
- requestLocation(): Trigger location check manually

📋 Features:
✅ Ahmedabad boundary verification using point-in-polygon
✅ Distance calculation using Haversine formula
✅ Dynamic delivery charge calculation (Math.ceil)
✅ Session storage for location data
✅ WhatsApp integration with prefilled messages
✅ Responsive mobile-friendly design
✅ Error handling and fallbacks
`);
