// =================== CLEAR INVALID DATA ===================
try {
    const storedUser = localStorage.getItem("abutoys_current_user");
    if (storedUser === "visitor" || storedUser === "null" || storedUser === null) {
        localStorage.removeItem("abutoys_current_user");
        localStorage.removeItem("abutoys_location_status");
        localStorage.removeItem("abutoys_delivery_charge");
    }
} catch (e) {
    console.log("localStorage not available");
}

// =================== CONFIG ===================
const SHOP_LOCATION = { lat: 23.0370158, lng: 72.5820909 };
const DELIVERY_RANGE_KM = 20;

// ✅ SAME URL FOR BOTH - YAHI ISSUE THA
const SIGNUP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwwOM8-Q2SXuzFESlsJc1yOOiNGJCaZIzmlMNk6rJkCwssER7UYXE00WiYaaeWsBE-odQ/exec";

console.log("🚀 AbuToys Script Loaded");

// =================== UPDATED LOCATION MANAGER ===================
class LocationManager {
    constructor() {
        try {
            this.userLocation = JSON.parse(localStorage.getItem("abutoys_user_location") || "null");
            this.locationStatus = localStorage.getItem("abutoys_location_status") || "unknown";
        } catch (e) {
            this.userLocation = null;
            this.locationStatus = "unknown";
        }
        this.distance = null;
        this.deliveryCharge = null;
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
        return R * c;
    }

