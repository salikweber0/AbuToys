// =================== CONFIG ===================
const SHOP_LOCATION = { lat: 23.0370158, lng: 72.5820909 };
const DELIVERY_RANGE_KM = 70;

const SIGNUP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbEngmoTmToctj42O6J0-Qq7g05JIpHRE-aFzCGd7zg6yuATa8C26pDYtkmPLnQVUK/exec";
const LOGIN_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbEngmoTmToctj42O6J0-Qq7g05JIpHRE-aFzCGd7zg6yuATa8C26pDYtkmPLnQVUK/exec";

// =================== SECURITY CHECKER ===================
const isLocalhost = location.hostname === "127.0.0.1" || location.hostname === "localhost";
const isHTTP = location.protocol === "http:" && !isLocalhost;
const isHTTPS = location.protocol === "https:";

// =================== LOCATION MANAGER ===================
class LocationManager {
    constructor() {
        this.userLocation = JSON.parse(localStorage.getItem("abutoys_user_location") || "null");
        this.locationStatus = localStorage.getItem("abutoys_location_status") || "unknown";
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const toRad = deg => deg * (Math.PI / 180);
        
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    }

    calculateDeliveryCharge(distance) {
        if (distance <= 0.5) return 0;
        else if (distance <= 1.5) return 15;
        else if (distance <= 2.5) return 25;
        else if (distance <= 3.5) return 35;
        else if (distance <= 4.5) return 45;
        else if (distance <= 5.5) return 55;
        else if (distance <= 6.5) return 65;
        else if (distance <= 7.5) return 75;
        else if (distance <= 8.5) return 85;
        else if (distance <= 9.5) return 95;
        else if (distance <= 10.5) return 105;
        else if (distance <= 70) return 105 + Math.floor((distance - 10.5)) * 10;
        else return -1;
    }

