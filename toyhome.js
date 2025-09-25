// =================== CONFIG ===================
const SHOP_LOCATION = { lat: 23.0370158, lng: 72.5820909 }; // Abu Wala Toys coordinates
const DELIVERY_RANGE_KM = 70;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZ13CxV5hDUAVPw5fk8Z81Rbu3SNLQgRtRoTZilaQKVal-pgfUx2w3us8-LOL-LwmwbQ/exec";

// =================== SECURITY CHECKER ===================
const isHTTP = location.protocol === "http:";
const isHTTPS = location.protocol === "https:";

// =================== LOCATION MANAGER ===================
class LocationManager {
    constructor() {
        this.userLocation = JSON.parse(localStorage.getItem("abutoys_user_location") || "null");
        this.locationStatus = localStorage.getItem("abutoys_location_status") || "unknown";
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const toRad = deg => deg * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    getCurrentLocation(options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject({ code: 0, message: "Geolocation not supported" });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                err => reject(err),
                options
            );
        });
    }

    async checkLocationAndSetStatus() {
        try {
            const location = await this.getCurrentLocation();
            const distance = this.calculateDistance(location.lat, location.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);

            this.userLocation = location;
            localStorage.setItem("abutoys_user_location", JSON.stringify(location));

            if (distance <= DELIVERY_RANGE_KM) {
                this.locationStatus = "in_range";
                localStorage.setItem("abutoys_location_status", "in_range");
                showPopup(`Location Verified! You are within ${Math.round(distance)} km of the shop.`, "success");

                // Check if user is NOT logged in and we're on HTTPS, then show account modal
                setTimeout(() => {
                    if (isHTTPS && !userManager.isLoggedIn()) {
                        showAccountModal();
                    }
                }, 1000);
            } else {
                this.locationStatus = "out_of_range";
                localStorage.setItem("abutoys_location_status", "out_of_range");
                showPopup(`You are ${Math.round(distance)} km away. We do not deliver to this location.`, "warning");
            }

            return { location, distance, status: this.locationStatus };

        } catch (error) {
            console.warn("Location error:", error);

            if (error && error.code === error.PERMISSION_DENIED) {
                this.locationStatus = "permission_denied";
                localStorage.setItem("abutoys_location_status", "permission_denied");
                showPopup("Location permission denied. Please allow location access to verify delivery availability.", "warning");
            } else if (error && error.code === error.TIMEOUT) {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                showPopup("Location request timed out. Try again or check your device settings.", "warning");
            } else {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                showPopup("Unable to determine your location. Please enable location services and try again.", "warning");
            }

            return { location: null, distance: null, status: this.locationStatus, error };
        }
    }

    getLocationStatus() {
        return this.locationStatus;
    }
}

// =================== USER SYSTEM ===================
class UserManager {
    constructor() {
        this.currentUser = localStorage.getItem("abutoys_current_user");
        this.loadCurrentUser();
    }

    getUser(email) {
        try {
            return JSON.parse(localStorage.getItem(`abutoys_user_${email}`) || "null");
        } catch (e) {
            return null;
        }
    }

    // Check if user is logged in (not visitor, not null)
    isLoggedIn() {
        return this.currentUser && this.currentUser !== "visitor" && this.currentUser !== "null";
    }

    setCurrentUser(email) {
        localStorage.setItem("abutoys_current_user", email);
        this.currentUser = email;
        this.updateUserDisplay();
    }

    logout() {
        localStorage.removeItem("abutoys_current_user");
        this.currentUser = null;
        this.updateUserDisplay();
    }

