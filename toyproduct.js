

// =================== USER DATA MANAGER ===================
class UserDataManager {
    constructor() {
        this.currentUser = localStorage.getItem("abutoys_current_user");
        this.userLocation = JSON.parse(localStorage.getItem("abutoys_user_location") || "null");
        this.locationStatus = localStorage.getItem("abutoys_location_status") || "unknown";
        this.deliveryCharge = parseFloat(localStorage.getItem("abutoys_delivery_charge") || "0");
        this.userDistance = parseFloat(localStorage.getItem("abutoys_user_distance") || "0");
        this.likedProducts = JSON.parse(localStorage.getItem("abutoys_liked_products") || "[]");
        this.isShowingLiked = false;
        this.allProducts = [];
        this.visibleProductsCount = 9;
        this.cart = JSON.parse(localStorage.getItem("abutoys_cart") || "[]");
        this.init();
    }

    init() {
        this.updateUserDisplay();
        this.syncWithHomePage();
        this.showDistanceMessage();
    }

    showDistanceMessage() {
        if (this.locationStatus === "in_range" && this.userDistance > 0) {
            const userName = this.getCurrentUserName();

            if (this.userDistance <= 0.5) {
                this.showMessage(`${userName}, you are very close (${this.userDistance.toFixed(2)} km)! Visit our shop for offline purchase. Online ordering disabled.`, "success");
            }
        }
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

    isTooClose() {
        return this.userDistance <= 0.5;
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
        setInterval(() => {
            const newUser = localStorage.getItem("abutoys_current_user");
            const newLocationStatus = localStorage.getItem("abutoys_location_status");
            const newDeliveryCharge = parseFloat(localStorage.getItem("abutoys_delivery_charge") || "0");
            const newUserDistance = parseFloat(localStorage.getItem("abutoys_user_distance") || "0");

            if (newUser !== this.currentUser || newLocationStatus !== this.locationStatus ||
                newDeliveryCharge !== this.deliveryCharge || newUserDistance !== this.userDistance) {
                this.currentUser = newUser;
                this.locationStatus = newLocationStatus;
                this.deliveryCharge = newDeliveryCharge;
                this.userDistance = newUserDistance;
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
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        const priceContainer = card.querySelector('.price-container');

        // If user is too close (within 0.5km), hide all price and cart elements
        if (this.isTooClose()) {
            if (addToCartBtn) addToCartBtn.style.display = 'none';
            if (priceContainer) priceContainer.style.display = 'none';
            return;
        }

        // Show cart button only if logged in and location verified
        const shouldShowCart = this.isLoggedIn() && this.isLocationVerified();

        if (addToCartBtn) {
            addToCartBtn.style.display = shouldShowCart ? 'inline-flex' : 'none';
        }

        if (priceContainer) {
            priceContainer.style.display = shouldShowCart ? 'block' : 'none';
        }
    }

    // Cart functionality
    addToCart(productData) {
        const existingIndex = this.cart.findIndex(p => p.name === productData.name);

        if (existingIndex === -1) {
            this.cart.push({ ...productData, quantity: 1 });
            localStorage.setItem("abutoys_cart", JSON.stringify(this.cart));
            this.showMessage("Added to cart!", "success");
            this.updateCartCount();
            return true;
        } else {
            this.showMessage("Product already in cart!", "info");
            return false;
        }
    }

    updateCartCount() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            const count = this.cart.length;
            let badge = cartIcon.querySelector('.cart-badge');

            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'cart-badge';
                    badge.style.cssText = `
                        position: absolute; top: -5px; right: -5px;
                        background: #e74c3c; color: white; border-radius: 50%;
                        width: 18px; height: 18px; font-size: 0.7rem;
                        display: flex; align-items: center; justify-content: center;
                        font-weight: bold;
                    `;
                    cartIcon.appendChild(badge);
                }
                badge.textContent = count;
            } else if (badge) {
                badge.remove();
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
                heartIcon.style.color = 'red'; // ⬅️ Red when showing liked
            }

            if (this.likedProducts.length === 0) {
                this.showEmptyLikedMessage();
            }
        } else {
            // Show all products again
            this.showAllProducts();
            this.isShowingLiked = false;

            if (heartIcon) {
                heartIcon.classList.remove('showing-liked');
                heartIcon.style.color = '#333'; // ⬅️ Black when showing all
            }

            const emptyMessage = document.getElementById('empty-liked-message');
            if (emptyMessage) emptyMessage.remove();
        }
    }

    showOnlyLikedProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('h3')?.textContent;
            card.style.display = this.isProductLiked(productName) ? 'block' : 'none';
        });
    }

    showAllProducts() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.display = index < this.visibleProductsCount ? 'block' : 'none';
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

// If user clicked heart on home -> show liked products automatically
window.addEventListener('load', () => {
    if (localStorage.getItem('abutoys_show_liked_from_home') === '1') {
        localStorage.removeItem('abutoys_show_liked_from_home');
        // ensure userDataManager is initialized
        setTimeout(() => {
            try {
                if (typeof userDataManager !== 'undefined') {
                    userDataManager.toggleLikedView();
                    // scroll to top for clarity
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (e) { console.warn('toggleLikedView error', e); }
        }, 250);
    }
});


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
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');

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

    if (desktopSearch) {
        desktopSearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);

            if (userDataManager.isShowingLiked && searchTerm) {
                userDataManager.isShowingLiked = false;
                const heartIcon = document.getElementById('heartIcon');
                if (heartIcon) heartIcon.classList.remove('showing-liked');
            }
        });
    }

    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', () => {
            if (mobileSearchOverlay) {
                mobileSearchOverlay.style.display = 'flex';
                setTimeout(() => mobileSearchOverlay.style.opacity = '1', 10);
                if (mobileSearchInput) mobileSearchInput.focus();
            }
        });
    }

    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm);
        });
    }

    if (mobileSearchOverlay) {
        mobileSearchOverlay.addEventListener('click', (e) => {
            if (e.target === mobileSearchOverlay) {
                mobileSearchOverlay.style.opacity = '0';
                setTimeout(() => mobileSearchOverlay.style.display = 'none', 300);
            }
        });
    }

    window.addEventListener('scroll', () => {
        if (mobileSearchBtn && window.innerWidth <= 768) {
            mobileSearchBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        }
    });
}