    async checkLocationAvailability() {
        if ('permissions' in navigator) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                return result.state;
            } catch (e) {
                return 'prompt';
            }
        }
        return 'prompt';
    }

    getCurrentLocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject({ code: 0, message: "Geolocation not supported" });
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                err => reject(err),
                { ...options, maximumAge: 0 }
            );
        });
    }

    async checkLocationAndSetStatus() {
        try {
            const permissionStatus = await this.checkLocationAvailability();
            
            if (permissionStatus === 'denied') {
                this.locationStatus = "permission_denied";
                localStorage.setItem("abutoys_location_status", "permission_denied");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Location permission is blocked. Please enable location permission in your browser settings.", "warning");
                return { location: null, distance: null, status: this.locationStatus };
            }

            showPopup("Getting your location...", "loading");
            
            const location = await this.getCurrentLocation();
            const distance = this.calculateDistance(location.lat, location.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
            const deliveryCharge = this.calculateDeliveryCharge(distance);

            this.userLocation = location;
            localStorage.setItem("abutoys_user_location", JSON.stringify(location));
            localStorage.setItem("abutoys_user_distance", distance.toFixed(2));
            localStorage.setItem("abutoys_delivery_charge", deliveryCharge.toString());

            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();

            if (distance <= DELIVERY_RANGE_KM && deliveryCharge !== -1) {
                this.locationStatus = "in_range";
                localStorage.setItem("abutoys_location_status", "in_range");
                
                if (distance <= 0.5) {
                    showPopup(`Location Verified! You are very close (${distance.toFixed(2)} km). Consider visiting us!`, "success");
                } else {
                    showPopup(`Location Verified! Delivery charge: Rs.${deliveryCharge}`, "success");
                }

                s// Always show account modal after location verification
                setTimeout(() => {
                    if (!userManager.isLoggedIn()) {
                        showAccountModal();
                    }
                }, 1000);
            } else {
                this.locationStatus = "out_of_range";
                localStorage.setItem("abutoys_location_status", "out_of_range");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup(`You are ${Math.round(distance)} km away. We do not deliver to this location.`, "warning");
            }

            return { location, distance, status: this.locationStatus, deliveryCharge };

        } catch (error) {
            console.warn("Location error:", error);

            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();

            if (error && error.code === 1) {
                this.locationStatus = "permission_denied";
                localStorage.setItem("abutoys_location_status", "permission_denied");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Location permission denied. Please allow location access.", "warning");
            } else if (error && error.code === 2) {
                this.locationStatus = "location_unavailable";
                localStorage.setItem("abutoys_location_status", "location_unavailable");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Your device location is OFF. Please turn on GPS and try again.", "warning");
            } else if (error && error.code === 3) {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Location request timed out. Please check your GPS signal.", "warning");
            } else {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Unable to get your location. Please enable location services.", "warning");
            }

            return { location, distance: null, status: this.locationStatus, error };
        }
    }

    getLocationStatus() {
        return this.locationStatus;
    }
}

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

    isLoggedIn() {
        return this.currentUser && this.currentUser !== "visitor" && this.currentUser !== "null";
    }

    isFreeVisit() {
        return this.currentUser === "visitor";
    }

    setCurrentUser(email) {
        localStorage.setItem("abutoys_current_user", email);
        this.currentUser = email;
        this.updateUserDisplay();
        this.enableFeaturesForLoggedInUser();
    }

    logout() {
        localStorage.removeItem("abutoys_current_user");
        this.currentUser = null;
        this.updateUserDisplay();
    }

    async login(email, password) {
        const localUser = this.getUser(email);
        if (localUser) {
            if (localUser.password === password) {
                this.setCurrentUser(email);
                return { success: true, message: "Login successful!" };
            } else {
                return { success: false, error: "Password incorrect" };
            }
        }

        try {
            showPopup("Checking credentials...", "loading");
            const response = await fetch(`${LOGIN_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            const data = await response.json();

            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();

            if (data.success && data.user) {
                const userData = {
                    fullName: data.user.fullName,
                    email: data.user.email,
                    password: data.user.password,
                    phone: data.user.phone,
                    address: data.user.address
                };
                localStorage.setItem(`abutoys_user_${email}`, JSON.stringify(userData));
                this.setCurrentUser(email);
                return { success: true, message: "Login successful!" };
            } else if (data.error === "account_deleted") {
                return { success: false, error: "This account has been deleted" };
            } else if (data.error === "wrong_password") {
                return { success: false, error: "Password incorrect" };
            } else {
                return { success: false, error: "Account not found" };
            }
        } catch (error) {
            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();
            console.error("Login error:", error);
            return { success: false, error: "Server error. Please try again." };
        }
    }

    async register(userData) {
        if (isHTTP) {
            showPopup("Account creation not available on HTTP.", "error");
            return false;
        }

        try {
            showPopup("Creating your account...", "loading");

            const formData = new FormData();
            formData.append("fullName", userData.fullName);
            formData.append("email", userData.email);
            formData.append("password", userData.password);
            formData.append("phone", userData.phone);
            formData.append("address", userData.address);

            const response = await fetch(SIGNUP_SCRIPT_URL, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem(`abutoys_user_${userData.email}`, JSON.stringify(userData));
                this.setCurrentUser(userData.email);
                showPopup("Account created successfully!", "success");
                return true;
            } else if (result.error === "email_exists") {
                showPopup("Email already registered! Try logging in.", "error");
                return false;
            } else {
                showPopup("Signup failed. Try again later.", "error");
                return false;
            }

        } catch (error) {
            console.error("Registration error:", error);
            showPopup("Server error. Please try again later.", "error");
            return false;
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
            userIcon.title = "Visitor Mode - Click to Sign In";
            return;
        }

        userNameDisplay.style.display = "none";
        userIcon.classList.remove("active");
        userIcon.title = "Account";
    }

    loadCurrentUser() {
        if (this.currentUser) {
            this.updateUserDisplay();
            if (this.isFreeVisit()) {
                this.disableFeaturesForVisitor();
            }
        }
    }

    getCurrentUserName() {
        if (this.currentUser && this.currentUser !== "visitor") {
            const user = this.getUser(this.currentUser);
            return user ? user.fullName : "User";
        }
        return "Visitor";
    }

    enableFeaturesForLoggedInUser() {
        const whatsappFloat = document.querySelector(".whatsapp-float");
        const cartIcon = document.getElementById("cartIcon");
        
        if (whatsappFloat) {
            whatsappFloat.style.opacity = "1";
            whatsappFloat.style.cursor = "pointer";
        }
        
        if (cartIcon) {
            cartIcon.style.opacity = "1";
            cartIcon.style.cursor = "pointer";
        }
    }

    disableFeaturesForVisitor() {
        const whatsappFloat = document.querySelector(".whatsapp-float");
        const cartIcon = document.getElementById("cartIcon");
        
        if (whatsappFloat) {
            whatsappFloat.style.opacity = "0.5";
            whatsappFloat.style.cursor = "not-allowed";
        }
        
        if (cartIcon) {
            cartIcon.style.opacity = "0.5";
            cartIcon.style.cursor = "not-allowed";
        }
    }
}

// =================== INITIALIZE MANAGERS ===================
const locationManager = new LocationManager();
const userManager = new UserManager();

// =================== SECURITY HANDLER ===================
function enforceSecurityMode() {
    if (isHTTP) {
        localStorage.setItem("abutoys_current_user", "visitor");
        userManager.currentUser = "visitor";
        userManager.updateUserDisplay();
        showPopup("You are on HTTP. Visitor Mode enabled for safety.", "warning");
        blockHTTPFeatures();
    }
}

function blockHTTPFeatures() {
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
        userIcon.style.opacity = "0.5";
        userIcon.style.cursor = "not-allowed";
    }

    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.style.opacity = "0.5";
        cartIcon.style.cursor = "not-allowed";
    }
}

function handleHTTPClick(elementName) {
    showPopup(`${elementName} not available on HTTP.`, "error");
}

enforceSecurityMode();

// =================== WHATSAPP INTEGRATION ===================
function openWhatsApp() {
    if (userManager.isFreeVisit()) {
        showPopup("WhatsApp is disabled in Free Visit mode. Please sign in to access support.", "warning");
        return;
    }

    const locationStatus = locationManager.getLocationStatus();
    const userName = userManager.getCurrentUserName();

    if (locationStatus === "permission_denied" || locationStatus === "location_unavailable") {
        showPopup("Please enable location to access WhatsApp.", "error");
        return;
    }

    let message;
    if (locationStatus === "in_range") {
        message = `Hi, I am ${userName} from Ahmedabad. In the range of ${DELIVERY_RANGE_KM} km`;
    } else {
        message = `Hi, I am ${userName} from Ahmedabad. Not in delivery range.`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/9879254030?text=${encodedMessage}`, '_blank');
}

// =================== ACCOUNT MODAL ===================
function showAccountModal() {
    if (isHTTP) {
        handleHTTPClick("Account");
        return;
    }

    if (userManager.isLoggedIn()) {
        window.location.href = "userprofile.html";
        return;
    }

    document.getElementById("accountModal").style.display = "block";
}

function closeAccountModal() {
    showPopup("Please choose Sign In or Free Visit to continue", "warning");
    return false;
}

function showTab(tab) {
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tabC => tabC.classList.remove("active"));
    document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add("active");
    document.getElementById(tab + "Tab").classList.add("active");
}