    calculateDeliveryCharge(distance) {
        // 30 km ke bahar = No delivery
        if (distance > 20) return -1;

        // 0 km = free delivery
        if (distance <= 0) return 0;

        // Range-based logic
        // 0 - 1 km = Free (0 rs)
        if (distance <= 1) return 0;

        // 1 - 2 km = 20 rs
        else if (distance <= 2) return 60;

        // 2 - 3 km = 30 rs
        else if (distance <= 3) return 70;

        // 3 - 4 km = 40 rs
        else if (distance <= 4) return 80;

        // 4 - 5 km = 50 rs
        else if (distance <= 5) return 120;

        // 5 - 6 km = 60 rs
        else if (distance <= 6) return 140;

        // 6 - 7 km = 70 rs
        else if (distance <= 7) return 160;

        // 7 - 8 km = 80 rs
        else if (distance <= 8) return 180;

        // 8 - 9 km = 90 rs
        else if (distance <= 9) return 210;

        // 9 - 10 km = 100 rs
        else if (distance <= 10) return 230;

        // 10 - 11 km = 110 rs
        else if (distance <= 11) return 250;

        // 11 - 12 km = 120 rs
        else if (distance <= 12) return 270;

        // 12 - 13 km = 130 rs
        else if (distance <= 13) return 290;

        // 13 - 14 km = 140 rs
        else if (distance <= 14) return 310;

        // 14 - 15 km = 150 rs
        else if (distance <= 15) return 330;

        // 15 - 16 km = 160 rs
        else if (distance <= 16) return 350;

        // 16 - 17 km = 170 rs
        else if (distance <= 17) return 370;

        // 17 - 18 km = 180 rs
        else if (distance <= 18) return 390;

        // 18 - 19 km = 190 rs
        else if (distance <= 19) return 410;

        // 19 - 20 km = 200 rs
        else if (distance <= 20) return 430;

        // 20 - 21 km = 210 rs
        // else if (distance <= 21) return 450;

        // 21 - 22 km = 220 rs
        // else if (distance <= 22) return 230;

        // 22 - 23 km = 230 rs
        // else if (distance <= 23) return 240;

        // 23 - 24 km = 240 rs
        // else if (distance <= 24) return 250;

        // 24 - 25 km = 250 rs
        // else if (distance <= 25) return 260;

        // 25 - 26 km = 260 rs
        // else if (distance <= 26) return 270;

        // 26 - 27 km = 270 rs
        // else if (distance <= 27) return 280;

        // 27 - 28 km = 280 rs
        // else if (distance <= 28) return 290;

        // 28 - 29 km = 290 rs
        // else if (distance <= 29) return 300;

        // 29 - 30 km = 300 rs
        // else if (distance <= 30) return 310;

        // 30 - 31 km = 310 rs
        // else if (distance <= 31) return 320;

        // 31 - 32 km = 320 rs
        // else if (distance <= 32) return 330;

        // 32 - 33 km = 330 rs
        // else if (distance <= 33) return 340;

        // 33 - 34 km = 340 rs
        // else if (distance <= 34) return 350;

        // 34 - 35 km = 350 rs
        // else if (distance <= 35) return 360;

        // 35 - 36 km = 360 rs
        // else if (distance <= 36) return 370;

        // 36 - 37 km = 370 rs
        // else if (distance <= 37) return 380;

        // 37 - 38 km = 380 rs
        // else if (distance <= 38) return 390;

        // 38 - 39 km = 390 rs
        // else if (distance <= 39) return 400;

        // 39 - 40 km = 400 rs
        // else if (distance <= 40) return 410;

        // 40 - 41 km = 410 rs
        // else if (distance <= 41) return 420;

        // 41 - 42 km = 420 rs
        // else if (distance <= 42) return 430;

        // 42 - 43 km = 430 rs
        // else if (distance <= 43) return 440;

        // 43 - 44 km = 440 rs
        // else if (distance <= 44) return 450;

        // 44 - 45 km = 450 rs
        // else if (distance <= 45) return 460;

        // 45 - 46 km = 460 rs
        // else if (distance <= 46) return 470;

        // 46 - 47 km = 470 rs
        // else if (distance <= 47) return 480;

        // 47 - 48 km = 480 rs
        // else if (distance <= 48) return 490;

        // 48 - 49 km = 490 rs
        // else if (distance <= 49) return 500;

        // 49 - 50 km = 500 rs
        // else if (distance <= 50) return 510;

        // Out of range
        return -1;
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
                pos => {
                    console.log("📍 Location:", pos.coords.latitude, pos.coords.longitude);
                    resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                err => {
                    console.warn("⚠️ Location error:", err);
                    reject(err);
                },
                options
            );
        });
    }

    async checkLocationAndSetStatus() {
        try {
            // Pehle check kar ki permission denied to nahi
            const permissionStatus = await this.checkLocationAvailability();

            if (permissionStatus === 'denied') {
                this.locationStatus = "permission_denied";
                try { localStorage.setItem("abutoys_location_status", "permission_denied"); } catch (e) { }
                return { location: null, distance: null, status: this.locationStatus };
            }

            // Location lelo
            const location = await this.getCurrentLocation();

            // Distance calculate karo
            const distance = this.calculateDistance(
                location.lat,
                location.lng,
                SHOP_LOCATION.lat,
                SHOP_LOCATION.lng
            );

            // Delivery charge lelo
            const deliveryCharge = this.calculateDeliveryCharge(distance);

            // Store karo values
            this.userLocation = location;
            this.distance = distance;
            this.deliveryCharge = deliveryCharge;

            // LocalStorage mein save kar
            try {
                localStorage.setItem("abutoys_user_location", JSON.stringify(location));
                localStorage.setItem("abutoys_user_distance", distance.toFixed(2));
                localStorage.setItem("abutoys_delivery_charge", deliveryCharge.toString());
            } catch (e) { }

            // Status set kar - agar charge -1 nahi hai to in_range
            if (deliveryCharge !== -1) {
                this.locationStatus = "in_range";
                try { localStorage.setItem("abutoys_location_status", "in_range"); } catch (e) { }
            } else {
                this.locationStatus = "out_of_range";
                try { localStorage.setItem("abutoys_location_status", "out_of_range"); } catch (e) { }
            }

            console.log("✅ Location Status:", this.locationStatus, "Distance:", distance.toFixed(2), "km, Charge: Rs." + deliveryCharge);
            return { location, distance, status: this.locationStatus, deliveryCharge };

        } catch (error) {
            console.warn("❌ Location error:", error);
            this.locationStatus = "unknown";
            try { localStorage.setItem("abutoys_location_status", "unknown"); } catch (e) { }
            return { location: null, distance: null, status: this.locationStatus, error };
        }
    }

    getLocationStatus() {
        return this.locationStatus;
    }
}