    async register(userData) {
        // Block registration on HTTP
        if (isHTTP) {
            showPopup("Account creation is not available on unsecured connection. Please use HTTPS.", "error");
            return false;
        }

        try {
            showPopup("Creating your account...", "loading");

            // First save locally
            localStorage.setItem(`abutoys_user_${userData.email}`, JSON.stringify(userData));

            // Create FormData to match your HTML form structure
            const formData = new FormData();
            formData.append('fullName', userData.fullName);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('phone', userData.phone);
            formData.append('address', userData.address);

            // Send to Google Sheets using the same URL as your form action
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.setCurrentUser(userData.email);
                showPopup("Account created successfully!", "success");
                return true;
            } else if (result.error === 'email_exists') {
                showPopup("Email already registered! Try logging in instead.", "error");
                return false;
            } else {
                // Local save succeeded, sheet save failed - still allow registration
                this.setCurrentUser(userData.email);
                showPopup("Account created locally. Data will sync when server is available.", "success");
                return true;
            }

        } catch (error) {
            console.error("Registration error:", error);
            // If network fails, still allow local registration
            this.setCurrentUser(userData.email);
            showPopup("Account created locally (offline mode).", "success");
            return true;
        }
    }

    async login(email, password) {
        // Block login on HTTP
        if (isHTTP) {
            showPopup("Login is not available on unsecured connection. Please use HTTPS.", "error");
            return null;
        }

        try {
            showPopup("Logging in...", "loading");

            // Check local storage first
            const localUser = this.getUser(email);
            if (localUser && localUser.password === password) {
                this.setCurrentUser(email);
                showPopup("Login successful!", "success");
                return localUser;
            }

            // Try server login
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password })
            });

            const result = await response.json();

            if (result.success) {
                // Store server user data locally
                if (result.user) {
                    const userData = { ...result.user, password }; // Add password for local storage
                    localStorage.setItem(`abutoys_user_${email}`, JSON.stringify(userData));
                }
                this.setCurrentUser(email);
                showPopup("Login successful!", "success");
                return result.user;
            } else {
                showPopup("Account not found or incorrect credentials.", "error");
                throw new Error("login_failed");
            }

        } catch (error) {
            console.error("Login error:", error);

            // Fallback to local login if network error
            const localUser = this.getUser(email);
            if (localUser && localUser.password === password) {
                this.setCurrentUser(email);
                showPopup("Login successful (offline mode)!", "success");
                return localUser;
            }

            showPopup("Login failed. Please check your credentials.", "error");
            throw error;
        }
    }

    updateUserDisplay() {
        const userNameDisplay = document.getElementById("userNameDisplay");
        const userIcon = document.getElementById("userIcon");

        if (this.currentUser && this.currentUser !== "visitor") {
            const user = this.getUser(this.currentUser);
            if (user) {
                userNameDisplay.textContent = `Hello ${user.fullName}!`;
                userNameDisplay.style.display = "block";
                userIcon.classList.add("active");
                userIcon.title = `Logged in as ${user.fullName}`;
                return;
            }
        } else if (this.currentUser === "visitor") {
            userNameDisplay.textContent = "Hello Visitor!";
            userNameDisplay.style.display = "block";
            userIcon.classList.remove("active");
            userIcon.title = "Visitor Mode";
            return;
        }

        userNameDisplay.style.display = "none";
        userIcon.classList.remove("active");
        userIcon.title = "Account";
    }

    loadCurrentUser() {
        if (this.currentUser) this.updateUserDisplay();
    }

    getCurrentUserName() {
        if (this.currentUser && this.currentUser !== "visitor") {
            const user = this.getUser(this.currentUser);
            return user ? user.fullName : "User";
        }
        return "Visitor";
    }
}

// =================== INITIALIZE MANAGERS ===================
const locationManager = new LocationManager();
const userManager = new UserManager();

// =================== SECURITY HANDLER (HTTP vs HTTPS) ===================
function enforceSecurityMode() {
    if (isHTTP) {
        // Force Visitor Mode automatically on HTTP
        localStorage.setItem("abutoys_current_user", "visitor");
        userManager.currentUser = "visitor";
        userManager.updateUserDisplay();

        // Show HTTP warning popup
        showPopup("You are browsing on an unsecured connection (HTTP). Visitor Mode is enabled for your safety.", "warning");
        
        // Block user features on HTTP
        blockHTTPFeatures();
    }
}

function blockHTTPFeatures() {
    // Block user icon functionality
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
        userIcon.style.opacity = "0.5";
        userIcon.style.cursor = "not-allowed";
        userIcon.title = "Account features disabled on HTTP";
    }

    // Block cart icon functionality
    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.style.opacity = "0.5";
        cartIcon.style.cursor = "not-allowed";
        cartIcon.title = "Cart features disabled on HTTP";
    }

    // You can add more elements to block here
    const elementsToBlock = document.querySelectorAll('.secure-only');
    elementsToBlock.forEach(el => {
        el.style.opacity = "0.5";
        el.style.cursor = "not-allowed";
        el.title = "Feature disabled on HTTP";
    });
}

function handleHTTPClick(elementName) {
    showPopup(`${elementName} is not available on unsecured connection (HTTP). Please use HTTPS for full functionality.`, "error");
}

// Initialize security mode only once
enforceSecurityMode();

