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

// =================== MOBILE-FRIENDLY LOCATION SYSTEM ===================
let isLocationAllowed = false;
let isAhmedabadUser = false;
let locationCheckAttempted = false;

// Better mobile location popup
function showMobileLocationPopup(message, buttons = []) {
    const existingPopup = document.getElementById('location-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'location-popup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
        justify-content: center; z-index: 10001; opacity: 0;
        transition: opacity 0.3s ease;
    `;

    let buttonsHTML = '';
    buttons.forEach(btn => {
        buttonsHTML += `<button onclick="${btn.action}" style="
            padding: 12px 24px; margin: 5px; background: ${btn.color || '#FF6B6B'};
            color: white; border: none; border-radius: 25px; cursor: pointer;
            font-size: 1rem; font-weight: 500; transition: all 0.3s ease;
        ">${btn.text}</button>`;
    });

    popup.innerHTML = `
        <div style="
            background: white; padding: 2rem; border-radius: 20px;
            max-width: 350px; width: 90%; text-align: center;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        ">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📱</div>
            <p style="
                font-family: 'Poppins', sans-serif; font-size: 1rem;
                margin-bottom: 1.5rem; color: #333; line-height: 1.6;
            ">${message}</p>
            ${buttonsHTML}
        </div>
    `;

    document.body.appendChild(popup);
    setTimeout(() => popup.style.opacity = '1', 10);
}

function hideMobileLocationPopup() {
    const popup = document.getElementById('location-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

// Mobile-optimized location check
function requestMobileLocation() {
    if (!navigator.geolocation) {
        showMobileLocationPopup(
            'माफ करें! आपका browser location support नहीं करता।',
            [{ text: 'OK', action: 'hideMobileLocationPopup()' }]
        );
        return;
    }

    // Check if HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        showMobileLocationPopup(
            'Location केवल secure (HTTPS) websites पर काम करती है।',
            [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
        );
        return;
    }

    showMobileLocationPopup('📍 Location access की permission दे रहे हैं...');

    const options = {
        enableHighAccuracy: false, // Mobile pe battery save करने के लिए
        timeout: 30000, // 30 seconds timeout
        maximumAge: 600000 // 10 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isLocationAllowed = true;
            locationCheckAttempted = true;
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log(`Mobile location: ${lat}, ${lon}`);
            
            // Ahmedabad check with generous bounds
            if (lat >= 22.8 && lat <= 23.3 && lon >= 72.3 && lon <= 72.8) {
                isAhmedabadUser = true;
                showMobileLocationPopup(
                    '✅ Location verified!\nअब आप सभी features use कर सकते हैं।',
                    [{ text: 'Great!', action: 'hideMobileLocationPopup()' }]
                );
                setTimeout(hideMobileLocationPopup, 3000);
            } else {
                isAhmedabadUser = false;
                showMobileLocationPopup(
                    'माफ करें! हम सिर्फ अहमदाबाद में ही service देते हैं।\n\nSorry! We only serve Ahmedabad customers.',
                    [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
                );
            }
        },
        (error) => {
            isLocationAllowed = false;
            locationCheckAttempted = true;
            
            let errorMsg = '';
            let buttons = [];
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = `Mobile में location permission दें:\n\n1. Browser के address bar में 🔒 lock icon पर tap करें\n2. Location को "Allow" करें\n3. Page refresh करें`;
                    buttons = [
                        { text: 'Refresh करें', action: 'location.reload()', color: '#4ECDC4' },
                        { text: 'बाद में', action: 'hideMobileLocationPopup()' }
                    ];
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'GPS signal नहीं मिल रही। कृपया:\n\n• GPS on करें\n• Open area में जाएं\n• Network connection check करें';
                    buttons = [{ text: 'फिर Try करें', action: 'requestMobileLocation()' }];
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location detect करने में time लग रहा।\nकृपया फिर try करें।';
                    buttons = [{ text: 'फिर Try करें', action: 'requestMobileLocation()' }];
                    break;
                default:
                    errorMsg = 'Location में technical problem है।';
                    buttons = [{ text: 'OK', action: 'hideMobileLocationPopup()' }];
            }
            
            showMobileLocationPopup(errorMsg, buttons);
        },
        options
    );
}