function setVisitorMode() {
    localStorage.setItem("abutoys_current_user", "visitor");
    document.getElementById("accountModal").style.display = "none";
    userManager.currentUser = "visitor";
    userManager.updateUserDisplay();
    userManager.disableFeaturesForVisitor();
    
    showPopup("Welcome Visitor! Browse only mode activated. Cart and WhatsApp are disabled.", "success");
}

// =================== CART FUNCTIONALITY ===================
function handleCartClick() {
    if (isHTTP) {
        handleHTTPClick("Cart");
        return;
    }

    if (userManager.isFreeVisit()) {
        showPopup("Cart is disabled in Free Visit mode. Please sign in to add items.", "warning");
        return;
    }

    console.log("Cart clicked");
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
}

// =================== FORMS & DOM ===================
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const userIcon = document.getElementById("userIcon");
    const cartIcon = document.getElementById("cartIcon");

    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            const result = await userManager.login(email, password);
            
            if (result.success) {
                document.getElementById("accountModal").style.display = "none";
                showPopup(result.message, "success");
                setTimeout(() => location.reload(), 1000);
            } else {
                showPopup(result.error, "error");
            }
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
                showPopup("Phone number must be 10 digits!", "error");
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
                document.getElementById("accountModal").style.display = "none";
                setTimeout(() => location.reload(), 1000);
            }
        });
    }

    if (userIcon) {
        userIcon.addEventListener("click", () => {
            if (isHTTP) {
                handleHTTPClick("Account");
                return;
            }

            if (userManager.isLoggedIn()) {
                window.location.href = "userprofile.html";
            } else {
                showAccountModal();
            }
        });
    }

    if (cartIcon) {
        cartIcon.addEventListener("click", handleCartClick);
    }

    createFloatingButtons();
});

// =================== WELCOME & INITIAL LOCATION CHECK ===================
function showWelcomeMessage() {
    const isFirstVisit = !sessionStorage.getItem("abutoys_welcomed");
    
    if (isFirstVisit) {
        setTimeout(() => {
            const popup = document.createElement("div");
            popup.id = "welcome-popup";
            popup.style.cssText = `
                position: fixed; top:0; left:0; width:100%; height:100%;
                background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;
                z-index:10001;
            `;
            popup.innerHTML = `
                <div style="background:linear-gradient(45deg, #FF6B6B, #4ECDC4); color:#fff; padding:1.6rem; border-radius:14px; max-width:420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align:center;">
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
                await locationManager.checkLocationAndSetStatus();
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
    const whatsappFloat = document.createElement("div");
    whatsappFloat.className = "whatsapp-float";
    whatsappFloat.innerHTML = `<i class="fab fa-whatsapp"></i>`;
    whatsappFloat.style.cssText = `
        position: fixed; bottom: 100px; right: 20px;
        background: #25d366; color: white; border-radius: 50%;
        width: 60px; height: 60px; display: flex;
        align-items: center; justify-content: center;
        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        cursor: pointer; z-index: 999; font-size: 28px;
        transition: all 0.3s ease; opacity: 0; visibility: hidden;
    `;

    whatsappFloat.addEventListener("mouseenter", () => {
        whatsappFloat.style.transform = "scale(1.05)";
    });

    whatsappFloat.addEventListener("mouseleave", () => {
        whatsappFloat.style.transform = "scale(1)";
    });

    whatsappFloat.addEventListener("click", openWhatsApp);
    document.body.appendChild(whatsappFloat);

    window.addEventListener("scroll", () => {
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

        if (window.scrollY > 300) {
            whatsappFloat.style.opacity = "1";
            whatsappFloat.style.visibility = "visible";
        } else {
            whatsappFloat.style.opacity = "0";
            whatsappFloat.style.visibility = "hidden";
        }
    });
}



