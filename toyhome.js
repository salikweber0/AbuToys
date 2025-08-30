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
    
    // Prevent scrolling when popup is open
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => popup.style.opacity = '1', 10);
}

function hideMobileLocationPopup() {
    const popup = document.getElementById('location-popup');
    if (popup) {
        popup.style.opacity = '0';
        document.body.style.overflow = ''; // Restore scrolling
        setTimeout(() => popup.remove(), 300);
    }
}

// Main mobile location function with enhanced error handling
async function requestMobileLocation() {
    hideBanner();
    locationAttempts++;
    
    console.log(`Location attempt #${locationAttempts}`);
    
    // Check if geolocation is supported
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

    // Check HTTPS requirement
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

    // Check permission status first
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

    // Show loading with better mobile UX
    showMobileLocationPopup(`📍 Detecting location...\n\n${isMobileDevice() ? '📱 Mobile detected' : '💻 Desktop detected'}\n\nPlease click "Allow" when browser asks.`);

    // Enhanced location options for mobile
    const locationOptions = {
        enableHighAccuracy: isMobileDevice() ? false : true, // Save battery on mobile
        timeout: isMobileDevice() ? 20000 : 15000, // Give more time on mobile
        maximumAge: 300000 // 5 minutes cache
    };

    // Add timeout handling
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
            
            // Ahmedabad bounds - extra generous for mobile GPS accuracy
            const ahmedabadBounds = {
                north: 23.40,   // More generous bounds
                south: 22.60,
                east: 73.00,
                west: 72.10
            };
            
            // Check if within Ahmedabad
            if (lat >= ahmedabadBounds.south && lat <= ahmedabadBounds.north &&
                lon >= ahmedabadBounds.west && lon <= ahmedabadBounds.east) {
                
                isAhmedabadUser = true;
                showMobileLocationPopup(
                    '✅ Perfect! You are in Ahmedabad.\n\n🎯 Location verified successfully!\n\nNow you can use all features.',
                    [{ text: '🎉 Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
                
                // Auto-hide after success
                setTimeout(hideMobileLocationPopup, 4000);
                
            } else {
                isAhmedabadUser = false;
                
                // Distance calculation for better UX
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
    const R = 6371; // Earth's radius in km
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
    // Check if location was attempted
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
    
    // Execute the action
    if (actionType === 'whatsapp') {
        let userName = '';
        
        // Mobile-friendly name input
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
            
            const whatsappURL = `https://wa.me/918160154042?text=${encodeURIComponent(message)}`;
            
            // Open WhatsApp
            if (isMobileDevice()) {
                // Try to open in WhatsApp app on mobile
                window.location.href = whatsappURL;
            } else {
                window.open(whatsappURL, '_blank');
            }
            
        } else {
            alert('Please enter your name! 😊');
        }
        
    } else if (actionType === 'call') {
        if (isMobileDevice()) {
            // Direct call on mobile
            window.location.href = 'tel:+918160154042';
        } else {
            // Show number on desktop
            showMobileLocationPopup(
                '📞 Our Contact Number:\n\n+91 8160154042\n\n💻 Dial from your mobile phone from desktop.',
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
        navigator.clipboard.writeText('+918160154042').then(() => {
            alert('📋 Phone number copied! Now dial from your phone.');
            hideMobileLocationPopup();
        });
    } else {
        // Fallback for older browsers
        alert('📞 Number: +918160154042 (dial manually)');
        hideMobileLocationPopup();
    }
}

// =================== BUTTON SETUP ===================
function setupAllButtons() {
    console.log('🔧 Setting up all buttons...');
    
    // WhatsApp buttons
    const whatsappSelectors = [
        '#whatsapp-btn',
        '.btn-whatsapp',
        'a[href*="wa.me"]',
        '.whatsapp-btn'
    ];
    
    whatsappSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.removeAttribute('href');
            btn.removeAttribute('onclick');
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('WhatsApp button clicked');
                executeAction('whatsapp');
            });
        });
    });

    // Call buttons
    const callSelectors = [
        '#callAhmedabad',
        '.btn-call',
        'a[href*="tel:"]',
        '.call-btn'
    ];
    
    callSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.removeAttribute('href');
            btn.removeAttribute('onclick');
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Call button clicked');
                executeAction('call');
            });
        });
    });

    // Order/Buy buttons with product context
    const orderSelectors = [
        '.btn-small',
        '.order-btn',
        '.buy-btn',
        '.btn-order'
    ];
    
    orderSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            const parentCard = btn.closest('.product-card') || btn.closest('.card') || btn.parentElement;
            let productName = 'Product';
            
            if (parentCard) {
                const nameElement = parentCard.querySelector('h3') || 
                                  parentCard.querySelector('h4') || 
                                  parentCard.querySelector('.product-name') ||
                                  parentCard.querySelector('.card-title');
                if (nameElement) {
                    productName = nameElement.textContent.trim();
                }
            }
            
            btn.removeAttribute('onclick');
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Order button clicked for: ${productName}`);
                executeAction('whatsapp', productName);
            });
        });
    });
    
    console.log('✅ All buttons setup complete');
}

// =================== MOBILE LOCATION BANNER ===================
function createLocationBanner() {
    // Check if banner already exists or location already checked
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
                Please allow location so we can serve you
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
    
    // Show banner with animation
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 1000);
    
    // Auto-hide banner after 30 seconds if no interaction
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

// Manual contact option (enhanced for mobile)
function manualWhatsApp() {
    hideMobileLocationPopup();
    
    const userName = isMobileDevice() ? 
        prompt('🧸 Tell us your name:') || 'Customer' :
        prompt('Tell us your name:') || 'Customer';
        
    if (userName && userName.trim()) {
        const message = `Hi! 👋 I am ${userName.trim()}.

