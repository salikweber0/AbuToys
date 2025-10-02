// =================== CONFIG ===================
const SHOP_LOCATION = { lat: 23.0370158, lng: 72.5820909 }; // Abu Wala Toys coordinates
const DELIVERY_RANGE_KM = 70;

// Alag URLs
const SIGNUP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbEngmoTmToctj42O6J0-Qq7g05JIpHRE-aFzCGd7zg6yuATa8C26pDYtkmPLnQVUK/exec";

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
        const R = 6371; // Earth radius in km
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
    // Distance in km
    if (distance <= 0.5) {
        return 0; // Free - shop ke paas hai
    } else if (distance > 0.5 && distance <= 1.5) {
        return 15;
    } else if (distance > 1.5 && distance <= 2.5) {
        return 25;
    } else if (distance > 2.5 && distance <= 3.5) {
        return 35;
    } else if (distance > 3.5 && distance <= 4.5) {
        return 45;
    } else if (distance > 4.5 && distance <= 5.5) {
        return 55;
    } else if (distance > 5.5 && distance <= 6.5) {
        return 65;
    } else if (distance > 6.5 && distance <= 7.5) {
        return 75;
    } else if (distance > 7.5 && distance <= 8.5) {
        return 85;
    } else if (distance > 8.5 && distance <= 9.5) {
        return 95;
    } else if (distance > 9.5 && distance <= 10.5) {
        return 105;
    } else if (distance > 10.5 && distance <= 11.5) {
        return 115;
    } else if (distance > 11.5 && distance <= 12.5) {
        return 125;
    } else if (distance > 12.5 && distance <= 13.5) {
        return 135;
    } else if (distance > 13.5 && distance <= 14.5) {
        return 145;
    } else if (distance > 14.5 && distance <= 15.5) {
        return 155;
    } else if (distance > 15.5 && distance <= 16.5) {
        return 165;
    } else if (distance > 16.5 && distance <= 17.5) {
        return 175;
    } else if (distance > 17.5 && distance <= 18.5) {
        return 185;
    } else if (distance > 18.5 && distance <= 19.5) {
        return 195;
    } else if (distance > 19.5 && distance <= 20.5) {
        return 205;
    } else if (distance > 20.5 && distance <= 21.5) {
        return 215;
    } else if (distance > 21.5 && distance <= 22.5) {
        return 225;
    } else if (distance > 22.5 && distance <= 23.5) {
        return 235;
    } else if (distance > 23.5 && distance <= 24.5) {
        return 245;
    } else if (distance > 24.5 && distance <= 25.5) {
        return 255;
    } else if (distance > 25.5 && distance <= 26.5) {
        return 265;
    } else if (distance > 26.5 && distance <= 27.5) {
        return 275;
    } else if (distance > 27.5 && distance <= 28.5) {
        return 285;
    } else if (distance > 28.5 && distance <= 29.5) {
        return 295;
    } else if (distance > 29.5 && distance <= 30.5) {
        return 305;
    } else if (distance > 30.5 && distance <= 31.5) {
        return 315;
    } else if (distance > 31.5 && distance <= 32.5) {
        return 325;
    } else if (distance > 32.5 && distance <= 33.5) {
        return 335;
    } else if (distance > 33.5 && distance <= 34.5) {
        return 345;
    } else if (distance > 34.5 && distance <= 35.5) {
        return 355;
    } else if (distance > 35.5 && distance <= 36.5) {
        return 365;
    } else if (distance > 36.5 && distance <= 37.5) {
        return 375;
    } else if (distance > 37.5 && distance <= 38.5) {
        return 385;
    } else if (distance > 38.5 && distance <= 39.5) {
        return 395;
    } else if (distance > 39.5 && distance <= 40.5) {
        return 405;
    } else if (distance > 40.5 && distance <= 41.5) {
        return 415;
    } else if (distance > 41.5 && distance <= 42.5) {
        return 425;
    } else if (distance > 42.5 && distance <= 43.5) {
        return 435;
    } else if (distance > 43.5 && distance <= 44.5) {
        return 445;
    } else if (distance > 44.5 && distance <= 45.5) {
        return 455;
    } else if (distance > 45.5 && distance <= 46.5) {
        return 465;
    } else if (distance > 46.5 && distance <= 47.5) {
        return 475;
    } else if (distance > 47.5 && distance <= 48.5) {
        return 485;
    } else if (distance > 48.5 && distance <= 49.5) {
        return 495;
    } else if (distance > 49.5 && distance <= 50.5) {
        return 505;
    } else if (distance > 50.5 && distance <= 51.5) {
        return 515;
    } else if (distance > 51.5 && distance <= 52.5) {
        return 525;
    } else if (distance > 52.5 && distance <= 53.5) {
        return 535;
    } else if (distance > 53.5 && distance <= 54.5) {
        return 545;
    } else if (distance > 54.5 && distance <= 55.5) {
        return 555;
    } else if (distance > 55.5 && distance <= 56.5) {
        return 565;
    } else if (distance > 56.5 && distance <= 57.5) {
        return 575;
    } else if (distance > 57.5 && distance <= 58.5) {
        return 585;
    } else if (distance > 58.5 && distance <= 59.5) {
        return 595;
    } else if (distance > 59.5 && distance <= 60.5) {
        return 605;
    } else if (distance > 60.5 && distance <= 61.5) {
        return 615;
    } else if (distance > 61.5 && distance <= 62.5) {
        return 625;
    } else if (distance > 62.5 && distance <= 63.5) {
        return 635;
    } else if (distance > 63.5 && distance <= 64.5) {
        return 645;
    } else if (distance > 64.5 && distance <= 65.5) {
        return 655;
    } else if (distance > 65.5 && distance <= 66.5) {
        return 665;
    } else if (distance > 66.5 && distance <= 67.5) {
        return 675;
    } else if (distance > 67.5 && distance <= 68.5) {
        return 685;
    } else if (distance > 68.5 && distance <= 69.5) {
        return 695;
    } else if (distance > 69.5 && distance <= 70) {
        return 705;
    } else {
        return -1; // Out of range (70km se zyada)
    }
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
                options
            );
        });
    }

    async checkLocationAndSetStatus() {
        try {
            const location = await this.getCurrentLocation();
            const distance = this.calculateDistance(location.lat, location.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
            const deliveryCharge = this.calculateDeliveryCharge(distance);

            this.userLocation = location;
            localStorage.setItem("abutoys_user_location", JSON.stringify(location));
            localStorage.setItem("abutoys_user_distance", distance.toFixed(2));
            localStorage.setItem("abutoys_delivery_charge", deliveryCharge.toString());

            if (distance <= DELIVERY_RANGE_KM && deliveryCharge !== -1) {
                this.locationStatus = "in_range";
                localStorage.setItem("abutoys_location_status", "in_range");
                
                if (distance <= 0.5) {
                    showPopup(`Location Verified! You are very close to our shop (${distance.toFixed(2)} km). Consider visiting us for offline purchase!`, "success");
                } else {
                    showPopup(`Location Verified! Delivery charge: ₹${deliveryCharge}`, "success");
                }

                setTimeout(() => {
                    if (isHTTPS && !userManager.isLoggedIn()) {
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

            if (error && error.code === error.PERMISSION_DENIED) {
                this.locationStatus = "permission_denied";
                localStorage.setItem("abutoys_location_status", "permission_denied");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Location permission denied. Please allow location access to verify delivery availability.", "warning");
            } else if (error && error.code === error.TIMEOUT) {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Location request timed out. Try again or check your device settings.", "warning");
            } else {
                this.locationStatus = "unknown";
                localStorage.setItem("abutoys_location_status", "unknown");
                localStorage.setItem("abutoys_delivery_charge", "0");
                showPopup("Unable to determine your location. Please enable location services and try again.", "warning");
            }

            return { location: null, distance: null, status: this.locationStatus, error };
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
        if (isHTTP) {
            showPopup("Account creation is not available on unsecured connection. Please use HTTPS.", "error");
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
                showPopup("✅ Account created successfully!", "success");
                return true;
            } else if (result.error === "email_exists") {
                showPopup("❌ Email already registered! Try logging in instead.", "error");
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
        localStorage.setItem("abutoys_current_user", "visitor");
        userManager.currentUser = "visitor";
        userManager.updateUserDisplay();
        showPopup("You are browsing on an unsecured connection (HTTP). Visitor Mode is enabled for your safety.", "warning");
        blockHTTPFeatures();
    }
}

function blockHTTPFeatures() {
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
        userIcon.style.opacity = "0.5";
        userIcon.style.cursor = "not-allowed";
        userIcon.title = "Account features disabled on HTTP";
    }

    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.style.opacity = "0.5";
        cartIcon.style.cursor = "not-allowed";
        cartIcon.title = "Cart features disabled on HTTP";
    }

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

enforceSecurityMode();

// =================== WHATSAPP INTEGRATION ===================
function openWhatsApp() {
    const locationStatus = locationManager.getLocationStatus();
    const userName = userManager.getCurrentUserName();

    if (userManager.currentUser === "visitor") {
        showPopup("Sorry, you are unable to use this function because you are in Visitor Mode. Please create an account to access WhatsApp support.", "warning");
        return;
    }

    if (locationStatus === "permission_denied" || locationStatus === "unknown") {
        showPopup("WhatsApp access restricted until we can verify your location. Please enable location access.", "error");
        return;
    }

    let message;
    if (locationStatus === "in_range") {
        message = `Hi, I am ${userName} from Ahmedabad. In the range of ${DELIVERY_RANGE_KM} km`;
    } else {
        message = `Hi, I am ${userName} from Ahmedabad. But not in the delivery range.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9879254030?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// =================== ACCOUNT MODAL ===================
function showAccountModal() {
    if (isHTTP) {
        handleHTTPClick("Account");
        return;
    }

    const locationStatus = locationManager.getLocationStatus();

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
    console.log("Cart clicked - full functionality available on HTTPS");
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
    const userIcon = document.getElementById("userIcon");
    const cartIcon = document.getElementById("cartIcon");

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

    if (userIcon) {
        userIcon.addEventListener("click", () => {
            if (isHTTP) {
                handleHTTPClick("Account");
                return;
            }

            if (userManager.isLoggedIn()) {
                showPopup(`Hello ${userManager.getCurrentUserName()}! You are already logged in.`, "info");
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
                sessionStorage.setItem("abutoys_home_visited", "true");


                showPopup("Checking your location for delivery...", "loading");
                setTimeout(async () => {
                    const oldPopup = document.getElementById("custom-popup");
                    if (oldPopup) oldPopup.remove();
                    await locationManager.checkLocationAndSetStatus();
                }, 1000);
            });
        }, 700);
    } else {
        localStorage.setItem("abutoys_home_visited", "true");
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

// =================== INITIALIZATION ===================
initMobileNavigation();
initHeroSlider();
showWelcomeMessage();

document.addEventListener("click", (e) => {
    if (e.target.closest('a') && e.target.closest('a').href && e.target.closest('a').href.includes("wa.me")) {
        e.preventDefault();
        openWhatsApp();
    }
});