// =================== PRODUCT CATEGORY FILTERS ===================
function initializeProductFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;

            if (userDataManager.isShowingLiked) {
                userDataManager.isShowingLiked = false;
                const heartIcon = document.getElementById('heartIcon');
                if (heartIcon) heartIcon.classList.remove('showing-liked');
            }

            let visibleCount = 0;

            document.querySelectorAll('.product-card').forEach(card => {
                const cardCategory = card.dataset.category;

                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            const emptyMessage = document.getElementById('empty-liked-message');
            if (emptyMessage) emptyMessage.remove();

            showFilterResults(category, visibleCount);
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

// =================== PRODUCT IMAGES AUTO-SLIDER ===================
// =================== PRODUCT IMAGES AUTO-SLIDER ===================
function initializeProductImageSliders() {
    document.querySelectorAll('.product-card').forEach(card => {
        const mediaContainer = card.querySelector('.product-images');
        const prevBtn = card.querySelector('.prev-img');
        const nextBtn = card.querySelector('.next-img');

        if (!mediaContainer || !prevBtn || !nextBtn) return;

        const mediaElements = Array.from(mediaContainer.children);
        let currentIndex = 0;
        let autoSlideInterval;
        let isVideoPlaying = false;

        const validMedia = mediaElements.filter(media => {
            if (media.tagName === 'IMG') {
                return media.src && !media.src.includes('placeholder') && media.src !== window.location.href;
            } else if (media.classList.contains('video-container')) {
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

        function nextSlide() {
            if (isVideoPlaying) return;
            currentIndex = (currentIndex + 1) % validMedia.length;
            showMedia(currentIndex);
        }

        function startAutoSlide() {
            if (isVideoPlaying) return;
            autoSlideInterval = setInterval(nextSlide, 4000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        showMedia(currentIndex);
        startAutoSlide();

        card.addEventListener('mouseenter', stopAutoSlide);
        card.addEventListener('mouseleave', () => {
            if (!isVideoPlaying) startAutoSlide();
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopAutoSlide();
            currentIndex = (currentIndex - 1 + validMedia.length) % validMedia.length;
            showMedia(currentIndex);
            if (!isVideoPlaying) startAutoSlide();
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopAutoSlide();
            currentIndex = (currentIndex + 1) % validMedia.length;
            showMedia(currentIndex);
            if (!isVideoPlaying) startAutoSlide();
        });

        let startX = 0;
        mediaContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            stopAutoSlide();
        });

        mediaContainer.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % validMedia.length;
                } else {
                    currentIndex = (currentIndex - 1 + validMedia.length) % validMedia.length;
                }
                showMedia(currentIndex);
            }
            if (!isVideoPlaying) startAutoSlide();
        });

        // Listen for video modal events
        document.addEventListener('video-modal-opened', () => {
            isVideoPlaying = true;
            stopAutoSlide();
        });

        document.addEventListener('video-modal-closed', () => {
            isVideoPlaying = false;
            startAutoSlide();
        });
    });
}

// =================== WISHLIST FUNCTIONALITY ===================
function initializeWishlistFunctionality() {
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        const card = icon.closest('.product-card');
        const productName = card?.querySelector('h3')?.textContent;

        if (userDataManager.isProductLiked(productName)) {
            icon.style.color = '#ff0000'; // Bright red
            icon.style.fontWeight = '900';
            icon.classList.add('liked');
            icon.classList.remove('fa-regular'); // Remove outline
            icon.classList.add('fa-solid'); // Add filled
        } else {
            icon.style.color = '#ffb3b3'; // Light pink
            icon.style.fontWeight = '400';
            icon.classList.remove('fa-solid'); // Remove filled
            icon.classList.add('fa-regular'); // Add outline
        }

        icon.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const isLiked = this.classList.contains('liked');

            if (isLiked) {
                // UNLIKE - Make it outline and light
                this.style.color = '#ffb3b3';
                this.style.fontWeight = '400';
                this.classList.remove('liked');
                this.classList.remove('fa-solid');
                this.classList.add('fa-regular');
                userDataManager.removeLikedProduct(productName);

                if (userDataManager.isShowingLiked) {
                    card.style.display = 'none';

                    const remainingLiked = document.querySelectorAll('.product-card[style*="display: block"]').length;
                    if (remainingLiked === 0) {
                        userDataManager.showEmptyLikedMessage();
                    }
                }
            } else {
                // LIKE - Make it filled and bright red
                this.style.color = '#ff0000';
                this.style.fontWeight = '900';
                this.classList.add('liked');
                this.classList.remove('fa-regular');
                this.classList.add('fa-solid');

                const productData = {
                    name: productName,
                    description: card.querySelector('.product-description')?.textContent || '',
                    price: card.querySelector('.product-price')?.textContent || '',
                    image: card.querySelector('.product-img')?.src || '',
                    category: card.dataset.category || 'all'
                };

                userDataManager.addLikedProduct(productData);
            }

            this.style.transform = 'scale(1.4)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
        });
    });
}

// =================== NAVBAR ICONS FUNCTIONALITY ===================
function initializeNavbarIcons() {
    const heartIcon = document.getElementById('heartIcon');
    if (heartIcon) {
        heartIcon.addEventListener('click', () => {
            userDataManager.toggleLikedView();
        });
    }

    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            userDataManager.showMessage("Cart feature coming soon!", "info");
        });
    }

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

// =================== CART BUTTON FUNCTIONALITY ===================
function initializeCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (userDataManager.isTooClose()) {
                userDataManager.showMessage("You're too close to our shop! Please visit us directly for purchase.", "error");
                return;
            }

            if (!userDataManager.isLocationVerified() || !userDataManager.isLoggedIn()) {
                userDataManager.showMessage("Please login and verify location to add to cart!", "error");
                return;
            }

            const card = this.closest('.product-card');
            const productData = {
                name: card.querySelector('h3')?.textContent || '',
                description: card.querySelector('.product-description')?.textContent || '',
                price: parseFloat(card.dataset.originalPrice || 0),
                deliveryCharge: userDataManager.deliveryCharge,
                image: card.querySelector('.product-img')?.src || '',
                category: card.dataset.category || 'all'
            };

            userDataManager.addToCart(productData);
        });
    });
}

