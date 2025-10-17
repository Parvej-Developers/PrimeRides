// Login & Signup form
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

// ends...
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// explore.js

// Elements
const cardGrid = document.querySelector(".card-grid");
const searchInput = document.getElementById("searchInput");

// Helpers
function formatPrice(val) {
  if (val === null || val === undefined || val === "") return "";
  return typeof val === "number" ? `₹${val.toLocaleString("en-IN")}/day` : `${val}`;
}

function badgeInlineStyleFor(status) {
  // Keep CSS untouched; only tweak badge inline when unavailable
  return status === "available" ? "" : ' style="background:#fee2e2;color:#991b1b"';
}

function badgeTextFor(status) {
  return status === "available" ? "Available Now" : "Unavailable";
}

// Fetch cars from Supabase (do NOT filter by status; we only change the badge)
async function loadCars() {
  const { data: cars, error } = await supabaseClient
    .from("cars")
    .select("id,name,type,price,seats,fuel,transmission,location,image_url,status,rate_per_day")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading cars:", error);
    cardGrid.innerHTML = "<p>Failed to load cars. Please try again later.</p>";
    return;
  }

  renderCars(cars || []);
}

// Render cars to grid (layout unchanged; only badge is dynamic)
function renderCars(list) {
  cardGrid.innerHTML = "";
  list.forEach((car) => {
    const status = (car.status || "available").toLowerCase();
    const priceText = car.rate_per_day != null ? formatPrice(car.rate_per_day) : (car.price || "");

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-car-id", car.id);

    card.addEventListener("click", () => {
      window.location.href = `y.html?id=${car.id}`;
    });

    card.innerHTML = `
      <div class="card-image">
        <span class="badge"${badgeInlineStyleFor(status)}>${badgeTextFor(status)}</span>
        <img src="${car.image_url}" alt="${car.name}" />
        <span class="price">${priceText}</span>
      </div>
      <div class="card-content">
        <h3>${car.name}</h3>
        <p>${car.type}</p>
        <ul class="features">
          <li><img src="icons/users_icon.svg" alt="Seats"> ${car.seats}</li>
          <li><img src="icons/fuel_icon.svg" alt="Fuel"> ${car.fuel}</li>
          <li><img src="icons/car_icon.svg" alt="Transmission"> ${car.transmission}</li>
          <li><img src="icons/location_icon.svg" alt="Location"> ${car.location}</li>
        </ul>
      </div>
    `;
    cardGrid.appendChild(card);
  });
}

// Realtime: update only the badge when admin changes status
function initRealtimeStatus() {
  try {
    supabaseClient
      .channel("cars-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "cars", columns: ["status"] },
        (payload) => {
          const { id, status } = payload.new || {};
          const card = document.querySelector(`.card[data-car-id="${id}"]`);
          if (!card) return;
          const badge = card.querySelector(".badge");
          if (!badge) return;

          badge.textContent = badgeTextFor(status);
          if ((status || "available") === "available") {
            badge.removeAttribute("style");
          } else {
            badge.setAttribute("style", "background:#fee2e2;color:#991b1b");
          }
        }
      )
      .subscribe();
  } catch (e) {
    // non-blocking
    console.warn("Realtime unavailable", e);
  }
}

// Search functionality (include status in select so badge stays correct)
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase();

  const { data: filtered, error } = await window.supabaseClient
    .from("cars")
    .select("id,name,type,price,seats,fuel,transmission,location,image_url,status,rate_per_day")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  if (!error) renderCars(filtered || []);
});

// Load cars on page start
loadCars();
initRealtimeStatus();
