// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

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

// Sticky Navbar Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % totalSlides;
    slides[currentSlide].classList.add('active');
}

// Auto-change slides every 5 seconds
setInterval(nextSlide, 5000);

// Smooth Scrolling for Navigation Links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for sticky navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// WhatsApp Integration
function openWhatsApp(productName = '') {
    const phoneNumber = '9879254030'; // Replace with actual number
    let message = 'Hi! I am interested in your toys collection.';
    
    if (productName) {
        message = `Hi! I want to order ${productName}. I am from Ahmedabad.`;
    }
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// Product Order Function
function orderProduct(productName) {
    openWhatsApp(productName);
}

// Newsletter Subscription
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    if (email) {
        // Here you can integrate with your backend or email service
        alert('Thank you for subscribing! You will receive updates about our latest offers.');
        this.reset();
    }
});

// 🔍 Search Functionality (Filter Products)
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');

searchInput.addEventListener('input', function () {
    filterProducts(this.value.toLowerCase());
});

searchIcon.addEventListener('click', function () {
    filterProducts(searchInput.value.toLowerCase());
});


// Search Icon Click
document.querySelector('.search-icon').addEventListener('click', function() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        alert(`Searching for: ${searchTerm}`);
        scrollToSection('featured-products');
    }
});

// Wishlist Functionality (Basic)
document.querySelectorAll('.wishlist-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        this.style.color = this.style.color === 'red' ? '#FF6B6B' : 'red';
        this.style.transform = 'scale(1.3)';
        
        // Add a little heart animation
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // You can save to localStorage or send to backend here
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        console.log(`Added ${productName} to wishlist`);
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.product-card, .feature-card, .testimonial-card, .gallery-item');
    animateElements.forEach(el => {
        el.classList.add('scroll-animation');
        observer.observe(el);
    });
});

// Gallery Image Click (Simple Lightbox Effect)
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="close-lightbox">&times;</span>
                <img src="${img.src}" alt="${img.alt}">
            </div>
        `;
        
        // Add lightbox styles
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const lightboxContent = lightbox.querySelector('.lightbox-content');
        lightboxContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const closeBtn = lightbox.querySelector('.close-lightbox');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: -40px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(lightbox);
        
        // Fade in animation
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);
        
        // Close lightbox events
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        function closeLightbox() {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        }
        
        // Close on escape key
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    });
});

// Product Card Hover Effects
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add to Cart Animation (Visual Feedback)
document.querySelectorAll('.btn-small').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Create floating text animation
        const floatingText = document.createElement('div');
        floatingText.textContent = 'Opening WhatsApp...';
        floatingText.style.cssText = `
            position: absolute;
            top: ${e.pageY - 20}px;
            left: ${e.pageX}px;
            color: #25D366;
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            opacity: 1;
            transition: all 1s ease-out;
            transform: translateY(0);
        `;
        
        document.body.appendChild(floatingText);
        
        // Animate the floating text
        setTimeout(() => {
            floatingText.style.opacity = '0';
            floatingText.style.transform = 'translateY(-30px)';
        }, 100);
        
        // Remove the element
        setTimeout(() => {
            document.body.removeChild(floatingText);
        }, 1100);
    });
});

// Back to Top Button (Optional Enhancement)
// Back to Top Button Creation (pehla code jo already hai, reference ke liye)
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s ease;
    z-index: 1000;
`;
document.body.appendChild(backToTopButton);

// Scroll Listener for Back to Top and Responsive Search
const responsiveSearchBtn = document.getElementById('responsive-search-btn');
const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
const mobileSearchInput = document.getElementById('mobile-search-input');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.transform = 'scale(1)';
        responsiveSearchBtn.style.opacity = '1';
        responsiveSearchBtn.style.transform = 'scale(1)';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0)';
        responsiveSearchBtn.style.opacity = '0';
        responsiveSearchBtn.style.transform = 'scale(0)';
    }
});

// Back to Top Functionality
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to back to top button
backToTopButton.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
});

backToTopButton.addEventListener('mouseleave', function() {
    this.style.transform = window.scrollY > 500 ? 'scale(1)' : 'scale(0)';
});

// Click pe overlay open
responsiveSearchBtn.addEventListener('click', () => {
    mobileSearchOverlay.style.display = 'flex';
    setTimeout(() => {
        mobileSearchOverlay.style.opacity = '1';
    }, 10);
    mobileSearchInput.focus();
});

// Mobile search input pe filter, scroll aur Enter pe close
mobileSearchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    filterProducts(searchTerm);
    
    // Agar search term hai, to featured-products pe scroll kar
    if (searchTerm) {
        const firstVisibleProduct = document.querySelector('.product-card[style*="block"]');
        if (firstVisibleProduct) {
            firstVisibleProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            scrollToSection('featured-products');
        }
    }
});