// =================== USER MANAGER ===================
class UserManager {
    constructor() {
        try {
            this.currentUser = localStorage.getItem("abutoys_current_user");
        } catch (e) {
            this.currentUser = null;
        }
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
        return this.currentUser && this.currentUser !== "null" && this.currentUser !== "";
    }

    setCurrentUser(email) {
        try {
            localStorage.setItem("abutoys_current_user", email);
        } catch (e) { }
        this.currentUser = email;
        this.updateUserDisplay();
    }

    async register(userData) {
        try {
            showPopup("⏳ Creating your account...", "loading");
            const email = userData.email.toLowerCase().trim();

            const existingUser = this.getUser(email);
            if (existingUser) {
                showPopup("❌ Email already registered!", "error");
                return false;
            }

            const formData = new FormData();
            formData.append('action', 'register');
            formData.append('fullName', userData.fullName);
            formData.append('email', email);
            formData.append('password', userData.password);
            formData.append('phone', userData.phone.replace('+91', ''));
            formData.append('address', userData.address);

            console.log("📤 Sending registration data...", userData);

            const response = await fetch(SIGNUP_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            console.log("📥 Response status:", response.status);

            let result;
            try {
                result = await response.json();
            } catch (e) {
                const text = await response.text();
                console.error("❌ Parse error. Response:", text);
                showPopup("❌ Server error! Try again later.", "error");
                return false;
            }

            console.log("✅ Server response:", result);

            if (result.success) {
                // localStorage me save karo
                try {
                    localStorage.setItem(`abutoys_user_${email}`, JSON.stringify(userData));
                } catch (e) { }
                this.setCurrentUser(email);

                // Form close karo
                closeAccountModal();

                // Success message
                showPopup("✅ Account created successfully!\n📧 Check your email for confirmation.", "success");
                console.log("✅ User registered:", userData.fullName);

                // Floating buttons update karo
                updateFloatingButtons();

                return true;
            } else {
                if (result.message === "email_exists") {
                    showPopup("❌ Email already registered!", "error");
                } else {
                    showPopup("❌ " + (result.message || "Registration failed"), "error");
                }
                return false;
            }

        } catch (error) {
            console.error("❌ Registration error:", error);
            showPopup("❌ Network error! Check your connection.", "error");
            return false;
        }
    }

    updateUserDisplay() {
        const userNameDisplay = document.getElementById("userNameDisplay");

        if (!userNameDisplay) return;

        if (this.isLoggedIn()) {
            const user = this.getUser(this.currentUser);
            if (user) {
                userNameDisplay.textContent = `👋 Hello ${user.fullName}!`;
                userNameDisplay.style.display = "block";
                return;
            }
        }

        userNameDisplay.style.display = "none";
    }

    loadCurrentUser() {
        if (this.currentUser) {
            this.updateUserDisplay();
        }
    }

    getCurrentUserName() {
        if (this.isLoggedIn()) {
            const user = this.getUser(this.currentUser);
            return user ? user.fullName : "User";
        }
        return "Guest";
    }
}

// =================== INITIALIZE ===================
const locationManager = new LocationManager();
const userManager = new UserManager();

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
        z-index:10001; overflow: auto;
    `;
    popup.innerHTML = `
        <div style="background:${color.bg}; color:${color.text}; padding:1.6rem; border-radius:14px; max-width:420px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin: auto; text-align: center;">
            <p style="margin-bottom: ${isLoading ? '0' : '1rem'};">${message}</p>
            ${!isLoading ? '<button id="popup-ok" style="margin-top:0.6rem; padding:8px 16px; border:none; border-radius:8px; background:rgba(255,255,255,0.9); color:#333; cursor:pointer; font-weight:bold;">OK</button>' : ''}
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

// =================== WELCOME MESSAGE ===================
function showCustomWelcomePopup(userName, onOKClick) {
    const old = document.getElementById("custom-popup");
    if (old) old.remove();

    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center;
        z-index:10001; overflow: auto; padding: 20px;
    `;

    const welcomeText = userName === "Guest" ?
        "Join our happy family!" :
        `Welcome back, <strong>${userName}</strong>!`;

    popup.innerHTML = `
        <div style="background: linear-gradient(135deg, #FF6B6B, #4ECDC4); color: white; padding: 2rem; border-radius: 20px; max-width: 450px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); text-align: center; margin: auto;">
            <h2 style="font-size: 1.8rem; margin-bottom: 1rem; font-family: 'Fredoka One', cursive;">🧸 Welcome to AbuToys!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">${welcomeText}</p>
            <p style="font-size: 0.95rem; margin-bottom: 1.5rem; opacity: 0.9;">We need to verify your location to check delivery availability.</p>
            <button id="welcome-ok-btn" style="padding: 12px 30px; border: none; border-radius: 25px; background: white; color: #FF6B6B; cursor: pointer; font-weight: bold; font-size: 1rem;">OK, Check Location</button>
        </div>
    `;

    document.body.appendChild(popup);
    document.getElementById("welcome-ok-btn").addEventListener("click", () => {
        popup.remove();
        if (onOKClick) onOKClick();
    });
}

async function showWelcomeMessage() {
    const isFirstVisit = !sessionStorage.getItem("abutoys_welcomed");

    if (!isFirstVisit) {
        console.log("ℹ️ Not first visit, skipping welcome");
        return;
    }

    sessionStorage.setItem("abutoys_welcomed", "true");

    let userName = "Guest";
    if (userManager.isLoggedIn()) {
        const user = userManager.getUser(userManager.currentUser);
        if (user) userName = user.fullName;
    }

    console.log("👋 Showing welcome for:", userName);

    showCustomWelcomePopup(userName, async () => {
        showPopup("🌍 Checking your location...", "loading");

        try {
            const res = await locationManager.checkLocationAndSetStatus();

            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();

            if (res.status === 'in_range') {
                showPopup(`✅ Location Verified!\n\nDelivery Charge: Rs.${res.deliveryCharge}\n\nYou can purchase items!`, "success");
            }
            else if (res.status === 'out_of_range') {
                showPopup(`❌ Sorry!\n\nYou are ${Math.round(res.distance)} km away.\n\nWe don't deliver there.`, "warning");
            }
            else {
                showPopup(`⚠️ Location Permission Denied\n\nPlease enable location services.`, "warning");
            }

