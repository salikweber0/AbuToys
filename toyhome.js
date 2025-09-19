// =================== WELCOME FUNCTION ===================
let hasVisited = localStorage.getItem('abutoys_visited');

function showWelcomeMessage() {
    // Only show if user hasn't visited before
    if (!hasVisited) {
        setTimeout(() => {
            const welcomePopup = document.createElement('div');
            welcomePopup.id = 'welcome-popup';
            welcomePopup.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85); display: flex; align-items: center;
                justify-content: center; z-index: 10001; opacity: 0;
                transition: opacity 0.3s ease; backdrop-filter: blur(5px);
            `;

            welcomePopup.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    padding: 3rem; border-radius: 25px; max-width: 450px; width: 90%;
                    text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    color: white; position: relative; overflow: hidden;
                ">
                    <div style="
                        position: absolute; top: -50px; right: -50px; width: 100px; height: 100px;
                        background: rgba(255, 255, 255, 0.1); border-radius: 50%;
                    "></div>
                    <div style="
                        position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px;
                        background: rgba(255, 255, 255, 0.1); border-radius: 50%;
                    "></div>
                    
                    <div style="font-size: 3.5rem; margin-bottom: 1.5rem; animation: bounce 2s infinite;">🧸</div>
                    <h2 style="font-family: 'Fredoka One', cursive; font-size: 2.2rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        Welcome to AbuToys!
                    </h2>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem; line-height: 1.6; opacity: 0.9;">
                        🎯 Best Toys for Happy Kids in Ahmedabad<br>
                        ✨ Quality • Safety • Happiness
                    </p>
                    <button onclick="closeWelcomePopup()" style="
                        padding: 15px 35px; background: rgba(255, 255, 255, 0.2);
                        color: white; border: 2px solid white; border-radius: 30px;
                        cursor: pointer; font-size: 1.1rem; font-weight: 600;
                        transition: all 0.3s ease; backdrop-filter: blur(10px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='scale(1.05)'"
                       onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='scale(1)'">
                        🎉 Let's Explore!
                    </button>
                </div>
            `;

            document.body.appendChild(welcomePopup);
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => welcomePopup.style.opacity = '1', 100);
            
            // Mark as visited
            localStorage.setItem('abutoys_visited', 'true');
            
        }, 1000);
    }
}

function closeWelcomePopup() {
    const popup = document.getElementById('welcome-popup');
    if (popup) {
        popup.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => popup.remove(), 300);
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

// =================== MOBILE-OPTIMIZED LOCATION SYSTEM FROM TOYPRODUCT.JS ===================
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
                    '✅ Perfect! You are in Ahmedabad.\n\n🎯 Location verified successfully!\n\nNow you can explore our products.',
                    [{ text: '🎉 Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
                
                setTimeout(hideMobileLocationPopup, 4000);
                
            } else {
                showMobileLocationPopup(
                    '😞 Sorry! You are not in Ahmedabad city.\n\n🚚 We only deliver toys in Ahmedabad.\n\n📜 We will add other cities soon!',
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
                    errorMsg = `🚫 Location permission denied!\n\n📱 Steps to enable on mobile:\n\n1️⃣ Go to browser menu (☰)\n2️⃣ Open "Site settings" or "Permissions"\n3️⃣ Set "Location" to "Allow"\n4️⃣ Refresh page\n\n🔄 Or turn on location in your phone's main settings.`;
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

// Create location banner
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
                Please allow location to place orders
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

// =================== SEARCH FUNCTIONALITY ===================
function filterProducts(searchTerm) {
    // This will be used when search is implemented
    console.log('Search term:', searchTerm);
}

const searchInputs = document.querySelectorAll('.search-input, #mobile-search-input, input[type="search"]');
searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });
    
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
            searchInput.click();
        }
    });
    
    mobileSearchOverlay.addEventListener('click', (e) => {
        if (e.target === mobileSearchOverlay) {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        }
    });
}

// =================== NEWSLETTER FUNCTIONALITY ===================
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

// =================== CONTACT FORM FUNCTIONALITY ===================
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

// =================== ENHANCED GALLERY LIGHTBOX ===================
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
                <button onclick="this.parentElement.parentElement.remove(); document.body.style.overflow='';" style="
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
                " alt="Gallery Image">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        setTimeout(() => lightbox.style.opacity = '1', 10);
        
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
    position: fixed; bottom: ${isMobileDevice() ? '15px' : '20px'}; 
    right: 20px; width: ${isMobileDevice() ? '55px' : '50px'}; 
    height: ${isMobileDevice() ? '55px' : '50px'};
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white;
    border: none; border-radius: 50%; cursor: pointer; 
    font-size: ${isMobileDevice() ? '1.3rem' : '1.2rem'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); opacity: 0; transform: scale(0);
    transition: all 0.3s ease; z-index: 1000; backdrop-filter: blur(10px);
`;

document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    const scrollThreshold = isMobileDevice() ? 300 : 500;
    
    if (window.scrollY > scrollThreshold) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.transform = 'scale(1)';
        
        if (responsiveSearchBtn) {
            responsiveSearchBtn.style.opacity = '1';
            responsiveSearchBtn.style.transform = 'scale(1)';
        }
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0)';
        
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
    
    if (isMobileDevice() && navigator.vibrate) {
        navigator.vibrate(30);
    }
});

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
    console.log('🧸 AbuToys Home Page Loading...');
    
    // Show welcome message for new users
    showWelcomeMessage();
    
    // Mobile detection and optimization
    const isMobile = isMobileDevice();
    console.log('📱 Device Type:', isMobile ? 'Mobile' : 'Desktop');
    optimizeForMobile();
    
    // Setup error handlers
    handleLocationErrors();
    
    // Show location banner for mobile users (delayed to not interfere with welcome)
    if (isMobile) {
        console.log('📱 Mobile detected - showing location banner');
        setTimeout(createLocationBanner, 5000); // Delayed after welcome
    } else {
        console.log('💻 Desktop detected - auto location check');
        setTimeout(() => {
            if (!locationCheckAttempted) {
                requestMobileLocation();
            }
        }, 3000); // Delayed after welcome
    }
    
    console.log('✅ AbuToys Home Page Ready!');
});

// =================== GLOBAL FUNCTIONS ===================
window.requestMobileLocation = requestMobileLocation;
window.hideMobileLocationPopup = hideMobileLocationPopup;
window.hideBanner = hideBanner;
window.manualWhatsApp = manualWhatsApp;
window.isMobileDevice = isMobileDevice;
window.closeWelcomePopup = closeWelcomePopup;

// =================== GLOBAL ERROR HANDLER ===================
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (e.error && e.error.message && (e.error.message.includes('geolocation') || e.error.message.includes('location'))) {
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
🧸 AbuToys Home Page - Enhanced System
📱 Mobile Detection: ${isMobileDevice()}
🔒 HTTPS Status: ${location.protocol === 'https:'}
📍 Geolocation Support: ${!!navigator.geolocation}
🌐 Hostname: ${location.hostname}
📐 Viewport: ${window.innerWidth}x${window.innerHeight}
👆 Touch Support: ${'ontouchstart' in window}

✨ Features:
- Welcome message for new visitors
- Location verification system
- Mobile-optimized interactions
- Gallery lightbox viewer
- Newsletter subscription
- Contact form handling
- Back to top functionality
- Performance optimizations
`);