// =================== BUTTON ACTIONS ===================
function executeAction(actionType, productName = '') {
    // Check if location was attempted
    if (!locationCheckAttempted) {
        showMobileLocationPopup(
            'पहले location permission दें ताकि हम verify कर सकें कि आप अहमदाबाद में हैं।',
            [
                { text: 'Location Allow करें', action: 'requestMobileLocation()', color: '#4ECDC4' },
                { text: 'Cancel', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }
    
    if (!isLocationAllowed) {
        showMobileLocationPopup(
            'Location permission नहीं मिली।\nकृपया manually settings में allow करें।',
            [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
        );
        return;
    }
    
    if (!isAhmedabadUser) {
        showMobileLocationPopup(
            'माफ करें! आप अहमदाबाद city में नहीं हैं।\nहम सिर्फ अहमदाबाद में ही delivery करते हैं।',
            [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
        );
        return;
    }
    
    // Execute the action
    if (actionType === 'whatsapp') {
        const userName = prompt('अपना नाम बताएं:');
        if (userName) {
            let message = `Hi, मैं ${userName} हूं अहमदाबाद से।`;
            if (productName) {
                message += ` मुझे ${productName} order करना है।`;
            } else {
                message += ` मुझे आपके toys में interest है।`;
            }
            const whatsappURL = `https://wa.me/918160154042?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');
        }
    } else if (actionType === 'call') {
        // Mobile detection
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mobile pe direct call
            window.location.href = 'tel:+918160154042';
        } else {
            alert('📞 कृपया +91 8160154042 पर call करें (अपने mobile से dial करें)');
        }
    }
}

// =================== BUTTON SETUP ===================
function setupAllButtons() {
    // WhatsApp buttons
    const whatsappSelectors = [
        '#whatsapp-btn',
        '.btn-whatsapp',
        'a[href*="wa.me"]'
    ];
    
    whatsappSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.removeAttribute('href');
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                executeAction('whatsapp');
            });
        });
    });

    // Call buttons
    const callSelectors = [
        '#callAhmedabad',
        '.btn-call',
        'a[href*="tel:"]'
    ];
    
    callSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.removeAttribute('href');
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                executeAction('call');
            });
        });
    });

    // Order buttons (WhatsApp with product)
    document.querySelectorAll('.btn-small').forEach(btn => {
        const parentCard = btn.closest('.product-card');
        if (parentCard) {
            const productName = parentCard.querySelector('h3')?.textContent || 'Product';
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                executeAction('whatsapp', productName);
            });
        }
    });
}

// =================== MOBILE LOCATION PERMISSION BANNER ===================
function createLocationBanner() {
    // Check if banner already exists
    if (document.getElementById('location-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'location-banner';
    banner.style.cssText = `
        position: fixed; top: 80px; left: 0; right: 0; 
        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        color: white; padding: 15px; text-align: center; z-index: 999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(-100%); transition: transform 0.3s ease;
    `;
    
    banner.innerHTML = `
        <div style="font-size: 0.95rem; margin-bottom: 10px;">
            📍 <strong>Location Required</strong><br>
            कृपया location allow करें ताकि हम आपको serve कर सकें
        </div>
        <button onclick="requestMobileLocation()" style="
            padding: 8px 20px; background: rgba(255, 255, 255, 0.2);
            color: white; border: 1px solid white; border-radius: 20px;
            cursor: pointer; font-size: 0.9rem; margin-right: 10px;
        ">Allow Location</button>
        <button onclick="hideBanner()" style="
            padding: 8px 20px; background: transparent;
            color: white; border: 1px solid white; border-radius: 20px;
            cursor: pointer; font-size: 0.9rem;
        ">Close</button>
    `;
    
    document.body.appendChild(banner);
    
    // Show banner after delay
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 1000);
}

function hideBanner() {
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 300);
    }
}

// =================== IMPROVED MOBILE LOCATION CHECK ===================
function requestMobileLocation() {
    // Hide banner first
    hideBanner();
    
    if (!navigator.geolocation) {
        showMobileLocationPopup(
            'आपका phone/browser location support नहीं करता।\n\nकृपया manual contact करें।',
            [
                { text: 'WhatsApp करें', action: 'manualWhatsApp()', color: '#25D366' },
                { text: 'Close', action: 'hideMobileLocationPopup()' }
            ]
        );
        return;
    }

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        showMobileLocationPopup(
            'Location सिर्फ secure (HTTPS) websites पर काम करती है।\n\nकृपया HTTPS version use करें।',
            [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
        );
        return;
    }

    showMobileLocationPopup('📍 Location permission दे रहे हैं...\n\nकृपया "Allow" दबाएं।');

    const locationOptions = {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isLocationAllowed = true;
            locationCheckAttempted = true;
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log(`Mobile location success: ${lat}, ${lon}`);
            
            // Generous Ahmedabad bounds for mobile accuracy
            const ahmedabadBounds = {
                north: 23.35,   // Extended bounds
                south: 22.70,
                east: 72.90,
                west: 72.20
            };
            
            if (lat >= ahmedabadBounds.south && lat <= ahmedabadBounds.north &&
                lon >= ahmedabadBounds.west && lon <= ahmedabadBounds.east) {
                
                isAhmedabadUser = true;
                showMobileLocationPopup(
                    '✅ Perfect! आप अहमदाबाद में हैं।\n\nअब आप सभी features use कर सकते हैं।',
                    [{ text: 'Great!', action: 'hideMobileLocationPopup()', color: '#4CAF50' }]
                );
                setTimeout(hideMobileLocationPopup, 3000);
                
            } else {
                isAhmedabadUser = false;
                showMobileLocationPopup(
                    'माफ करें! आप अहमदाबाद city में नहीं हैं।\n\nहम सिर्फ अहमदाबाद में ही toys deliver करते हैं।',
                    [{ text: 'समझ गया', action: 'hideMobileLocationPopup()' }]
                );
            }
        },
        (error) => {
            isLocationAllowed = false;
            locationCheckAttempted = true;
            
            let errorMsg = '';
            let buttons = [];
            
            if (error.code === error.PERMISSION_DENIED) {
                errorMsg = `Location permission नहीं दी गई!\n\nMobile में location enable करने के लिए:\n\n1. Browser के address bar में 🔒 पर tap करें\n2. "Location" को "Allow" करें\n3. Page refresh करें\n\nया फिर phone settings में भी location on करें।`;
                buttons = [
                    { text: 'Refresh करें', action: 'location.reload()', color: '#4ECDC4' },
                    { text: 'Manual Contact', action: 'manualWhatsApp()', color: '#25D366' },
                    { text: 'Close', action: 'hideMobileLocationPopup()' }
                ];
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMsg = 'GPS signal नहीं मिल रही।\n\nकृपया:\n• GPS on करें\n• Open area में जाएं\n• Network check करें';
                buttons = [
                    { text: 'फिर Try करें', action: 'requestMobileLocation()', color: '#FF6B6B' },
                    { text: 'Manual Contact', action: 'manualWhatsApp()', color: '#25D366' }
                ];
            } else {
                errorMsg = 'Location detect नहीं हो रही।\n\nकृपया manual contact करें।';
                buttons = [
                    { text: 'WhatsApp करें', action: 'manualWhatsApp()', color: '#25D366' },
                    { text: 'Close', action: 'hideMobileLocationPopup()' }
                ];
            }
            
            showMobileLocationPopup(errorMsg, buttons);
        },
        locationOptions
    );
}

// Manual contact option (backup)
function manualWhatsApp() {
    hideMobileLocationPopup();
    const userName = prompt('अपना नाम और area बताएं:');
    if (userName) {
        const message = `Hi, मैं ${userName} हूं। कृपया confirm करें कि मैं अहमदाबाद में हूं या नहीं।`;
        window.open(`https://wa.me/918160154042?text=${encodeURIComponent(message)}`, '_blank');
    }
}

// =================== SEARCH FUNCTIONALITY ===================
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    products.forEach(product => {
        const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
        if (name.includes(searchTerm)) {
            product.style.display = 'block';
            foundProducts++;
        } else {
            product.style.display = 'none';
        }
    });
    
    if (searchTerm && foundProducts === 0) {
        alert('कोई product नहीं मिला। कुछ और search करें।');
    }
}

// Search inputs
const searchInputs = document.querySelectorAll('.search-input, #mobile-search-input');
searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        filterProducts(this.value.toLowerCase());
    });
});

// Mobile search overlay
const responsiveSearchBtn = document.getElementById('responsive-search-btn');
const mobileSearchOverlay = document.getElementById('mobile-search-overlay');

if (responsiveSearchBtn && mobileSearchOverlay) {
    responsiveSearchBtn.addEventListener('click', () => {
        mobileSearchOverlay.style.display = 'flex';
        setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
        document.getElementById('mobile-search-input')?.focus();
    });
    
    mobileSearchOverlay.addEventListener('click', (e) => {
        if (e.target === mobileSearchOverlay) {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        }
    });
}

// =================== OTHER FUNCTIONALITY ===================

// Newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            alert('Thank you for subscribing!');
            this.reset();
        }
    });
}

// Contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Message sent! हम जल्दी reply करेंगे।');
        this.reset();
    });
}

// Wishlist
document.querySelectorAll('.wishlist-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        this.style.color = this.style.color === 'red' ? '#FF6B6B' : 'red';
        this.style.transform = 'scale(1.3)';
        setTimeout(() => this.style.transform = 'scale(1)', 200);
    });
});

// Gallery lightbox
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        if (!img) return;
        
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.9); display: flex; align-items: center;
            justify-content: center; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
        `;
        
        lightbox.innerHTML = `
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                <span onclick="this.parentElement.parentElement.remove()" style="
                    position: absolute; top: -40px; right: -40px; color: white;
                    font-size: 2rem; cursor: pointer; background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%; width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                ">×</span>
                <img src="${img.src}" style="max-width: 100%; max-height: 100%; border-radius: 10px;">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        setTimeout(() => lightbox.style.opacity = '1', 10);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.remove();
        });
    });
});

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px;
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white;
    border: none; border-radius: 50%; cursor: pointer; font-size: 1.2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); opacity: 0; transform: scale(0);
    transition: all 0.3s ease; z-index: 1000;
`;

document.body.appendChild(backToTopButton);

// Show/hide back to top
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧸 AbuToys Mobile-Optimized Version Loaded');
    
    // Setup all buttons first
    setupAllButtons();
    
    // For mobile devices, show location banner instead of auto-check
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Mobile pe banner show karo, auto-check nahi
        setTimeout(createLocationBanner, 2000);
    } else {
        // Desktop pe auto-check kar sakte hain
        setTimeout(requestMobileLocation, 1500);
    }
});

// Global functions for manual access
window.requestMobileLocation = requestMobileLocation;
window.hideMobileLocationPopup = hideMobileLocationPopup;
window.hideBanner = hideBanner;
window.manualWhatsApp = manualWhatsApp;
window.executeAction = executeAction;

// Debug info
console.log(`
🧸 AbuToys - Mobile Optimized
📱 Mobile Detection: ${/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}
🔒 HTTPS: ${location.protocol === 'https:'}
📍 Geolocation: ${!!navigator.geolocation}
🔧 Debug: Call requestMobileLocation() manually if needed
`);
