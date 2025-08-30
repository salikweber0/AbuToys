// =================== MOBILE NAVIGATION ===================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
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

// =================== LOCATION SYSTEM ===================
let isLocationAllowed = false;
let isAhmedabadUser = false;

// Create location popup
function createLocationPopup(message, showCloseBtn = false) {
    // Remove existing popup
    const existingPopup = document.getElementById('location-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.id = 'location-popup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    popup.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        ">
            <p style="
                font-family: 'Poppins', sans-serif;
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
                color: #333;
                line-height: 1.5;
            ">${message}</p>
            ${showCloseBtn ? `
                <button onclick="hideLocationPopup()" style="
                    padding: 10px 20px;
                    background: #FF6B6B;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                ">समझ गया</button>
            ` : ''}
        </div>
    `;

    document.body.appendChild(popup);
    setTimeout(() => popup.style.opacity = '1', 10);
    return popup;
}

function hideLocationPopup() {
    const popup = document.getElementById('location-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

// Main location check function
function checkUserLocation() {
    if (!navigator.geolocation) {
        createLocationPopup('❌ आपका browser location support नहीं करता।', true);
        return;
    }

    // Show checking message
    createLocationPopup('📍 आपकी location check कर रहे हैं...');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isLocationAllowed = true;
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            // Ahmedabad bounds (approximate)
            const ahmedabadBounds = {
                north: 23.1500,
                south: 22.9000,
                east: 72.7500,
                west: 72.4000
            };
            
            // Check if user is in Ahmedabad
            if (userLat >= ahmedabadBounds.south && userLat <= ahmedabadBounds.north &&
                userLon >= ahmedabadBounds.west && userLon <= ahmedabadBounds.east) {
                
                isAhmedabadUser = true;
                hideLocationPopup();
                console.log('✅ User is in Ahmedabad area');
                
            } else {
                isAhmedabadUser = false;
                createLocationPopup(`
                    ❌ माफ़ करें! हम सिर्फ अहमदाबाद शहर में ही service देते हैं।<br><br>
                    Sorry! We only serve customers in Ahmedabad city.
                `, true);
            }
        },
        (error) => {
            isLocationAllowed = false;
            let errorMsg = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = `
                        ⚠️ Location permission नहीं दी गई!<br><br>
                        कृपया browser settings में location allow करें।<br>
                        फिर page refresh करें।
                    `;
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '⚠️ Location पता नहीं चल रही। कृपया GPS on करें।';
                    break;
                case error.TIMEOUT:
                    errorMsg = '⚠️ Location check में time लग रहा। फिर try करें।';
                    break;
                default:
                    errorMsg = '⚠️ Location में कोई problem है। फिर try करें।';
            }
            
            createLocationPopup(errorMsg, true);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// =================== BUTTON SETUP ===================

// WhatsApp button setup
function initWhatsAppButton() {
    const whatsappBtns = document.querySelectorAll('[href*="wa.me"], #whatsapp-btn, .btn-whatsapp');
    
    whatsappBtns.forEach(btn => {
        // Remove existing href to prevent default action
        btn.removeAttribute('href');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isLocationAllowed) {
                createLocationPopup('⚠️ पहले location permission दें!', true);
                return;
            }
            
            if (!isAhmedabadUser) {
                createLocationPopup('❌ आप अहमदाबाद में नहीं हैं। हम सिर्फ अहमदाबाद में service देते हैं।', true);
                return;
            }
            
            const userName = prompt('अपना नाम बताएं:');
            if (userName) {
                const message = `Hi, मैं ${userName} हूं, अहमदाबाद से। मुझे आपके toys में interest है।`;
                const whatsappURL = `https://wa.me/918160154042?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');
            }
        });
    });
}

// Call button setup
function initCallButton() {
    const callBtns = document.querySelectorAll('#callAhmedabad, .btn-call, [href*="tel:"]');
    
    callBtns.forEach(btn => {
        // Remove existing href
        btn.removeAttribute('href');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isLocationAllowed) {
                createLocationPopup('⚠️ पहले location permission दें!', true);
                return;
            }
            
            if (!isAhmedabadUser) {
                createLocationPopup('❌ आप अहमदाबाद में नहीं हैं।', true);
                return;
            }
            
            // Check if mobile device
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.location.href = 'tel:+918160154042';
            } else {
                alert('📞 कृपया +91 8160154042 पर call करें (अपने phone से)');
            }
        });
    });
}