// =================== FLOATING BUTTONS ===================
function initializeFloatingButtons() {
    const backToTopBtn = document.getElementById('backToTopSimple');
    const whatsappBtn = document.getElementById('whatsappFloat');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        backToTopBtn.addEventListener('mouseenter', () => {
            backToTopBtn.style.transform = 'scale(1.1)';
        });

        backToTopBtn.addEventListener('mouseleave', () => {
            backToTopBtn.style.transform = 'scale(1)';
        });
    }

    if (whatsappBtn) {
        window.addEventListener('scroll', () => {
            whatsappBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        });

        whatsappBtn.addEventListener('click', () => {
            handleWhatsAppClick();
        });

        whatsappBtn.addEventListener('mouseenter', () => {
            whatsappBtn.style.transform = 'scale(1.05)';
        });

        whatsappBtn.addEventListener('mouseleave', () => {
            whatsappBtn.style.transform = 'scale(1)';
        });
    }
}

// ✅ NEW FUNCTION - CHECK IF USER IS LOGGED IN BEFORE WHATSAPP
function handleWhatsAppClick() {
    const currentUser = localStorage.getItem("abutoys_current_user");
    
    // Agar localStorage me data nahi hai to message show karo
    if (!currentUser || currentUser === "null" || currentUser === "" || currentUser === "visitor") {
        // Create message popup
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10002;
            max-width: 400px;
            text-align: center;
        `;
        messageDiv.innerHTML = `
            <h3 style="color: #FF6B6B; margin-bottom: 15px; font-size: 1.3rem;">⚠️ Registration Required</h3>
            <p style="color: #666; margin-bottom: 20px; font-size: 1rem;">Please register first to use WhatsApp support. Let's create your account!</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.closest('[style*=\\'position: fixed\\']').remove()" style="
                    padding: 10px 20px;
                    background: #ddd;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Cancel</button>
                <button onclick="window.location.href='index.html'; this.closest('[style*=\\'position: fixed\\']').remove()" style="
                    padding: 10px 20px;
                    background: #FF6B6B;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Go to Home Page</button>
            </div>
        `;
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10001;
        `;
        overlay.addEventListener('click', () => {
            overlay.remove();
            messageDiv.remove();
        });
        
        document.body.appendChild(overlay);
        document.body.appendChild(messageDiv);
        return;
    }
    
    // Agar data hai localStorage me to normal WhatsApp function call karo
    openWhatsApp();
}

