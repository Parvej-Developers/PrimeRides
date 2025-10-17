//Login & Signup form
const overlay = document.getElementById("overlay");
      const modal = document.getElementById("modal");

      // Templates
      const signinForm = `
      <h2>Sign In</h2>
      <div class="form-group">
        <input type="email" placeholder="Your email">
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password">
      </div>
      <button class="submit-btn">Sign In</button>
      <div class="toggle-text">Don't have an account? <span onclick="openModal('signup')">Sign Up</span></div>
    `;

      const signupForm = `
      <h2>Sign Up</h2>
      <div class="form-group">
        <input type="text" placeholder="Full Name">
      </div>
      <div class="form-group">
        <input type="email" placeholder="Your email">
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password">
      </div>
      <button class="submit-btn">Sign Up</button>
      <div class="toggle-text">Already have an account? <span onclick="openModal('signin')">Sign In</span></div>
    `;

      function openModal(type) {
        modal.innerHTML = type === "signin" ? signinForm : signupForm;
        overlay.classList.add("active");
      }

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
//ends....
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".header__content p", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".header__links", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".steps__card", {
  ...scrollRevealOption,
  interval: 500,
});

ScrollReveal().reveal(".service__image img", {
  ...scrollRevealOption,
  origin: "left",
});
ScrollReveal().reveal(".service__content .section__subheader", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".service__content .section__header", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".service__list li", {
  ...scrollRevealOption,
  delay: 1500,
  interval: 500,
});

ScrollReveal().reveal(".experience__card", {
  duration: 1000,
  interval: 500,
});

ScrollReveal().reveal(".download__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".download__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".download__content p", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".download__links", {
  ...scrollRevealOption,
  delay: 1500,
});