// =================== WHATSAPP INTEGRATION ===================
function openWhatsApp() {
    const locationStatus = locationManager.getLocationStatus();
    const userName = userManager.getCurrentUserName();

    if (locationStatus === "permission_denied" || locationStatus === "unknown") {
        showPopup("WhatsApp access restricted until we can verify your location. Please enable location access.", "error");
        return;
    }

    let message;
    if (locationStatus === "in_range") {
        message = `Hi ${userName} from Ahmedabad. In range of ${DELIVERY_RANGE_KM} km`;
    } else {
        message = `Hi ${userName} from Ahmedabad. But not in the delivery range.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9879254030?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// =================== ACCOUNT MODAL ===================
function showAccountModal() {
    // Block account modal on HTTP
    if (isHTTP) {
        handleHTTPClick("Account");
        return;
    }

    const locationStatus = locationManager.getLocationStatus();

    // If user is already logged in, don't show the modal
    if (userManager.isLoggedIn()) {
        showPopup(`Welcome back ${userManager.getCurrentUserName()}!`, "success");
        return;
    }

    if (locationStatus === "in_range") {
        document.getElementById("accountModal").style.display = "block";
    } else if (locationStatus === "out_of_range") {
        showPopup("Account access restricted. You are outside our delivery range.", "warning");
    } else if (locationStatus === "permission_denied") {
        showPopup("Please allow location permission to create an account and check delivery availability.", "warning");
    } else {
        showPopup("We cannot verify your location right now. Please try again.", "warning");
    }
}

function closeAccountModal() {
    document.getElementById("accountModal").style.display = "none";
}

function showTab(tab) {
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tabC => tabC.classList.remove("active"));
    document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add("active");
    document.getElementById(tab + "Tab").classList.add("active");
}

function setVisitorMode() {
    const locationStatus = locationManager.getLocationStatus();
    if (locationStatus === "in_range" || locationStatus === "out_of_range") {
        localStorage.setItem("abutoys_current_user", "visitor");
        document.getElementById("accountModal").style.display = "none";
        userManager.currentUser = "visitor";
        userManager.updateUserDisplay();
        showPopup("Welcome Visitor! You can browse our products.", "success");
    } else {
        showPopup("We need to verify your location before you can use Visitor mode.", "warning");
    }
}

// =================== CART FUNCTIONALITY ===================
function handleCartClick() {
    if (isHTTP) {
        handleHTTPClick("Cart");
        return;
    }
    
    // Your cart functionality here
    console.log("Cart clicked - full functionality available on HTTPS");
    // Add your cart logic here
}

// =================== POPUP SYSTEM ===================
function showPopup(message, type = "info") {
    const old = document.getElementById("custom-popup");
    if (old) old.remove();

    const colors = {
        success: { bg: "#4CAF50", text: "#fff" },
        error: { bg: "#f44336", text: "#fff" },
        warning: { bg: "#ff9800", text: "#fff" },
        loading: { bg: "#2196F3", text: "#fff" },
        info: { bg: "#fff", text: "#333" }
    };

    const color = colors[type] || colors.info;
    const isLoading = type === "loading";

    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;
        z-index:10001; color:${color.text}; font-size:1.1rem; text-align:center;
    `;
    popup.innerHTML = `
        <div style="background:${color.bg}; color:${color.text}; padding:1.6rem; border-radius:14px; max-width:420px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
            <p style="margin-bottom: ${isLoading ? '0' : '1rem'};">${message}</p>
            ${!isLoading ? '<button id="popup-ok" style="margin-top:0.6rem; padding:8px 16px; border:none; border-radius:8px; background:rgba(255,255,255,0.9); color:#333; cursor:pointer; font-weight:bold;">OK</button>' : '<div style="margin-top:0.6rem;">Loading...</div>'}
        </div>
    `;

    if (!isLoading) {
        popup.querySelector("#popup-ok").addEventListener("click", () => popup.remove());
        setTimeout(() => {
            const el = document.getElementById("custom-popup");
            if (el) el.remove();
        }, 5000);
    }

    document.body.appendChild(popup);

    if (isLoading) {
        setTimeout(() => {
            const el = document.getElementById("custom-popup");
            if (el) el.remove();
        }, 10000);
    }
}

// =================== FORMS & DOM ===================
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const userIcon = document.getElementById("userIcon");
    const cartIcon = document.getElementById("cartIcon");

    // Phone number validation
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();

            if (isHTTP) {
                handleHTTPClick("Registration");
                return;
            }

            const phone = document.getElementById("phone").value;
            if (phone.length !== 10) {
                showPopup("Phone number must be exactly 10 digits!", "error");
                return;
            }

            const userData = {
                fullName: document.getElementById("fullName").value.trim(),
                email: document.getElementById("email").value.trim().toLowerCase(),
                password: document.getElementById("password").value,
                phone: "+91" + phone,
                address: document.getElementById("address") ? document.getElementById("address").value.trim() : ""
            };

            const success = await userManager.register(userData);
            if (success) {
                closeAccountModal();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            
            if (isHTTP) {
                handleHTTPClick("Login");
                return;
            }

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            try {
                await userManager.login(email, password);
                closeAccountModal();
            } catch (error) {
                // Error handling done in login method
            }
        });
    }

    // User icon click handler
    if (userIcon) {
        userIcon.addEventListener("click", () => {
            if (isHTTP) {
                handleHTTPClick("Account");
                return;
            }

            if (userManager.isLoggedIn()) {
                // User is logged in, show user options or profile
                showPopup(`Hello ${userManager.getCurrentUserName()}! You are already logged in.`, "info");
            } else {
                // User is not logged in, show account modal
                showAccountModal();
            }
        });
    }

    // Cart icon click handler
    if (cartIcon) {
        cartIcon.addEventListener("click", handleCartClick);
    }

    // Initialize floating buttons after DOM is loaded
    createFloatingButtons();
});

