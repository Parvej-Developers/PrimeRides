// ===================== AUTH MODAL (SIGN IN / SIGN UP) =====================

// Grab overlay and modal elements if they exist on this page
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");

// Auth form templates
const signinFormTemplate = `
  <h2>Sign In</h2>
  <div class="form-group">
    <input type="email" placeholder="Your email" />
  </div>
  <div class="form-group">
    <input type="password" placeholder="Password" />
  </div>
  <button class="submit-btn">Sign In</button>
  <div class="toggle-text">
    Don't have an account?
    <span onclick="openModal('signup')">Sign Up</span>
  </div>
`;

const signupFormTemplate = `
  <h2>Sign Up</h2>
  <div class="form-group">
    <input type="text" placeholder="Full Name" />
  </div>
  <div class="form-group">
    <input type="email" placeholder="Your email" />
  </div>
  <div class="form-group">
    <input type="password" placeholder="Password" />
  </div>
  <button class="submit-btn">Sign Up</button>
  <div class="toggle-text">
    Already have an account?
    <span onclick="openModal('signin')">Sign In</span>
  </div>
`;


function setAuthForm(type) {
  if (!modal) return;
  modal.innerHTML = type === "signin" ? signinFormTemplate : signupFormTemplate;
}

// Ensure a global openModal function exists for inline onclick handlers
if (overlay && modal) {
  window.openModal = function openModal(type) {
    setAuthForm(type);
    overlay.classList.add("active");
  };

  // Close modal when clicking outside the modal content
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.classList.remove("active");
    }
  });
} else if (!window.openModal) {
  // Fallback no-op implementation so inline calls never break other pages
  window.openModal = function openModal() {
    // Intentionally empty: auth overlay not present on this page
    console.warn("Auth modal not available on this page.");
  };
}

// ===================== MOBILE NAVIGATION TOGGLE =====================

const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn ? menuBtn.querySelector("i") : null;

if (menuBtn && navLinks && menuBtnIcon) {
  // Open/close mobile menu
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
  });

  // Close menu when any nav link is clicked
  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
  });
}

// ===================== SCROLL REVEAL ANIMATIONS =====================

const scrollRevealOptions = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// Only run if ScrollReveal is loaded on the page
if (typeof ScrollReveal === "function") {
  const sr = ScrollReveal();

  // Header section
  sr.reveal(".header__image img", {
    ...scrollRevealOptions,
    origin: "right",
  });

  sr.reveal(".header__content h1", {
    ...scrollRevealOptions,
    delay: 500,
  });

  sr.reveal(".header__content p", {
    ...scrollRevealOptions,
    delay: 1000,
  });

  sr.reveal(".header__links", {
    ...scrollRevealOptions,
    delay: 1500,
  });

  // Steps section
  sr.reveal(".steps__card", {
    ...scrollRevealOptions,
    interval: 500,
  });

  // Service section
  sr.reveal(".service__image img", {
    ...scrollRevealOptions,
    origin: "left",
  });

  sr.reveal(".service__content .section__subheader", {
    ...scrollRevealOptions,
    delay: 500,
  });

  sr.reveal(".service__content .section__header", {
    ...scrollRevealOptions,
    delay: 1000,
  });

  sr.reveal(".service__list li", {
    ...scrollRevealOptions,
    delay: 1500,
    interval: 500,
  });

  // Experience section
  sr.reveal(".experience__card", {
    duration: 1000,
    interval: 500,
  });

  // Download / app section
  sr.reveal(".download__image img", {
    ...scrollRevealOptions,
    origin: "right",
  });

  sr.reveal(".download__content .section__header", {
    ...scrollRevealOptions,
    delay: 500,
  });

  sr.reveal(".download__content p", {
    ...scrollRevealOptions,
    delay: 1000,
  });

  sr.reveal(".download__links", {
    ...scrollRevealOptions,
    delay: 1500,
  });
}