📍 Please confirm if I am in Ahmedabad or not.

🧸 I am interested in your toys.`;
        const whatsappURL = `https://wa.me/918160154042?text=${encodeURIComponent(message)}`;
        
        if (isMobileDevice()) {
            window.location.href = whatsappURL;
        } else {
            window.open(whatsappURL, '_blank');
        }
    }
}

// =================== SEARCH FUNCTIONALITY ===================
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    products.forEach(product => {
        const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = product.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
            product.style.display = 'block';
            foundProducts++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Show results count
    if (searchTerm) {
        const resultsMsg = foundProducts > 0 ? 
            `🔍 ${foundProducts} products found for "${searchTerm}"` :
            `😔 No product found for "${searchTerm}". Try searching something else.`;
        
        // Show temporary result message
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
        
        // Auto-hide result message
        setTimeout(() => {
            if (resultDiv) resultDiv.remove();
        }, 3000);
    }
}

// Search inputs setup
const searchInputs = document.querySelectorAll('.search-input, #mobile-search-input, input[type="search"]');
searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });
    
    // Enter key support
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
        }
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
            // Trigger keyboard on mobile
            searchInput.click();
        }
    });
    
    // Close overlay on background click
    mobileSearchOverlay.addEventListener('click', (e) => {
        if (e.target === mobileSearchOverlay) {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        }
    });
    
    // Close button for mobile search
    const mobileSearchClose = document.getElementById('mobile-search-close');
    if (mobileSearchClose) {
        mobileSearchClose.addEventListener('click', () => {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        });
    }
}

// =================== ENHANCED MOBILE FEATURES ===================