// =================== WELCOME & INITIAL LOCATION CHECK ===================
function showWelcomeMessage() {
    if (!sessionStorage.getItem("abutoys_welcomed")) {
        setTimeout(() => {
            const popup = document.createElement("div");
            popup.id = "welcome-popup";
            popup.style.cssText = `
                position: fixed; top:0; left:0; width:100%; height:100%;
                background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;
                z-index:10001; color:#fff; font-size:1.1rem; text-align:center;
            `;
            popup.innerHTML = `
                <div style="background:linear-gradient(45deg, #FF6B6B, #4ECDC4); color:#fff; padding:1.6rem; border-radius:14px; max-width:420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <h2 style="margin-bottom:0.8rem; font-family: 'Fredoka One', cursive;">Welcome to AbuToys!</h2>
                    <p style="margin-bottom:1rem;">Enjoy shopping for the best toys in Ahmedabad!</p>
                    <button id="welcomeOkBtn" style="padding:10px 20px; border:none; border-radius:12px; background:rgba(255,255,255,0.9); color:#333; cursor:pointer; font-weight:bold;">
                        OK, Let's Start!
                    </button>
                </div>
            `;

            document.body.appendChild(popup);

            document.getElementById("welcomeOkBtn").addEventListener("click", async () => {
                popup.remove();
                sessionStorage.setItem("abutoys_welcomed", "true");

                showPopup("Checking your location for delivery...", "loading");
                setTimeout(async () => {
                    const oldPopup = document.getElementById("custom-popup");
                    if (oldPopup) oldPopup.remove();
                    await locationManager.checkLocationAndSetStatus();
                }, 1000);
            });
        }, 700);
    }
}

// =================== UI COMPONENTS ===================
function initMobileNavigation() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    if (!hamburger) return;

    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
        });
    });
}

function initHeroSlider() {
    let current = 0;
    const slides = document.querySelectorAll(".slide");
    if (!slides || slides.length === 0) return;
    setInterval(() => {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
    }, 5000);
}

// =================== FLOATING BUTTONS ===================
function createFloatingButtons() {
    // WhatsApp Float Button
    const whatsappFloat = document.createElement("div");
    whatsappFloat.className = "whatsapp-float";
    whatsappFloat.innerHTML = `<i class="fab fa-whatsapp"></i>`;
    whatsappFloat.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: #25d366;
        color: white;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        cursor: pointer;
        z-index: 999;
        font-size: 28px;
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
    `;

    whatsappFloat.addEventListener("mouseenter", () => {
        whatsappFloat.style.transform = "scale(1.05)";
        whatsappFloat.style.boxShadow = "0 6px 25px rgba(37, 211, 102, 0.6)";
    });

    whatsappFloat.addEventListener("mouseleave", () => {
        whatsappFloat.style.transform = "scale(1)";
        whatsappFloat.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4)";
    });

    whatsappFloat.addEventListener("click", openWhatsApp);
    document.body.appendChild(whatsappFloat);

    // Show/Hide floating buttons on scroll
    window.addEventListener("scroll", () => {
        // Navbar background change
        const navbar = document.getElementById("navbar");
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = "rgba(255,255,255,0.98)";
                navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.15)";
            } else {
                navbar.style.background = "rgba(255,255,255,0.95)";
                navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
            }
        }

        // Show/hide floating buttons
        if (window.scrollY > 300) {
            whatsappFloat.style.opacity = "1";
            whatsappFloat.style.visibility = "visible";
            backToTop.style.opacity = "1";
            backToTop.style.visibility = "visible";
        } else {
            whatsappFloat.style.opacity = "0";
            whatsappFloat.style.visibility = "hidden";
            backToTop.style.opacity = "0";
            backToTop.style.visibility = "hidden";
        }
    });
}

// =================== INITIALIZATION ===================
initMobileNavigation();
initHeroSlider();
showWelcomeMessage();

// WhatsApp click handler for other elements
document.addEventListener("click", (e) => {
    if (e.target.closest('a') && e.target.closest('a').href && e.target.closest('a').href.includes("wa.me")) {
        e.preventDefault();
        openWhatsApp();
    }
});