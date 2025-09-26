// =================== USER DATA MANAGER - SYNC WITH HOME PAGE ===================
class UserDataManager {
    constructor() {
        this.currentUser = localStorage.getItem("abutoys_current_user");
        this.userLocation = JSON.parse(localStorage.getItem("abutoys_user_location") || "null");
        this.locationStatus = localStorage.getItem("abutoys_location_status") || "unknown";
        this.deliveryCharge = parseFloat(localStorage.getItem("abutoys_delivery_charge") || "0");
        this.likedProducts = JSON.parse(localStorage.getItem("abutoys_liked_products") || "[]");
        this.isShowingLiked = false;
        this.allProducts = [];
        this.init();
    }

    init() {
        this.updateUserDisplay();
        this.syncWithHomePage();
    }

    getUser(email) {
        try {
            return JSON.parse(localStorage.getItem(`abutoys_user_${email}`) || "null");
        } catch (e) {
            return null;
        }
    }

    isLoggedIn() {
        return this.currentUser && this.currentUser !== "visitor" && this.currentUser !== "null";
    }

    isVisitorMode() {
        return this.currentUser === "visitor";
    }

    isLocationVerified() {
        return this.locationStatus === "in_range";
    }

    getCurrentUserName() {
        if (this.currentUser && this.currentUser !== "visitor") {
            const user = this.getUser(this.currentUser);
            return user ? user.fullName : "User";
        }
        return "Visitor";
    }

    updateUserDisplay() {
        const userNameDisplay = document.getElementById("userNameDisplay");
        const userIcon = document.getElementById("userIcon");
        
        if (userNameDisplay) {
            if (this.currentUser && (this.isLoggedIn() || this.isVisitorMode())) {
                const name = this.getCurrentUserName();
                userNameDisplay.textContent = `Hello ${name}!`;
                userNameDisplay.style.display = "block";
            } else {
                userNameDisplay.style.display = "none";
            }
        }

        if (userIcon) {
            if (this.isLoggedIn()) {
                userIcon.classList.add("active");
                userIcon.title = `Logged in as ${this.getCurrentUserName()}`;
            } else if (this.isVisitorMode()) {
                userIcon.classList.remove("active");
                userIcon.title = "Visitor Mode";
            } else {
                userIcon.classList.remove("active");
                userIcon.title = "Account";
            }
        }
    }

    syncWithHomePage() {
        // Sync data periodically in case home page data changes
        setInterval(() => {
            const newUser = localStorage.getItem("abutoys_current_user");
            const newLocationStatus = localStorage.getItem("abutoys_location_status");
            const newDeliveryCharge = parseFloat(localStorage.getItem("abutoys_delivery_charge") || "0");

            if (newUser !== this.currentUser || newLocationStatus !== this.locationStatus || newDeliveryCharge !== this.deliveryCharge) {
                this.currentUser = newUser;
                this.locationStatus = newLocationStatus;
                this.deliveryCharge = newDeliveryCharge;
                this.updateUserDisplay();
                this.updateProductCards();
            }
        }, 2000);
    }

    updateProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            this.updateSingleProductCard(card);
        });
    }

    updateSingleProductCard(card) {
        const orderBtn = card.querySelector('.order-btn');
        const priceElement = card.querySelector('.product-price');
        
        // Update order button visibility
        if (orderBtn) {
            if (this.isVisitorMode()) {
                orderBtn.style.display = 'none';
            } else if (this.isLoggedIn() && this.isLocationVerified()) {
                orderBtn.style.display = 'inline-flex';
            } else {
                orderBtn.style.display = 'none';
            }
        }

        // Update price with delivery charges
        if (priceElement && card.dataset.originalPrice) {
            const originalPrice = parseFloat(card.dataset.originalPrice);
            const finalPrice = originalPrice + this.deliveryCharge;
            
            // Update delivery info
            let deliveryInfo = card.querySelector('.delivery-info');
            let totalPrice = card.querySelector('.total-price');
            
            if (!deliveryInfo) {
                deliveryInfo = document.createElement('div');
                deliveryInfo.className = 'delivery-info';
                priceElement.appendChild(deliveryInfo);
            }
            
            if (!totalPrice && this.deliveryCharge > 0) {
                totalPrice = document.createElement('div');
                totalPrice.className = 'total-price';
                priceElement.appendChild(totalPrice);
            }
            
            if (this.deliveryCharge > 0) {
                deliveryInfo.textContent = `Delivery: ₹${this.deliveryCharge}`;
                if (totalPrice) totalPrice.textContent = `Total: ₹${finalPrice}`;
            } else {
                deliveryInfo.textContent = 'Free Delivery!';
                if (totalPrice) totalPrice.remove();
            }
        }
    }

    // Like system methods
    addLikedProduct(productData) {
        const existingIndex = this.likedProducts.findIndex(p => p.name === productData.name);
        if (existingIndex === -1) {
            this.likedProducts.push(productData);
            localStorage.setItem("abutoys_liked_products", JSON.stringify(this.likedProducts));
            this.showMessage("Added to liked products!", "success");
            return true;
        }
        return false;
    }

    removeLikedProduct(productName) {
        const initialLength = this.likedProducts.length;
        this.likedProducts = this.likedProducts.filter(p => p.name !== productName);
        
        if (this.likedProducts.length < initialLength) {
            localStorage.setItem("abutoys_liked_products", JSON.stringify(this.likedProducts));
            this.showMessage("Removed from liked products", "info");
            return true;
        }
        return false;
    }

    isProductLiked(productName) {
        return this.likedProducts.some(p => p.name === productName);
    }

    showMessage(message, type = "info") {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed; top: 90px; right: 20px; z-index: 10000;
            padding: 12px 20px; border-radius: 25px; color: white;
            font-size: 0.9rem; font-weight: 600; opacity: 0;
            transition: all 0.3s ease; transform: translateX(100%);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    toggleLikedView() {
        const heartIcon = document.getElementById('heartIcon');
        
        if (!this.isShowingLiked) {
            // Show only liked products
            this.showOnlyLikedProducts();
            this.isShowingLiked = true;
            if (heartIcon) {
                heartIcon.classList.add('showing-liked');
            }
            
            if (this.likedProducts.length === 0) {
                this.showEmptyLikedMessage();
            }
        } else {
            // Show all products
            this.showAllProducts();
            this.isShowingLiked = false;
            if (heartIcon) {
                heartIcon.classList.remove('showing-liked');
            }
            // Remove empty message if exists
            const emptyMessage = document.getElementById('empty-liked-message');
            if (emptyMessage) emptyMessage.remove();
        }
    }

    showOnlyLikedProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('h3')?.textContent;
            if (this.isProductLiked(productName)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showAllProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.display = 'block';
        });
    }

    showEmptyLikedMessage() {
        const grid = document.getElementById('products-grid');
        const emptyMessage = document.createElement('div');
        emptyMessage.id = 'empty-liked-message';
        emptyMessage.style.cssText = `
            grid-column: 1 / -1; text-align: center; padding: 60px 20px;
            background: white; border-radius: 20px; margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        `;
        emptyMessage.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 20px; color: #FF6B6B;">💔</div>
            <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #333;">No liked products yet!</h3>
            <p style="font-size: 1rem; color: #666; margin-bottom: 20px;">Start exploring and like some products to see them here</p>
            <button onclick="userDataManager.toggleLikedView()" style="
                padding: 12px 25px; background: #FF6B6B; color: white; border: none;
                border-radius: 25px; cursor: pointer; font-weight: 600;
            ">Browse All Products</button>
        `;
        
        grid.appendChild(emptyMessage);
    }
}

// Initialize user data manager
const userDataManager = new UserDataManager();

// =================== MOBILE NAVIGATION ===================
function initializeMobileNavigation() {
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
}

// =================== NAVBAR SCROLL EFFECT ===================
function initializeNavbarScrollEffect() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255,255,255,0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            } else {
                navbar.style.background = 'rgba(255,255,255,0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            }
        }
    });
}

// =================== SEARCH FUNCTIONALITY ===================
function initializeSearchFunctionality() {
    const desktopSearch = document.getElementById('desktop-search');
    const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchClose = document.getElementById('mobile-search-close');
    const searchIcon = document.querySelector('.search-icon');
    
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
                `Found ${foundProducts} products for "${searchTerm}"` :
                `No products found for "${searchTerm}". Try different keywords.`;
            
            userDataManager.showMessage(resultsMsg, foundProducts > 0 ? "success" : "error");
        }
    }
    
    // Desktop search
    if (desktopSearch) {
        desktopSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
            
            // Reset liked view if searching
            if (userDataManager.isShowingLiked && searchTerm) {
                userDataManager.isShowingLiked = false;
                const heartIcon = document.getElementById('heartIcon');
                if (heartIcon) heartIcon.classList.remove('showing-liked');
            }
        });
    }

    // Search icon click for mobile
    if (searchIcon && window.innerWidth <= 768) {
        searchIcon.addEventListener('click', () => {
            if (mobileSearchOverlay) {
                mobileSearchOverlay.style.display = 'flex';
                setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
                if (mobileSearchInput) mobileSearchInput.focus();
            }
        });
    }
    
    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
        });
    }
    
    // Mobile search overlay controls
    if (mobileSearchOverlay && mobileSearchClose) {
        mobileSearchClose.addEventListener('click', () => {
            mobileSearchOverlay.style.opacity = '0';
            setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
        });
        
        mobileSearchOverlay.addEventListener('click', (e) => {
            if (e.target === mobileSearchOverlay) {
                mobileSearchOverlay.style.opacity = '0';
                setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
            }
        });
    }
}

// =================== PRODUCT CATEGORY FILTERS ===================
function initializeProductFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            // Reset liked view when filtering
            if (userDataManager.isShowingLiked) {
                userDataManager.isShowingLiked = false;
                const heartIcon = document.getElementById('heartIcon');
                if (heartIcon) heartIcon.classList.remove('showing-liked');
            }
            
            document.querySelectorAll('.product-card').forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Remove empty liked message if exists
            const emptyMessage = document.getElementById('empty-liked-message');
            if (emptyMessage) emptyMessage.remove();
            
            // Update results message
            const visibleCards = document.querySelectorAll('.product-card[style*="display: block"], .product-card:not([style*="display: none"])').length;
            showFilterResults(category, visibleCards);
        });
    });
}

function showFilterResults(category, count) {
    const categoryNames = {
        'all': 'All Products',
        'toys': 'Toys Items', 
        'school': 'School Items'
    };
    
    const categoryName = categoryNames[category] || category;
    const message = count > 0 ? 
        `Found ${count} products in ${categoryName}` :
        `No products found in ${categoryName}`;
    
    userDataManager.showMessage(message, "info");
}

// =================== PRODUCT IMAGES SLIDER ===================
function initializeProductImageSliders() {
    document.querySelectorAll('.product-card').forEach(card => {
        const mediaContainer = card.querySelector('.product-images');
        const prevBtn = card.querySelector('.prev-img');
        const nextBtn = card.querySelector('.next-img');
        
        if (!mediaContainer || !prevBtn || !nextBtn) return;
        
        const mediaElements = Array.from(mediaContainer.children);
        let currentIndex = 0;
        
        // Filter valid media elements
        const validMedia = mediaElements.filter(media => {
            if (media.tagName === 'IMG') {
                return media.src && !media.src.includes('placeholder') && media.src !== window.location.href;
            } else if (media.tagName === 'VIDEO' || media.classList.contains('video-container')) {
                return true;
            }
            return false;
        });
        
        if (validMedia.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        function showMedia(index) {
            validMedia.forEach((media, i) => {
                if (i === index) {
                    media.style.display = 'block';
                    media.classList.add('active');
                } else {
                    media.style.display = 'none';
                    media.classList.remove('active');
                }
            });
        }
        
        // Show first media initially
        showMedia(currentIndex);
        
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + validMedia.length) % validMedia.length;
            showMedia(currentIndex);
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % validMedia.length;
            showMedia(currentIndex);
        });

        // Touch/swipe support for mobile
        let startX = 0;
        mediaContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        mediaContainer.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    // Swipe left - next image
                    currentIndex = (currentIndex + 1) % validMedia.length;
                } else {
                    // Swipe right - previous image
                    currentIndex = (currentIndex - 1 + validMedia.length) % validMedia.length;
                }
                showMedia(currentIndex);
            }
        });
    });
}

// =================== WISHLIST FUNCTIONALITY ===================
function initializeWishlistFunctionality() {
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        const card = icon.closest('.product-card');
        const productName = card?.querySelector('h3')?.textContent;
        
        // Set initial state based on saved likes
        if (userDataManager.isProductLiked(productName)) {
            icon.style.color = 'red';
            icon.classList.add('liked');
        }
        
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isLiked = this.classList.contains('liked');
            
            if (isLiked) {
                // Unlike
                this.style.color = '#FF6B6B';
                this.classList.remove('liked');
                userDataManager.removeLikedProduct(productName);
                
                // If showing liked view and this product is unliked, hide it
                if (userDataManager.isShowingLiked) {
                    card.style.display = 'none';
                    
                    // Check if any liked products remain
                    const remainingLiked = document.querySelectorAll('.product-card[style*="display: block"]').length;
                    if (remainingLiked === 0) {
                        userDataManager.showEmptyLikedMessage();
                    }
                }
            } else {
                // Like
                this.style.color = 'red';
                this.classList.add('liked');
                
                // Get product data for storage
                const productData = {
                    name: productName,
                    description: card.querySelector('.product-description')?.textContent || '',
                    price: card.querySelector('.product-price')?.textContent || '',
                    image: card.querySelector('.product-img')?.src || '',
                    category: card.dataset.category || 'all'
                };
                
                userDataManager.addLikedProduct(productData);
            }
            
            // Animation feedback
            this.style.transform = 'scale(1.4)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
        });
    });
}

// =================== NAVBAR ICONS FUNCTIONALITY ===================
function initializeNavbarIcons() {
    // Heart Icon
    const heartIcon = document.getElementById('heartIcon');
    if (heartIcon) {
        heartIcon.addEventListener('click', () => {
            userDataManager.toggleLikedView();
        });
    }

    // Cart Icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            userDataManager.showMessage("Cart feature coming soon!", "info");
        });
    }

    // User Icon (same functionality as home page)
    const userIcon = document.getElementById('userIcon');
    if (userIcon) {
        userIcon.addEventListener('click', () => {
            if (userDataManager.isLoggedIn()) {
                userDataManager.showMessage(`Hello ${userDataManager.getCurrentUserName()}! You are logged in.`, "success");
            } else if (userDataManager.isVisitorMode()) {
                userDataManager.showMessage("You are in Visitor Mode. Go to home page to create account.", "info");
            } else {
                userDataManager.showMessage("Please visit home page to login/signup", "info");
            }
        });
    }
}

// =================== ORDER BUTTON FUNCTIONALITY ===================
function initializeOrderButtons() {
    document.querySelectorAll('.btn-whatsapp, .order-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productName = this.getAttribute('data-product-name') || 
                               this.closest('.product-card')?.querySelector('h3')?.textContent?.trim() || 
                               'Product';
            
            if (!userDataManager.isLocationVerified()) {
                userDataManager.showMessage("Location verification required! Please visit home page.", "error");
                return;
            }
            
            if (userDataManager.isVisitorMode()) {
                userDataManager.showMessage("Please create account to order products!", "error");
                return;
            }
            
            if (!userDataManager.isLoggedIn()) {
                userDataManager.showMessage("Please login to order products!", "error");
                return;
            }
            
            // Execute WhatsApp order
            executeWhatsAppOrder(productName);
        });
    });
}

function executeWhatsAppOrder(productName) {
    const userName = userDataManager.getCurrentUserName();
    const message = `Hi! 👋 I am ${userName} from Ahmedabad.

I want to order *${productName}*. 🧸

📍 Location verified ✅
💰 Ready to pay including delivery charges
🚚 Please confirm delivery details`;
    
    const whatsappURL = `https://wa.me/919879254030?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = whatsappURL;
    } else {
        window.open(whatsappURL, '_blank');
    }
    
    userDataManager.showMessage("Opening WhatsApp...", "success");
}