// Order buttons setup
function initOrderButtons() {
    // Remove all onclick attributes first
    document.querySelectorAll('[onclick*="orderProduct"]').forEach(btn => {
        const productName = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        btn.removeAttribute('onclick');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isLocationAllowed) {
                createLocationPopup('⚠️ पहले location permission दें!', true);
                return;
            }
            
            if (!isAhmedabadUser) {
                createLocationPopup('❌ आप अहमदाबाद में नहीं हैं।', true);
                return;
            }
            
            const message = `Hi! मुझे ${productName} order करना है। मैं अहमदाबाद से हूं।`;
            const whatsappURL = `https://wa.me/918160154042?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');
        });
    });
}

// =================== SEARCH FUNCTIONALITY ===================
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    let foundProducts = 0;
    
    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
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

// Search input events
const searchInputs = document.querySelectorAll('.search-input, #mobile-search-input');
searchInputs.forEach(input => {
    input.addEventListener('input', function() {
        filterProducts(this.value.toLowerCase());
    });
});

// Mobile search button
const responsiveSearchBtn = document.getElementById('responsive-search-btn');
const mobileSearchOverlay = document.getElementById('mobile-search-overlay');

if (responsiveSearchBtn && mobileSearchOverlay) {
    responsiveSearchBtn.addEventListener('click', () => {
        mobileSearchOverlay.style.display = 'flex';
        setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
        document.getElementById('mobile-search-input').focus();
    });
    
    mobileSearchOverlay.addEventListener('click', (e) => {
        if (e.target === mobileSearchOverlay) {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        }
    });
}

// =================== OTHER FUNCTIONALITY ===================

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            alert('Thank you for subscribing! आपको updates मिलते रहेंगे।');
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

// Wishlist functionality
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
                ">&times;</span>
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

// Show/hide back to top button
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

// =================== AHMEDABAD LOCATION CHECK ===================
function checkAhmedabadLocation() {
    if (!navigator.geolocation) {
        createLocationPopup('❌ आपका browser location support नहीं करता।', true);
        return;
    }

    // Show location checking popup
    createLocationPopup('📍 आपकी location check कर रहे हैं...<br>कृपया "Allow" दबाएं।');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('Location allowed successfully');
            isLocationAllowed = true;
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log(`User coordinates: ${lat}, ${lon}`);
            
            // Ahmedabad area check (wider bounds)
            const ahmedabadCenter = { lat: 23.0225, lon: 72.5714 };
            const maxDistance = 0.5; // degrees (approximately 50km)
            
            const distance = Math.sqrt(
                Math.pow(lat - ahmedabadCenter.lat, 2) + 
                Math.pow(lon - ahmedabadCenter.lon, 2)
            );
            
            if (distance <= maxDistance) {
                isAhmedabadUser = true;
                hideLocationPopup();
                console.log('✅ User verified as Ahmedabad resident');
                
                // Show success message briefly
                const successPopup = createLocationPopup('✅ Location verified! आप अब सभी features use कर सकते हैं।');
                setTimeout(() => hideLocationPopup(), 2000);
                
            } else {
                isAhmedabadUser = false;
                createLocationPopup(`
                    ❌ माफ़ करें!<br><br>
                    हम सिर्फ अहमदाबाद शहर में ही toys deliver करते हैं।<br><br>
                    We only serve customers in Ahmedabad city.
                `, true);
            }
        },
        (error) => {
            isLocationAllowed = false;
            let errorMessage = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = `
                        ⚠️ Location permission denied!<br><br>
                        कृपया browser settings में जाकर location allow करें।<br>
                        फिर page को refresh करें।<br><br>
                        <small>Chrome: Settings > Privacy > Site Settings > Location</small>
                    `;
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '⚠️ GPS signal नहीं मिल रही। कृपया GPS on करें।';
                    break;
                case error.TIMEOUT:
                    errorMessage = '⚠️ Location check में time लग रहा। फिर try करें।';
                    break;
                default:
                    errorMessage = '⚠️ Location में technical problem है।';
            }
            
            createLocationPopup(errorMessage, true);
        },
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
}

// Button action function
function performButtonAction(actionType, productName = '') {
    if (!isLocationAllowed) {
        createLocationPopup(`
            ⚠️ पहले location permission दें!<br><br>
            Please allow location access first.
        `, true);
        checkAhmedabadLocation(); // Try again
        return;
    }
    
    if (!isAhmedabadUser) {
        createLocationPopup(`
            ❌ आप अहमदाबाद में नहीं हैं!<br><br>
            We only serve Ahmedabad customers.
        `, true);
        return;
    }
    
    if (actionType === 'whatsapp') {
        const userName = prompt('अपना नाम बताएं:');
        if (userName) {
            let message = `Hi, मैं ${userName} हूं अहमदाबाद से।`;
            if (productName) {
                message += ` मुझे ${productName} order करना है।`;
            } else {
                message += ` मुझे आपके toys collection में interest है।`;
            }
            window.open(`https://wa.me/918160154042?text=${encodeURIComponent(message)}`, '_blank');
        }
    } else if (actionType === 'call') {
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.location.href = 'tel:+918160154042';
        } else {
            alert('📞 कृपया +91 8160154042 पर call करें (अपने mobile से)');
        }
    }
}

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧸 AbuToys website loaded');
    
    // Initialize buttons
    initWhatsAppButton();
    initCallButton();
    initOrderButtons();
    
    // Start location check after 1 second
    setTimeout(checkAhmedabadLocation, 1000);
});

// Initialize order buttons
function initOrderButtons() {
    document.querySelectorAll('.btn-small').forEach(btn => {
        const parentCard = btn.closest('.product-card');
        if (parentCard) {
            const productName = parentCard.querySelector('h3').textContent;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                performButtonAction('whatsapp', productName);
            });
        }
    });
}

// Force location check function (backup)
function requestLocationAccess() {
    createLocationPopup('🔄 Location permission फिर से check कर रहे हैं...');
    checkAhmedabadLocation();
}

// Global function for manual location check
window.checkMyLocation = requestLocationAccess;

console.log(`
🧸 AbuToys - Happy Kids Store
📍 Location: Ahmedabad Only
📞 Contact: +91 8160154042
🔧 Debug: Type 'checkMyLocation()' in console to test location
`);