function openWhatsApp() {
    const userName = userDataManager.getCurrentUserName();
    const locationStatus = userDataManager.locationStatus;

    let message;
    if (locationStatus === "in_range") {
        message = `Hi, I am ${userName}. Distance: ${userDataManager.userDistance.toFixed(2)} km. I want to purchase toys.`;
    } else {
        message = `Hi, I am ${userName}. Need to check delivery availability.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9879254030?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// =================== LOAD MORE FUNCTIONALITY ===================
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
        const allCards = document.querySelectorAll('.product-card');
        const hiddenCards = Array.from(allCards).filter(card => card.style.display === 'none');

        if (hiddenCards.length === 0) {
            userDataManager.showMessage("All products are already loaded!", "info");
            loadMoreBtn.style.display = 'none';
            return;
        }

        const cardsToShow = hiddenCards.slice(0, 9);
        cardsToShow.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.6s ease-out';
        });

        userDataManager.visibleProductsCount += cardsToShow.length;

        if (hiddenCards.length <= 9) {
            loadMoreBtn.style.display = 'none';
            userDataManager.showMessage("All products loaded!", "success");
        } else {
            userDataManager.showMessage(`Loaded ${cardsToShow.length} more products!`, "success");
        }
    });
}

// =================== GOOGLE SHEETS PRODUCT LOADING ===================
async function loadProductsFromSheet() {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWb4y6AataS6aUMC0XXAcD-j2jD9-RTfoZRldFlDYpw7AMHAbomlnxsqBr3VTe2qL-uA/exec";
    const OPENSHEET_URL = "https://opensheet.vercel.app/1LaF1JFdRSGhNvonfo8-G3mHEXIA5-ulPl_4JlIAOAfc/AbuToys";
    const grid = document.getElementById("products-grid");

    // ✅ STEP 1: Check cache first
    const cachedProducts = localStorage.getItem("abutoys_cached_products");
    if (cachedProducts) {
        const data = JSON.parse(cachedProducts);
        renderProducts(data); // 👈 function call (Step 2 me banayenge)
        return; // ✅ skip loading animation and fetch
    }

    // agar cache nahi mila tabhi loading show karna
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 1s linear infinite;">🔄</div>
            <p style="font-size: 1.2rem; color: #666;">Loading products from Excel...</p>
        </div>
    `;


    try {
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

        grid.innerHTML = "";

        const activeProducts = data.filter(item => item.Active === '✅');

        // Shuffle products array randomly
        for (let i = activeProducts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeProducts[i], activeProducts[j]] = [activeProducts[j], activeProducts[i]];
        }


        activeProducts.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "product-card";

            let category = 'all';
            if (item.Cat) {
                const catLower = item.Cat.toLowerCase().trim();
                if (catLower.includes('toy')) {
                    category = 'toys';
                } else if (catLower.includes('school')) {
                    category = 'school';
                }
            }

            card.dataset.category = category;
            card.dataset.originalPrice = item.Price || "0";
            card.style.display = index < 9 ? 'block' : 'none';

            // Around line 920 - COMPLETE REPLACE
            const mediaItems = [];

            // Add images
            if (item.Img1) mediaItems.push({ type: 'image', src: item.Img1 });
            if (item.Img2) mediaItems.push({ type: 'image', src: item.Img2 });
            if (item.Img3) mediaItems.push({ type: 'image', src: item.Img3 });
            if (item.Img4) mediaItems.push({ type: 'image', src: item.Img4 });

            // Add video if exists
            if (item.Video && item.Video.toString().trim() !== '') {
                let videoSrc = item.Video.toString().trim();

                // Convert YouTube links to embed
                if (videoSrc.includes('youtube.com/watch?v=')) {
                    const videoId = videoSrc.split('watch?v=')[1].split('&')[0];
                    videoSrc = 'https://www.youtube.com/embed/' + videoId;
                } else if (videoSrc.includes('youtu.be/')) {
                    const videoId = videoSrc.split('youtu.be/')[1].split('?')[0];
                    videoSrc = 'https://www.youtube.com/embed/' + videoId;
                }

                mediaItems.push({ type: 'video', src: videoSrc });
            }

            // Generate HTML
            let mediaHTML = '';
            mediaItems.forEach((media, idx) => {
                if (media.type === 'image') {
                    mediaHTML += `
            <img src="${media.src}" 
                 alt="${item.Name || 'Product'}"
                 class="product-img ${idx === 0 ? 'active' : ''}"
                 onerror="this.style.display='none'" 
                 loading="lazy">
        `;
                } else {
                    // Check if YouTube or direct video
                    const isYouTube = media.src.includes('youtube.com/embed');

                    mediaHTML += `
            <div class="video-container ${idx === 0 ? 'active' : ''}" 
                 data-video-src="${media.src}" 
                 data-video-type="${isYouTube ? 'youtube' : 'direct'}">
                <div class="video-thumbnail">
                    <i class="fas fa-play-circle video-play-icon"></i>
                    <span class="video-label">📹 Play Video</span>
                </div>
            </div>
        `;
                }
            });
            // Check if user is too close - hide everything if within 0.5km
            const isTooClose = userDataManager.isTooClose();
            const shouldShowPrice = !isTooClose && userDataManager.isLoggedIn() && userDataManager.isLocationVerified();

            const originalPrice = parseFloat(item.Price || 0);
            const totalPrice = originalPrice + userDataManager.deliveryCharge;

            const priceHTML = shouldShowPrice ? `
                <div class="price-container">
                    <div class="product-price">
                        <span class="current-price">₹${item.Price || "0"}</span>
                        ${item["Old Price"] ? `<span class="old-price">₹${item["Old Price"]}</span>` : ""}
                    </div>
                    <div class="delivery-info" style="font-size: 1rem; font-weight: 500; color: #666; margin-top: 8px;">
                        ${userDataManager.deliveryCharge > 0 ? `Delivery: ₹${userDataManager.deliveryCharge}` : 'Free Delivery!'}
                    </div>
                    ${userDataManager.deliveryCharge > 0 ? `
                        <div class="total-price" style="font-size: 1.15rem; font-weight: 700; color: #4ECDC4; margin-top: 8px;">
                            Total: ₹${totalPrice}
                        </div>
                    ` : ''}
                </div>
            ` : '';

            const buttonsHTML = shouldShowPrice ? `
                <button class="btn add-to-cart-btn" data-product-name="${item.Name || 'Product'}" style="background: #4ECDC4; padding: 10px 20px; border: none; border-radius: 25px; color: white; font-weight: 600; cursor: pointer; width: 100%; text-align: center; display: block; font-family: 'Poppins', sans-serif !important;">
                    Add to Cart
                </button>
            ` : '';

            card.innerHTML = `
                <div class="product-image-container">
                    <div class="product-images">
                        ${mediaHTML}
                    </div>
                    <button class="img-nav prev-img">◀</button>
                    <button class="img-nav next-img">▶</button>
                    <div class="product-overlay">
                        <i class="fa-solid fa-heart wishlist-icon" title="Add to Wishlist"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${item.Name || "Product"}</h3>
                    <p class="product-description">${item.Desc || ""}</p>
                    ${priceHTML}
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        ${buttonsHTML}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        console.log(`Loaded ${activeProducts.length} products successfully!`);

        userDataManager.allProducts = activeProducts;
        userDataManager.updateProductCards();
        initializeProductImageSliders();
        initializeWishlistFunctionality();
        initializeCartButtons();
        initializeImageModal();

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = activeProducts.length > 9 ? 'block' : 'none';
        }

        userDataManager.showMessage(`${Math.min(9, activeProducts.length)} products loaded successfully!`, "success");

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

// =================== CSS STYLES FOR PRODUCTS ===================
function addProductStyles() {
    const style = document.createElement('style');
    style.textContent = `

        /* Old - Only body */
body {
    font-family: 'Poppins', sans-serif !important;
}

/* New - Everything */
* {
    font-family: 'Poppins', sans-serif !important;
}
        /* Modal CSS - Must be hidden initially */
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
        }
        
        .close-btn {
            position: absolute;
            top: 20px;
            right: 40px;
            color: white;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close-btn:hover {
            color: #FF6B6B;
        }
     
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .product-card {
            animation: fadeInUp 0.6s ease-out;
        }

        .add-to-cart-btn {
    text-align: center !important;      /* Text center */
    display: flex !important;            /* Flexbox layout */
    align-items: center !important;      /* Vertical center */
    justify-content: center !important;  /* Horizontal center */
}

        .add-to-cart-btn:hover {
            background: #3ab3a3 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }

        .showing-liked {
            color: red !important;
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        /* ✅ VIDEO THUMBNAIL IN PRODUCT CARD */
        .video-container {
            position: relative;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
            overflow: hidden;
            cursor: pointer;
        }

        .video-thumbnail {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            width: 100%;
            height: 100%;
            transition: all 0.3s ease;
        }

        .video-container:hover .video-thumbnail {
            transform: scale(1.05);
        }

        .video-play-icon {
            font-size: 80px;
            opacity: 0.9;
            transition: all 0.3s;
            filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
        }

        .video-container:hover .video-play-icon {
            transform: scale(1.2);
            opacity: 1;
        }

        .video-label {
            margin-top: 15px;
            font-size: 18px;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ✅ FULLSCREEN VIDEO MODAL */
        #video-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #video-modal.active {
            display: flex;
            opacity: 1;
        }

        .video-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 1;
        }

        .video-modal-content {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            padding: 60px 20px 20px;
        }

        .video-player-wrapper {
            width: 100%;
            max-width: 1400px;
            aspect-ratio: 16/9;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        }

        .video-player-wrapper iframe,
        .video-player-wrapper video {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        .video-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #333;
            transition: all 0.3s ease;
            z-index: 3;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .video-close-btn:hover {
            background: #FF6B6B;
            color: white;
            transform: rotate(90deg) scale(1.1);
        }

        .video-close-btn i {
            pointer-events: none;
        }

        /* Prevent video download */
        video::-webkit-media-controls-download-button {
            display: none !important;
        }

        video::-webkit-media-controls-enclosure {
            overflow: hidden;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .video-play-icon {
                font-size: 60px;
            }
            
            .video-label {
                font-size: 16px;
            }

            .video-modal-content {
                padding: 70px 10px 10px;
            }

            .video-player-wrapper {
                max-width: 100%;
                border-radius: 5px;
            }

            .video-close-btn {
                width: 45px;
                height: 45px;
                top: 15px;
                right: 15px;
                font-size: 20px;
            }
        }

        @media (max-width: 480px) {
            .video-play-icon {
                font-size: 50px;
            }
            
            .video-label {
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INITIALIZATION ===================
document.addEventListener("DOMContentLoaded", () => {
    addProductStyles();

    initializeMobileNavigation();
    initializeNavbarScrollEffect();
    initializeSearchFunctionality();
    initializeProductFilters();
    initializeNavbarIcons();
    initializeFloatingButtons();
    initializeLoadMore();
    initializeVideoPlayers();

    loadProductsFromSheet();

    userDataManager.updateCartCount();
});

// =================== AUTO REFRESH FUNCTIONALITY ===================
setInterval(() => {
    console.log("Auto refreshing products...");
    loadProductsFromSheet();
}, 5 * 60 * 1000);


// =================== FULLSCREEN IMAGE VIEWER ===================
function initializeImageModal() {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".close-btn");

    // Ensure modal is hidden initially
    if (modal) {
        modal.style.display = "none";
    }

    // product images par click → modal open
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("product-img")) {
            modal.style.display = "flex";
            modalImg.src = e.target.src;
        }
    });

    // ✖ close button
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // background click par close
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // ESC key par bhi close ho
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal) {
            modal.style.display = "none";
        }
    });
}


