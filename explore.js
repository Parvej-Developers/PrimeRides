// ===================== AUTH MODAL (SIGN IN / SIGN UP) =====================

// These elements exist on Explore_cars.html
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

/**
 * Render auth form content into modal.
 * @param {"signin"|"signup"} type
 */
function setAuthForm(type) {
  if (!modal) return;
  modal.innerHTML = type === "signin" ? signinFormTemplate : signupFormTemplate;
}

// Global function used by inline onclick attributes
if (overlay && modal) {
  window.openModal = function openModal(type) {
    setAuthForm(type);
    overlay.classList.add("active");
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.classList.remove("active");
    }
  });
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

// ===================== CAR LISTING (SUPABASE-DRIVEN) =====================

// Core elements
const cardGrid = document.querySelector(".card-grid");
const searchInput = document.getElementById("searchInput");

/**
 * Format daily price into INR currency string.
 */
function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    return `₹${value.toLocaleString("en-IN")}/day`;
  }
  return `${value}`;
}

/**
 * Return inline style for badge based on availability.
 * Keeps design same as your CSS; only adds red tone for unavailable cars.
 */
function badgeInlineStyleFor(status) {
  return status === "available" ? "" : ' style="background:#fee2e2;color:#991b1b"';
}

/**
 * Return badge text based on availability.
 */
function badgeTextFor(status) {
  return status === "available" ? "Available Now" : "Unavailable";
}

/**
 * Fetch cars from Supabase and render them.
 * Does not filter by status; badge only reflects current status.
 */
async function loadCars() {
  if (!cardGrid) return;

  if (!window.supabaseClient) {
    console.error("supabaseClient is not defined. Check supabaseClient.js.");
    cardGrid.innerHTML = "<p>Connection error. Please try again later.</p>";
    return;
  }

  const { data: cars, error } = await window.supabaseClient
    .from("cars")
    .select(
      "id,name,type,price,seats,fuel,transmission,location,image_url,status,rate_per_day"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading cars:", error);
    cardGrid.innerHTML = "<p>Failed to load cars. Please try again later.</p>";
    return;
  }

  renderCars(cars || []);
}

/**
 * Render a list of cars into the grid.
 * Layout is unchanged; only the status badge is dynamic.
 */
function renderCars(list) {
  if (!cardGrid) return;

  cardGrid.innerHTML = "";

  list.forEach((car) => {
    const status = (car.status || "available").toLowerCase();
    const priceText =
      car.rate_per_day != null ? formatPrice(car.rate_per_day) : car.price || "";

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-car-id", car.id);

    // Navigate to car details page on click
    card.addEventListener("click", () => {
      window.location.href = `y.html?id=${car.id}`;
    });

    card.innerHTML = `
      <div class="card-image">
        <span class="badge"${badgeInlineStyleFor(status)}>${badgeTextFor(
      status
    )}</span>
        <img src="${car.image_url}" alt="${car.name}" />
        <span class="price">${priceText}</span>
      </div>
      <div class="card-content">
        <h3>${car.name}</h3>
        <p>${car.type}</p>
        <ul class="features">
          <li><img src="icons/users_icon.svg" alt="Seats" /> ${car.seats}</li>
          <li><img src="icons/fuel_icon.svg" alt="Fuel" /> ${car.fuel}</li>
          <li><img src="icons/car_icon.svg" alt="Transmission" /> ${
            car.transmission
          }</li>
          <li><img src="icons/location_icon.svg" alt="Location" /> ${
            car.location
          }</li>
        </ul>
      </div>
    `;

    cardGrid.appendChild(card);
  });
}

/**
 * Subscribe to realtime status updates and update only the status badge.
 */
function initRealtimeStatus() {
  if (!window.supabaseClient) return;

  try {
    window.supabaseClient
      .channel("cars-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cars",
          columns: ["status"],
        },
        (payload) => {
          const { id, status } = payload.new || {};
          if (!id) return;

          const card = document.querySelector(`.card[data-car-id="${id}"]`);
          if (!card) return;

          const badge = card.querySelector(".badge");
          if (!badge) return;

          const normalizedStatus = (status || "available").toLowerCase();
          badge.textContent = badgeTextFor(normalizedStatus);

          if (normalizedStatus === "available") {
            badge.removeAttribute("style");
          } else {
            badge.setAttribute("style", "background:#fee2e2;color:#991b1b");
          }
        }
      )
      .subscribe();
  } catch (error) {
    // Non-blocking: just log the issue if realtime fails
    console.warn("Realtime status updates unavailable:", error);
  }
}

/**
 * Attach search handler to filter cars by name.
 * Status is still fetched so badge remains accurate.
 */
function initSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.toLowerCase();

    if (!window.supabaseClient) return;

    const { data: filtered, error } = await window.supabaseClient
      .from("cars")
      .select(
        "id,name,type,price,seats,fuel,transmission,location,image_url,status,rate_per_day"
      )
      .ilike("name", `%${query}%`)
      .order("created_at", { ascending: false });

    if (!error) {
      renderCars(filtered || []);
    }
  });
}

// ===================== INITIALIZE PAGE =====================

loadCars();
initRealtimeStatus();
initSearch();