            // Sirf agar logged in nahi hai to form dikhao
            if (!userManager.isLoggedIn()) {
                setTimeout(() => {
                    showAccountModal();
                }, 1500);
            }

        } catch (err) {
            console.error("Location error:", err);
            const loadingPopup = document.getElementById("custom-popup");
            if (loadingPopup) loadingPopup.remove();
        }
    });
}

// =================== WHATSAPP ===================
function openWhatsApp() {
    if (!userManager.isLoggedIn()) {
        showPopup("❌ Please sign up first!", "warning");
        return;
    }

    const locationStatus = locationManager.getLocationStatus();

    if (locationStatus === 'out_of_range') {
        showPopup("❌ Sorry! You are outside 20 km delivery area.", "warning");
        return;
    }

    const userName = userManager.getCurrentUserName();
    const distance = locationManager.distance ? locationManager.distance.toFixed(2) : "Unknown";
    const message = `Hi, I am ${userName}. Distance: ${distance} km. I want to purchase toys.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/9879254030?text=${encodedMessage}`, '_blank');
}

// =================== ACCOUNT MODAL ===================
function showAccountModal() {
    console.log("📝 Opening account modal...");

    if (userManager.isLoggedIn()) {
        window.location.href = "userprofile.html";
        return;
    }

    const modal = document.getElementById("accountModal");
    if (modal) {
        modal.style.display = "block";
        console.log("✅ Modal displayed");
    } else {
        console.error("❌ Modal not found!");
    }
}

function closeAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// =================== HERO SLIDER ===================
function initHeroSlider() {
    let current = 0;
    const slides = document.querySelectorAll(".slide");
    if (slides && slides.length > 0) {
        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 5000);
    }
    console.log("✅ Hero slider started");
}

// =================== FLOATING BUTTONS ===================
function createFloatingButtons() {
    console.log("📧 Creating floating buttons...");

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
    });

    whatsappFloat.addEventListener("mouseleave", () => {
        whatsappFloat.style.transform = "scale(1)";
    });

    whatsappFloat.addEventListener("click", openWhatsApp);
    document.body.appendChild(whatsappFloat);
    console.log("✅ WhatsApp button added");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            whatsappFloat.style.opacity = "1";
            whatsappFloat.style.visibility = "visible";
        } else {
            whatsappFloat.style.opacity = "0";
            whatsappFloat.style.visibility = "hidden";
        }
    });
}

// =================== FLOATING REGISTRATION BUTTON ===================
function createFloatingRegisterButton() {
    console.log("👤 Creating floating registration button...");

    const regFloat = document.createElement("div");
    regFloat.id = "floatingRegBtn";
    regFloat.innerHTML = `<i class="fas fa-user-plus"></i>`;
    regFloat.style.cssText = `
        position: fixed; 
        bottom: 100px; 
        right: 20px;
        background: linear-gradient(45deg, #FF6B6B, #4ECDC4); 
        color: white; 
        border-radius: 50%;
        width: 60px; 
        height: 60px; 
        display: flex;
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
        cursor: pointer; 
        z-index: 999; 
        font-size: 28px;
        transition: all 0.3s ease; 
        opacity: 0; 
        visibility: hidden;
    `;

    regFloat.addEventListener("mouseenter", () => {
        regFloat.style.transform = "scale(1.05)";
    });

    regFloat.addEventListener("mouseleave", () => {
        regFloat.style.transform = "scale(1)";
    });

    regFloat.addEventListener("click", () => {
        showAccountModal();
    });

    document.body.appendChild(regFloat);
    console.log("✅ Registration button added");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            regFloat.style.opacity = "1";
            regFloat.style.visibility = "visible";
        } else {
            regFloat.style.opacity = "0";
            regFloat.style.visibility = "hidden";
        }
    });
}

function updateFloatingButtons() {
    const whatsappBtn = document.querySelector(".whatsapp-float");
    const regBtn = document.getElementById("floatingRegBtn");

    if (userManager.isLoggedIn()) {
        if (whatsappBtn) whatsappBtn.style.display = "flex";
        if (regBtn) regBtn.style.display = "none";
    } else {
        if (whatsappBtn) whatsappBtn.style.display = "none";
        if (regBtn) regBtn.style.display = "flex";
    }
}

// =================== DOM READY ===================
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM Ready");

    // ========= HAMBURGER MENU FIX =========
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("active");
            console.log("📱 Hamburger clicked - menu active:", navMenu.classList.contains("active"));
        });

        // Close menu when nav link clicked
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
                console.log("📱 Nav link clicked - menu closed");
            });
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
            }
        });
    } else {
        console.warn("⚠️ Hamburger or nav-menu not found");
    }

    // ========= PHONE INPUT ==========
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    // ========= SIGNUP FORM ==========
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const address = document.getElementById("address").value.trim();

            if (!fullName || !email || !password || !phone || !address) {
                showPopup("❌ Please fill all fields!", "error");
                return;
            }

            if (phone.length !== 10) {
                showPopup("❌ Phone number must be 10 digits!", "error");
                return;
            }

            const userData = {
                fullName,
                email,
                password,
                phone: "+91" + phone,
                address
            };

            // UserManager ka register function call karo
            const success = await userManager.register(userData);

            if (success) {
                // Form reset karo
                signupForm.reset();
            }
        });
    } else {
        console.error("❌ signupForm not found in DOM");
    }



    // ========= CART ICON ==========
    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            if (!userManager.isLoggedIn()) {
                showPopup("❌ Please sign up first!", "warning");
                return;
            }
            console.log("🛒 Cart clicked");
        });
    }

    // ========= CLOSE BUTTON ==========
    const closeBtn = document.getElementById('closeSignupBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById("accountModal");
            if (modal) modal.style.display = 'none';
            updateFloatingButtons();
        });
    }

    // ========= PASSWORD EYE TOGGLE ==========
    const eye = document.querySelector('.toggle-password');
    if (eye) {
        eye.addEventListener('click', function () {
            const pass = document.getElementById('password');
            if (!pass) return;
            if (pass.type === 'password') {
                pass.type = 'text';
                eye.classList.remove('fa-eye');
                eye.classList.add('fa-eye-slash');
            } else {
                pass.type = 'password';
                eye.classList.add('fa-eye');
                eye.classList.remove('fa-eye-slash');
            }
        });
    }
});