// Mobile performance optimization
function optimizeForMobile() {
    if (isMobileDevice()) {
        // Reduce animations on mobile for better performance
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        // Add mobile-specific styles
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                * { -webkit-tap-highlight-color: transparent; }
                button, .btn { min-height: 44px; min-width: 44px; }
                input, textarea { font-size: 16px !important; } /* Prevent zoom on iOS */
            }
        `;
        document.head.appendChild(mobileStyles);
        
        console.log('📱 Mobile optimizations applied');
    }
}

// Enhanced error recovery for mobile
function handleLocationErrors() {
    // Listen for orientation changes that might affect GPS
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
    
    // Listen for network changes
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

// =================== OTHER FUNCTIONALITY ===================

// Newsletter with mobile optimization
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

// Contact form with mobile optimization
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

// Enhanced wishlist functionality
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
        
        // Mobile feedback
        this.style.transform = 'scale(1.4)';
        setTimeout(() => this.style.transform = 'scale(1)', 200);
        
        if (isMobileDevice()) {
            // Mobile haptic feedback (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    });
});

// Enhanced gallery lightbox with mobile support
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
            transition: opacity 0.3s ease; backdrop-filter: blur(5px);
        `;
        
        lightbox.innerHTML = `
            <div style="position: relative; max-width: 95%; max-height: 95%; display: flex; align-items: center; justify-content: center;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    position: absolute; top: -50px; right: -10px; color: white;
                    font-size: ${isMobileDevice() ? '2.5rem' : '2rem'}; cursor: pointer; 
                    background: rgba(255, 255, 255, 0.2); border: none;
                    border-radius: 50%; width: ${isMobileDevice() ? '50px' : '40px'}; 
                    height: ${isMobileDevice() ? '50px' : '40px'};
                    display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(10px); z-index: 10000;
                ">×</button>
                <img src="${img.src}" style="
                    max-width: 100%; max-height: 100%; border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                " alt="Product Image">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        setTimeout(() => lightbox.style.opacity = '1', 10);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                document.body.style.overflow = '';
                lightbox.remove();
            }
        });
        
        // Mobile-specific: swipe to close
        if (isMobileDevice()) {
            let startY = 0;
            lightbox.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            });
            
            lightbox.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                const diffY = startY - endY;
                
                // Swipe up or down to close
                if (Math.abs(diffY) > 50) {
                    document.body.style.overflow = '';
                    lightbox.remove();
                }
            });
        }
    });
});

// Enhanced back to top button with mobile optimization
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.style.cssText = `
    position: fixed; bottom: ${isMobileDevice() ? '80px' : '20px'}; 
    right: 20px; width: ${isMobileDevice() ? '55px' : '50px'}; 
    height: ${isMobileDevice() ? '55px' : '50px'};
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white;
    border: none; border-radius: 50%; cursor: pointer; 
    font-size: ${isMobileDevice() ? '1.3rem' : '1.2rem'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); opacity: 0; transform: scale(0);
    transition: all 0.3s ease; z-index: 1000; backdrop-filter: blur(10px);
`;

document.body.appendChild(backToTopButton);

// Show/hide back to top with mobile-optimized scroll detection
window.addEventListener('scroll', () => {
    const scrollThreshold = isMobileDevice() ? 300 : 500;
    
    if (window.scrollY > scrollThreshold) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.transform = 'scale(1)';
        backToTopButton.style.bottom = isMobileDevice() ? '10px' : '0';
        
        if (responsiveSearchBtn) {
            responsiveSearchBtn.style.opacity = '1';
            responsiveSearchBtn.style.transform = 'scale(1)';
        }
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0)';
        backToTopButton.style.bottom = isMobileDevice() ? '10px' : '0';
        
        if (responsiveSearchBtn) {
            responsiveSearchBtn.style.opacity = '0';
            responsiveSearchBtn.style.transform = 'scale(0)';
        }
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
    
    // Mobile haptic feedback
    if (isMobileDevice() && navigator.vibrate) {
        navigator.vibrate(30);
    }
});

// =================== MOBILE DEBUGGING & DIAGNOSTICS ===================
function runMobileDiagnostics() {
    const diagnostics = {
        isMobile: isMobileDevice(),
        hasGeolocation: !!navigator.geolocation,
        isHTTPS: location.protocol === 'https:',
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        touchSupport: 'ontouchstart' in window,
        permissionAPI: 'permissions' in navigator,
        hostname: location.hostname,
        protocol: location.protocol
    };
    
    console.log('🔧 Mobile Diagnostics:', diagnostics);
    return diagnostics;
}

// Add diagnostic button for testing (remove in production)
function addDiagnosticButton() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const diagBtn = document.createElement('button');
        diagBtn.textContent = '🔧 Test Location';
        diagBtn.style.cssText = `
            position: fixed; bottom: 150px; left: 20px; padding: 10px;
            background: #333; color: white; border: none; border-radius: 5px;
            cursor: pointer; z-index: 1001; font-size: 0.8rem;
        `;
        diagBtn.onclick = () => {
            console.log('🔧 Running diagnostics...');
            runMobileDiagnostics();
            requestMobileLocation();
        };
        document.body.appendChild(diagBtn);
    }
}

// =================== INITIALIZATION WITH MOBILE DETECTION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧸 AbuToys Mobile-Optimized Version Loading...');
    
    // Run diagnostics
    const diag = runMobileDiagnostics();
    console.log('📱 Device Type:', diag.isMobile ? 'Mobile' : 'Desktop');
    console.log('🌐 Environment:', diag.isHTTPS ? 'HTTPS ✅' : 'HTTP ❌');
    console.log('📍 Geolocation:', diag.hasGeolocation ? 'Supported ✅' : 'Not Supported ❌');
    
    // Apply mobile optimizations
    optimizeForMobile();
    
    // Setup error handlers
    handleLocationErrors();
    
    // Setup all buttons
    setupAllButtons();
    
    // Add diagnostic button in development
    addDiagnosticButton();
    
    // Show location banner based on device type
    if (isMobileDevice()) {
        // User-initiated location request on mobile
        console.log('📱 Mobile detected - showing location banner');
        setTimeout(createLocationBanner, 2500);
    } else {
        // Auto-check on desktop but with delay
        console.log('💻 Desktop detected - auto location check');
        setTimeout(() => {
            if (!locationCheckAttempted) {
                requestMobileLocation();
            }
        }, 2000);
    }
    
    console.log('✅ AbuToys Mobile System Ready!');
});

// =================== GLOBAL FUNCTIONS ===================
// Make functions globally accessible
window.requestMobileLocation = requestMobileLocation;
window.hideMobileLocationPopup = hideMobileLocationPopup;
window.hideBanner = hideBanner;
window.manualWhatsApp = manualWhatsApp;
window.executeAction = executeAction;
window.copyPhoneNumber = copyPhoneNumber;
window.runMobileDiagnostics = runMobileDiagnostics;
window.isMobileDevice = isMobileDevice;

// =================== ERROR HANDLING & FALLBACKS ===================
// Global error handler
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

// Final mobile compatibility check
(function() {
    const issues = [];
    
    if (!navigator.geolocation) issues.push('No Geolocation API');
    if (location.protocol !== 'https:' && !location.hostname.includes('localhost')) issues.push('Not HTTPS');
    if (!isMobileDevice() && window.innerWidth <= 480) issues.push('Small screen detected');
    
    if (issues.length > 0) {
        console.warn('⚠️ Potential mobile issues:', issues);
    } else {
        console.log('✅ Mobile compatibility check passed');
    }
})();

// Debug info with enhanced mobile details
console.log(`
🧸 AbuToys - Enhanced Mobile Location System
📱 Mobile Detection: ${isMobileDevice()}
🔒 HTTPS Status: ${location.protocol === 'https:'}
📍 Geolocation Support: ${!!navigator.geolocation}
🌐 Hostname: ${location.hostname}
📏 Viewport: ${window.innerWidth}x${window.innerHeight}
👆 Touch Support: ${'ontouchstart' in window}
🔧 Debug Mode: ${location.hostname.includes('localhost') ? 'ON' : 'OFF'}

📋 Manual Testing Commands:
- requestMobileLocation() : Test location manually
- runMobileDiagnostics() : Show device info  
- manualWhatsApp() : Direct WhatsApp contact
`);