// =================== FLOATING BUTTONS ===================
function initializeFloatingButtons() {
    const backToTopBtn = document.getElementById('backToTopSimple');
    const whatsappBtn = document.getElementById('whatsappFloat');
    
    // Back to Top Button
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Hover effects
        backToTopBtn.addEventListener('mouseenter', () => {
            backToTopBtn.style.transform = 'scale(1.1)';
        });
        
        backToTopBtn.addEventListener('mouseleave', () => {
            backToTopBtn.style.transform = 'scale(1)';
        });
    }
    
    // WhatsApp Button
    if (whatsappBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                whatsappBtn.style.display = 'flex';
            } else {
                whatsappBtn.style.display = 'none';
            }
        });
        
        whatsappBtn.addEventListener('click', () => {
            openWhatsApp();
        });
        
        // Hover effects
        whatsappBtn.addEventListener('mouseenter', () => {
            whatsappBtn.style.transform = 'scale(1.05)';
        });
        
        whatsappBtn.addEventListener('mouseleave', () => {
            whatsappBtn.style.transform = 'scale(1)';
        });
    }
}

function openWhatsApp() {
    const userName = userDataManager.getCurrentUserName();
    const locationStatus = userDataManager.locationStatus;

    // Check if user is in visitor mode
    if (userDataManager.isVisitorMode()) {
        userDataManager.showMessage("WhatsApp support not available in Visitor Mode. Please create an account.", "error");
        return;
    }

    let message;
    if (locationStatus === "in_range") {
        message = `Hi, I am ${userName} from Ahmedabad. In the delivery range.`;
    } else {
        message = `Hi, I am ${userName} from Ahmedabad. Need to check delivery availability.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9879254030?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// =================== IMAGE LIGHTBOX ===================
function initializeLightbox() {
    // Add click event to all product images
    document.querySelectorAll('.product-img').forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            openLightbox(this.src, this.alt);
        });
    });
}

function openLightbox(src, alt) {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    if (lightbox && lightboxImage) {
        lightboxImage.src = src;
        lightboxImage.alt = alt;
        lightbox.style.display = 'flex';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

// =================== PRODUCT SHUFFLING ===================
function shuffleProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    const products = Array.from(grid.children);
    
    // Fisher-Yates shuffle algorithm
    for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
    }
    
    // Clear grid and re-append shuffled products
    grid.innerHTML = '';
    products.forEach(product => grid.appendChild(product));
}

// =================== LOAD MORE FUNCTIONALITY ===================
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            userDataManager.showMessage("All products are already loaded!", "info");
        });
    }
}

// =================== UPDATED GOOGLE SHEETS PRODUCT LOADING ===================
async function loadProductsFromSheet() {
    // Replace this with your Google Apps Script Web App URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxUFBo2rfomPllZtqyzXSkIBhtXsTdT5A0FGNk-ojdCZD-EfTFMySt5E82DvZErMmLMA/exec";
    
    // Alternative: Use OpenSheet service (simpler but less control)
    const OPENSHEET_URL = "https://opensheet.vercel.app/1LaF1JFdRSGhNvonfo8-G3mHEXIA5-ulPl_4JlIAOAfc/AbuToys";

    
    const grid = document.getElementById("products-grid");
    
    if (!grid) {
        console.error("Products grid element not found!");
        return;
    }

    // Show loading indicator
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 1s linear infinite;">🔄</div>
            <p style="font-size: 1.2rem; color: #666;">Loading products from Excel...</p>
        </div>
    `;

    try {
        // Try Google Apps Script first, fallback to OpenSheet
        let response;
        let data;
        
        try {
            response = await fetch(SCRIPT_URL);
            data = await response.json();
        } catch (error) {
            console.log("Apps Script failed, trying OpenSheet...");
            response = await fetch(OPENSHEET_URL);
            data = await response.json();
        }

        grid.innerHTML = ""; // Clear loader

        // Filter only active products
        const activeProducts = data.filter(item => item.Active === '✅');

        activeProducts.forEach(item => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.dataset.category = (item.Cat || "all").toLowerCase().replace(/\s+/g, '-');
            card.dataset.originalPrice = item.Price || "0";

            // Process images - handle multiple images from your Excel columns
            const images = [];
            if (item.Img1) images.push(item.Img1);
            if (item.Img2) images.push(item.Img2);
            if (item.Img3) images.push(item.Img3);
            if (item.Img4) images.push(item.Img4);

            // Create image HTML
            const imageHTML = images.map((src, i) => 
                `<img src="${src.trim()}" alt="${item.Desc || 'Product'}" class="product-img ${i === 0 ? 'active' : ''}" 
                 onerror="this.style.display='none'" loading="lazy">`
            ).join("");

            // Create video HTML if exists
            const videoHTML = item.Video ? `
                <div class="video-container ${images.length === 0 ? 'active' : ''}">
                    <video controls preload="metadata">
                        <source src="${item.Video}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            ` : "";

            // Show price with discount if old price exists
            const priceHTML = item['Old Price'] && parseFloat(item['Old Price']) > parseFloat(item.Price) ? `
                <div class="product-price">
                    <span class="current-price">₹${item.Price}</span>
                    <span class="old-price">₹${item['Old Price']}</span>
                    <span class="discount">${Math.round(((parseFloat(item['Old Price']) - parseFloat(item.Price)) / parseFloat(item['Old Price'])) * 100)}% OFF</span>
                </div>
            ` : `
                <div class="product-price">₹${item.Price || "0"}</div>
            `;

            card.innerHTML = `
                <div class="product-image-container">
                    <div class="product-images">
                        ${imageHTML}
                        ${videoHTML}
                    </div>
                    ${images.length > 1 ? `
                        <button class="img-nav prev-img">‹</button>
                        <button class="img-nav next-img">›</button>
                    ` : ''}
                    <div class="product-overlay">
                        <i class="fa-solid fa-heart wishlist-icon" title="Add to Wishlist"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${item.Desc || "Product"}</h3>
                    ${priceHTML}
                    <button class="btn btn-whatsapp order-btn" data-product-name="${item.Desc || 'Product'}">
                        Order Now
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });

        console.log(`Loaded ${activeProducts.length} products successfully!`);

        // Re-initialize functionality after products load
        userDataManager.updateProductCards();
        initializeProductImageSliders();
        initializeWishlistFunctionality();
        initializeOrderButtons();
        
        // Show success message
        userDataManager.showMessage(`${activeProducts.length} products loaded successfully!`, "success");

    } catch (error) {
        console.error("Error loading products:", error);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff3f3; border-radius: 20px; border: 2px dashed #e74c3c;">
                <div style="font-size: 3rem; margin-bottom: 20px; color: #e74c3c;">⚠️</div>
                <h3 style="color: #e74c3c; margin-bottom: 15px;">Failed to load products</h3>
                <p style="color: #666; margin-bottom: 20px;">Please check your internet connection or try again later.</p>
                <button onclick="loadProductsFromSheet()" style="
                    padding: 12px 25px; background: #e74c3c; color: white; border: none;
                    border-radius: 25px; cursor: pointer; font-weight: 600;
                ">Try Again</button>
            </div>
        `;
    }
}

// =================== ENHANCED CSS STYLES FOR PRODUCTS ===================
function addProductStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .product-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
        }

        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        .product-image-container {
            position: relative;
            height: 250px;
            overflow: hidden;
        }

        .product-images {
            position: relative;
            height: 100%;
        }

        .product-img, .video-container video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
        }

        .product-img.active, .video-container.active video {
            display: block;
        }

        .video-container.active {
            display: block;
            height: 100%;
        }

        .img-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .product-card:hover .img-nav {
            opacity: 1;
        }

        .prev-img { left: 10px; }
        .next-img { right: 10px; }

        .img-nav:hover {
            background: rgba(0,0,0,0.9);
            transform: translateY(-50%) scale(1.1);
        }

        .product-overlay {
            position: absolute;
            top: 15px;
            right: 15px;
        }

        .wishlist-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            color: #FF6B6B;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .wishlist-icon:hover {
            background: white;
            transform: scale(1.1);
        }

        .wishlist-icon.liked {
            color: red;
            background: rgba(255,255,255,1);
        }

        .product-info {
            padding: 20px;
        }

        .product-info h3 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            color: #333;
            font-weight: 600;
            line-height: 1.4;
        }

        .product-price {
            margin-bottom: 15px;
            font-size: 1.4rem;
            font-weight: 700;
        }

        .current-price {
            color: #e74c3c;
        }

        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 1rem;
            margin-left: 10px;
        }

        .discount {
            background: #e74c3c;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 10px;
            font-weight: 600;
        }

        .order-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(45deg, #25D366, #20b358);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .order-btn:hover {
            background: linear-gradient(45deg, #20b358, #1a9647);
            transform: scale(1.05);
        }

        .delivery-info {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
        }

        .total-price {
            font-size: 1.1rem;
            color: #333;
            font-weight: 600;
            margin-top: 5px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .product-card {
                margin-bottom: 20px;
            }
            
            .product-info h3 {
                font-size: 1.1rem;
            }
            
            .img-nav {
                opacity: 1;
                width: 35px;
                height: 35px;
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INITIALIZATION ===================
document.addEventListener("DOMContentLoaded", () => {
    // Add styles first
    addProductStyles();
    
    // Initialize all functionality
    initializeMobileNavigation();
    initializeNavbarScrollEffect();
    initializeSearchFunctionality();
    initializeProductFilters();
    initializeNavbarIcons();
    initializeFloatingButtons();
    initializeLightbox();
    initializeLoadMore();
    
    // Load products from your Excel sheet
    loadProductsFromSheet();
});

// =================== AUTO REFRESH FUNCTIONALITY ===================
// Auto refresh products every 5 minutes to get latest data
setInterval(() => {
    console.log("Auto refreshing products...");
    loadProductsFromSheet();
}, 5 * 60 * 1000); // 5 minutes

// =================== INITIALIZATION ===================
document.addEventListener("DOMContentLoaded", () => {
    initializeMobileNavigation();
    initializeNavbarScrollEffect();
    initializeSearchFunctionality();
    initializeProductFilters();
    initializeNavbarIcons();
    initializeFloatingButtons();
    initializeLightbox();
    initializeLoadMore();
    shuffleProducts();

    loadProductsFromSheet();
});