// =================== PAGE LOAD ===================
window.addEventListener("load", () => {
    console.log("✅ Page loaded, initializing...");

    setTimeout(() => {
        initHeroSlider();
        createFloatingButtons();
        createFloatingRegisterButton();
        updateFloatingButtons();

        // Har baar welcome message dikhao
        showWelcomeMessage();
    }, 800);
});


// =================== DELETE ACCOUNT SYSTEM ===================
function initializeDeleteAccountIcon() {
    const deleteIcon = document.getElementById('deleteAccountIcon');
    if (deleteIcon) {
        deleteIcon.addEventListener('click', () => {
            showDeleteAccountOverlay();
        });
    }
}

function showDeleteAccountOverlay() {
    // Pehle check kar ki user logged in hai ya nahi
    const currentUser = localStorage.getItem("abutoys_current_user");

    if (!currentUser || currentUser === "null" || currentUser === "" || currentUser === "visitor") {
        showPopup("❌ Please create account first to delete account!", "error");
        return;
    }

    // Overlay create kar
    const overlay = document.createElement('div');
    overlay.id = 'delete-account-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10005;
        padding: 20px;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease-out;
        ">
            <div style="font-size: 3.5rem; margin-bottom: 20px; color: #FF6B6B;">⚠️</div>
            
            <h2 style="
                color: #333;
                font-size: 1.8rem;
                margin-bottom: 15px;
                font-family: 'Fredoka One', cursive;
            ">Delete Account?</h2>
            
            <p style="
                color: #666;
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 25px;
            ">
                ⚠️ <strong>Warning:</strong> Deleting your account will permanently remove all your data including:
                <br><br>
                • Account Information
                <br>
                • Saved Addresses
                <br>
                • Wishlist Items
                <br>
                • Password
            </p>

            <p style="
                color: #FF6B6B;
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 30px;
            ">
                This action cannot be undone! 🔒
            </p>

            <p style="
                color: #999;
                font-size: 0.95rem;
                margin-bottom: 25px;
            ">
                Are you sure you want to delete your account?
            </p>

            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="cancelDeleteBtn" style="
                    padding: 12px 30px;
                    background: #e0e0e0;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                ">
                    ✕ Cancel
                </button>
                <button id="confirmDeleteBtn" style="
                    padding: 12px 30px;
                    background: #FF6B6B;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                ">
                    🗑️ Delete Account
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Cancel button
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        overlay.remove();
    });

    // Delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        deleteUserAccount(overlay);
    });

    // Background click se bhi close ho
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function deleteUserAccount(overlay) {
    // Get current user
    const currentUser = localStorage.getItem("abutoys_current_user");

    // Delete user data
    try {
        localStorage.removeItem(`abutoys_user_${currentUser}`);
        localStorage.removeItem("abutoys_current_user");
        localStorage.removeItem("abutoys_user_location");
        localStorage.removeItem("abutoys_location_status");
        localStorage.removeItem("abutoys_delivery_charge");
        localStorage.removeItem("abutoys_user_distance");
        localStorage.removeItem("abutoys_liked_products");
        localStorage.removeItem("abutoys_cart");
    } catch (e) {
        console.log("Error deleting data:", e);
    }

    // Set deletion flag with timestamp
    const deletionTime = Date.now();
    try {
        localStorage.setItem("abutoys_account_deleted", "true");
        localStorage.setItem("abutoys_deletion_timestamp", deletionTime.toString());
    } catch (e) {
        console.log("Error setting deletion flag:", e);
    }

    // Close pehla overlay
    overlay.remove();

    // Show 30-minute overlay
    showPostDeletionOverlay();
}

function showPostDeletionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'post-deletion-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10006;
        padding: 20px;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease-out;
        ">
            <div style="font-size: 3.5rem; margin-bottom: 20px;">✅</div>
            
            <h2 style="
                color: #333;
                font-size: 1.8rem;
                margin-bottom: 15px;
                font-family: 'Fredoka One', cursive;
            ">Account Deleted Successfully</h2>
            
            <p style="
                color: #666;
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 15px;
            ">
                Your account has been deleted from our system.
            </p>

            <p style="
                color: #FF6B6B;
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 20px;
            ">
                ⏳ You can create a new account after:
            </p>

            <div id="timerDisplay" style="
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                color: white;
                padding: 20px;
                border-radius: 15px;
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 25px;
                font-family: 'Courier New', monospace;
                letter-spacing: 2px;
            ">
                30:00:00
            </div>

            <p style="
                color: #999;
                font-size: 0.9rem;
                margin-bottom: 20px;
            ">
                (Hours : Minutes : Seconds)
            </p>

            <button onclick="window.location.href='index.html'" style="
                padding: 12px 30px;
                background: #4ECDC4;
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                transition: all 0.3s ease;
            ">
                🏠 Go to Home
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Start timer
    startDeletionTimer(overlay);
}

function startDeletionTimer(overlay) {
    const deletionTimestamp = parseInt(localStorage.getItem("abutoys_deletion_timestamp") || "0");
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

    function updateTimer() {
        const now = Date.now();
        const timePassed = now - deletionTimestamp;
        const timeRemaining = THIRTY_MINUTES - timePassed;

        if (timeRemaining <= 0) {
            // Timer complete - remove overlay aur flag
            try {
                localStorage.removeItem("abutoys_account_deleted");
                localStorage.removeItem("abutoys_deletion_timestamp");
            } catch (e) { }

            overlay.remove();
            showPopup("✅ You can now create a new account!", "success");
            return;
        }

        // Calculate hours, minutes, seconds
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Format with leading zeros
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formattedTime;
        }

        // Update har second
        setTimeout(updateTimer, 1000);
    }

    // Start immediately
    updateTimer();
}

// Check on page load agar deletion active hai
function checkIfAccountDeleted() {
    const isDeleted = localStorage.getItem("abutoys_account_deleted");

    if (isDeleted === "true") {
        const deletionTimestamp = parseInt(localStorage.getItem("abutoys_deletion_timestamp") || "0");
        const THIRTY_MINUTES = 30 * 60 * 1000;
        const now = Date.now();
        const timePassed = now - deletionTimestamp;

        if (timePassed < THIRTY_MINUTES) {
            // Still within 30 minutes - show overlay
            showPostDeletionOverlay();
        } else {
            // 30 minutes over - clear flags
            localStorage.removeItem("abutoys_account_deleted");
            localStorage.removeItem("abutoys_deletion_timestamp");
        }
    }
}

// Add CSS animation
function addDeleteAccountStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #deleteAccountIcon {
            transition: all 0.3s ease;
        }

        #deleteAccountIcon:hover {
            transform: scale(1.15);
            color: #FF4545 !important;
        }
    `;
    document.head.appendChild(style);
}

// Call in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    addDeleteAccountStyles();
    initializeDeleteAccountIcon();
    checkIfAccountDeleted();
});