// =================== FONT AWESOME ICON FIX ===================
document.addEventListener('DOMContentLoaded', () => {
    // Force Font Awesome to load properly
    const icons = document.querySelectorAll('.fa-solid, .fab, .fas, .fa-regular, .fa-brands');
    icons.forEach(icon => {
        // Ensure proper font family
        icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 6 Brands"';
        icon.style.fontWeight = '900';
    });
});

// =================== VIDEO PLAYER FUNCTIONALITY ===================
function initializeVideoPlayers() {
    // Create video modal only once
    if (!document.getElementById('video-modal')) {
        const modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-overlay"></div>
            <div class="video-modal-content">
                <button class="video-close-btn">
                    <i class="fas fa-times"></i>
                </button>
                <div class="video-player-wrapper" id="video-player-wrapper"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const overlay = modal.querySelector('.video-modal-overlay');
        const closeBtn = modal.querySelector('.video-close-btn');
        const playerWrapper = modal.querySelector('#video-player-wrapper');

        // Close button click
        closeBtn.addEventListener('click', () => {
            closeVideoModal();
        });

        // Overlay click to close
        overlay.addEventListener('click', () => {
            closeVideoModal();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeVideoModal();
            }
        });

        function closeVideoModal() {
            modal.classList.remove('active');
            playerWrapper.innerHTML = ''; // Clear video/iframe
            document.body.style.overflow = ''; // Re-enable scroll
            document.dispatchEvent(new Event('video-modal-closed'));
        }
    }

    // Handle video thumbnail clicks
    document.addEventListener('click', function (e) {
        const thumbnail = e.target.closest('.video-thumbnail');
        if (!thumbnail) return;

        e.stopPropagation();
        e.preventDefault();

        const container = thumbnail.closest('.video-container');
        const videoSrc = container.dataset.videoSrc;
        const videoType = container.dataset.videoType;

        openVideoModal(videoSrc, videoType);
    });
}

function openVideoModal(videoSrc, videoType) {
    const modal = document.getElementById('video-modal');
    const playerWrapper = modal.querySelector('#video-player-wrapper');

    // Clear previous content
    playerWrapper.innerHTML = '';

    if (videoType === 'youtube') {
        // YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.src = videoSrc + (videoSrc.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        playerWrapper.appendChild(iframe);
    } else {
        // Direct video file
        const video = document.createElement('video');
        video.src = videoSrc;
        video.controls = true;
        video.controlsList = 'nodownload';
        video.autoplay = true;
        playerWrapper.appendChild(video);
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable scroll
    document.dispatchEvent(new Event('video-modal-opened'));
}