// Enter key pe search bar close
mobileSearchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        mobileSearchOverlay.style.opacity = '0';
        setTimeout(() => {
            mobileSearchOverlay.style.display = 'none';
        }, 300);
    }
});

// Overlay ke bahar click pe close
mobileSearchOverlay.addEventListener('click', function (e) {
    if (e.target === mobileSearchOverlay) {
        mobileSearchOverlay.style.opacity = '0';
        setTimeout(() => {
            mobileSearchOverlay.style.display = 'none';
        }, 300);
    }
});

// Preloader (Optional)
window.addEventListener('load', () => {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="spinner">🧸</div>
            <p>Loading <span style="color: rgb(255, 44, 44);">AbuToys...</span></p>
        </div>
    `;
    
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.5s ease;
    `;
    
    const preloaderContent = preloader.querySelector('.preloader-content');
    preloaderContent.style.cssText = `
        text-align: center;
        color: white;
    `;
    
    const spinner = preloader.querySelector('.spinner');
    spinner.style.cssText = `
        font-size: 4rem;
        animation: spin 2s linear infinite;
        margin-bottom: 1rem;
    `;
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Show preloader briefly then hide
    document.body.insertBefore(preloader, document.body.firstChild);
    
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(preloader);
        }, 500);
    }, 2000);
});

// Console Welcome Message
console.log(`
🧸 Welcome to ToyLand! 🧸
Made with ❤️ for Happy Kids
Contact: +91 9879254030
`);

// Error Handling for Images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    });
});

// WhatsApp Button Dynamic Message
document.getElementById('whatsapp-btn').addEventListener('click', function (e) {
    e.preventDefault();

    // Prompt se user ka naam le lo
    const userName = prompt("Please enter your name:");

    if (userName) {
        // Papa ka WhatsApp number (India code ke sath, +91 mat likhna)
        const phoneNumber = "9879254030";

        // Prefilled message
        const message = `Hi, I am ${userName},\n from Ahmedabad.`;

        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);

        // WhatsApp official API link
        const whatsappURL = `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${encodedMessage}`;

        // Open in new tab
        window.open(whatsappURL, "_blank");
    }
});

// Call Button click (Ahmedabad restriction)
document.getElementById('callAhmedabad').addEventListener('click', function (e) {
    e.preventDefault();
    checkAhmedabadAccess(function(allowed) {
        if (allowed) {
            // Direct tel link trigger
            window.location.assign("tel:+919879254030");
        }
    });
});


// Call Button click
document.getElementById('callAhmedabad').addEventListener('click', function (e) {
    e.preventDefault();
    checkAhmedabadAccess(function(allowed) {
        if (allowed) {
            // Detect if mobile device
            if (/Mobi|Android/i.test(navigator.userAgent)) {
                window.location.href = "tel:+919879254030";
            } else {
                alert("📞 Please call us at +91 9879254030 (use your phone)");
            }
        }
    });
});


// Your existing toyhome.js code with the following additions

// Add to Cart Functionality
function addToCart(productId) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add items to cart!");
        return;
    }

    const cartRef = db.collection('carts').doc(user.uid);
    cartRef.get().then((doc) => {
        if (doc.exists) {
            const cart = doc.data();
            const itemIndex = cart.items.findIndex(item => item.productId === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;
            } else {
                cart.items.push({ productId, quantity: 1 });
            }
            cartRef.update({ items: cart.items });
        } else {
            cartRef.set({ items: [{ productId, quantity: 1 }] });
        }
        alert("Added to cart!");
    });
}

// Update Product HTML to include Add to Cart button
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    db.collection('products').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-overlay">
                            <i class="fas fa-heart wishlist-icon"></i>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">₹${product.price} <span class="old-price">₹${product.oldPrice}</span></div>
                        <button class="btn btn-small" onclick="orderProduct('${product.name}')">Order Now</button>
                        <button class="btn btn-small btn-secondary" onclick="addToCart('${doc.id}')">Add to Cart</button>
                    </div>
                </div>
            `;
            productsGrid.insertAdjacentHTML('beforeend', productHTML);
        });
    });
}

// Your existing code continues...


// Your existing toyhome.js code

// Authentication
const authModal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const closeModal = document.querySelector('.close-modal');

function showAuthModal() {
    authModal.style.display = 'flex';
}

function hideAuthModal() {
    authModal.style.display = 'none';
}

closeModal.addEventListener('click', hideAuthModal);

loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            hideAuthModal();
            alert("Logged in successfully!");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

signupBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            hideAuthModal();
            alert("Signed up successfully!");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Add a login button to navbar
document.querySelector('.nav-icons').insertAdjacentHTML('beforeend', `
    <i class="fas fa-user nav-icon" onclick="showAuthModal()"></i>
`);


