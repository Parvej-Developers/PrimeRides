// =================== Dynamic User Panel JavaScript ===================

// Global variables
let currentSection = 'profile';
let mobileMenuOpen = false;
let currentUser = null;
let userBookings = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthenticationAndRedirect();
    await initializeUserPanel();
    initializeNavigation();
    initializeFilters();
    initializeForm();
    attachEventListeners();
});

// Check if user is authenticated and redirect if not
async function checkAuthenticationAndRedirect() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('Please sign in to access the user panel');
        window.location.href = 'index.html';
        return;
    }
}

// Initialize user panel with dynamic data
async function initializeUserPanel() {
    try {
        currentUser = await getCurrentUserProfile();
        if (!currentUser) throw new Error('Could not load user profile');
        userBookings = await getUserBookings();
        populateSidebar();
        populateUserProfile();
        populateUserBookings();
        populateUpdateForm();
    } catch (error) {
        console.error('Error initializing user panel:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Get current user profile from Supabase
async function getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
}

// Get user bookings from Supabase
async function getUserBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            cars ( id, name, type, image_url, rate_per_day )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
    return data || [];
}

// Populate sidebar with user info
function populateSidebar() {
    if (!currentUser) return;
    const userNameElement = document.querySelector('.user-name');
    const profileImg = document.querySelector('.profile-img');
    if (userNameElement) {
        const fullName = `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim();
        userNameElement.textContent = fullName || 'User';
    }
    if (profileImg && currentUser.firstname) {
        profileImg.textContent = currentUser.firstname.charAt(0).toUpperCase();
    }
}

async function populateUserProfile() {
  // Get Auth email and metadata fields
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !currentUser) return;

  // Name and Role
  document.querySelector('.profile-name').textContent =
    `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim() || 'User';
  document.querySelector('.profile-role').textContent =
    currentUser.role || 'User';

  // Set profile fields (adjust null checks to your schema)
  const grid = document.querySelector('.profile-info-grid');
  if (!grid) return;

  // Format address string
  const address = [currentUser.address, currentUser.city, currentUser.state, currentUser.zipcode]
    .filter(Boolean).join(', ').replace(/^,+|,+$/g, '').replace(/,{2,}/g, ', ');

  // Map for each label
  const valueMap = {
    'Email': user.email || '',
    'Phone': currentUser.phone || 'Not provided',
    'Address': address || 'Not provided',
    'Date of Birth': currentUser.dateofbirth || 'Not provided',
    "Driver's License": currentUser.licensenumber || 'Not provided',
    'Membership': currentUser.premium_member ? 'Premium' : 'Basic',
    'Account Status': currentUser.account_verified ? 'Active' : 'Pending',
    'Joined On': currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-CA') : 'Unknown'
  };

  // Set all values
  grid.querySelectorAll('div').forEach(div => {
    const label = div.querySelector('label');
    const valueDiv = div.querySelector('.profile-info-value');
    if (label && valueDiv && label.textContent in valueMap) {
      valueDiv.textContent = valueMap[label.textContent];
    }
  });
}


// Populate bookings section
function populateUserBookings() {
    const bookingsContainer = document.querySelector('.bookings-container');
    if (!bookingsContainer) return;

    if (!userBookings || userBookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="no-bookings" style="text-align: center; padding: 2rem; background: white; border-radius: 12px;">
                <h3 style="color: #6b7280; margin-bottom: 1rem;">No Bookings Found</h3>
                <p style="color: #9ca3af;">You haven't made any bookings yet.</p>
                <a href="explore.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
                    Browse Cars
                </a>
            </div>
        `;
        return;
    }

    const bookingsHTML = userBookings.map(booking => createBookingCard(booking)).join('');
    bookingsContainer.innerHTML = bookingsHTML;
}

// Create individual booking card HTML
function createBookingCard(booking) {
    const car = booking.cars || {};
    const statusClass = getStatusClass(booking.booking_status);
    const statusText = booking.booking_status || 'pending';
    
    return `
        <div class="booking-card" data-status="${statusText.toLowerCase()}">
            <div class="booking-image">
                ${car.image_url ? 
                    `<img src="${car.image_url}" alt="${car.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                    ''
                }
                <div class="image-placeholder" ${car.image_url ? 'style="display: none;"' : ''}>
                    🚗
                </div>
            </div>
            <div class="booking-content">
                <div class="booking-header">
                    <h3>${car.name || 'Car'} ${car.type || ''}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="booking-details">
                    <div class="detail-row">
                        <span>Booking ID:</span>
                        <span>${booking.id.substring(0, 8)}...</span>
                    </div>
                    <div class="detail-row">
                        <span>Pickup:</span>
                        <span>${formatDate(booking.pickup_date)} at ${formatTime(booking.pickup_time)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Return:</span>
                        <span>${formatDate(booking.return_date)} at ${formatTime(booking.return_time)}</span>
                    </div>
                    <div class="detail-row">
                        <span>Duration:</span>
                        <span>${booking.total_days} ${booking.total_days === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Location:</span>
                        <span>${booking.pickup_location}</span>
                    </div>
                    <div class="detail-row">
                        <span>Total Amount:</span>
                        <span><strong>₹${booking.total_amount?.toLocaleString() || '0'}</strong></span>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-primary" onclick="viewBookingDetails('${booking.id}')">
                        View Details
                    </button>
                    ${canCancelBooking(booking) ? 
                        `<button class="btn btn-secondary" onclick="cancelBooking('${booking.id}')">
                            Cancel
                        </button>` : 
                        ''
                    }
                </div>
            </div>
        </div>
    `;
}

// Status class mapping
function getStatusClass(s) {
  const k = (s || '').toLowerCase();
  const map = {
    // Core user-facing buckets
    pending: 'pending',
    confirmed: 'upcoming',
    active: 'upcoming',
    // Server-side lifecycle variants supported by admin panel
    pickup_successful: 'upcoming',
    return_successful: 'upcoming',
    complete: 'completed',
    completed: 'completed',
    cancelled: 'cancelled',
    canceled: 'cancelled'
  };
  return map[k] || 'pending';
}
// Can cancel?
function canCancelBooking(b) {
    const s = b.booking_status?.toLowerCase();
    return ['upcoming','confirmed','pending'].includes(s);
}

// Populate update form with current data
function populateUpdateForm() {
    if (!currentUser) return;
    const form = document.getElementById('updateProfileForm');
    if (!form) return;
    const fields = {
        firstName: currentUser.firstname,
        lastName: currentUser.lastname,
        email: currentUser.email,
        phone: currentUser.phone,
        dateOfBirth: currentUser.dateofbirth,
        address: currentUser.address,
        city: currentUser.city,
        state: currentUser.state,
        zipCode: currentUser.zipcode,
        licenseNumber: currentUser.licensenumber,
        emergencyContact: currentUser.emergencycontactname,
        emergencyPhone: currentUser.emergencycontactphone
    };
    Object.entries(fields).forEach(([name, val]) => {
        const inp = form.querySelector(`[name="${name}"]`);
        if (inp) inp.value = val || '';
    });
}

// Navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchSection(link.dataset.section);
            if (mobileMenuOpen) toggleMobileMenu();
        });
    });
}
function switchSection(sec) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${sec}"]`).classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${sec}-section`).classList.add('active');
    currentSection = sec;
}
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menuToggle');
    mobileMenuOpen = !mobileMenuOpen;
    sidebar.classList.toggle('open', mobileMenuOpen);
    toggle.classList.toggle('active', mobileMenuOpen);
    document.body.classList.toggle('menu-open', mobileMenuOpen);
}

// Filters
function initializeFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterBookings(btn.dataset.filter);
        });
    });
}
function filterBookings(f) {
    document.querySelectorAll('.booking-card').forEach(card => {
        card.style.display = (f === 'all' || card.dataset.status === f) ? 'block' : 'none';
    });
}

// Form init & update
function initializeForm() {
    const form = document.getElementById('updateProfileForm');
    if (form) form.addEventListener('submit', e => {
        e.preventDefault();
        updateProfile();
    });
}
async function updateProfile() {
    const btn = document.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.textContent = 'Updating...';
    btn.disabled = true;

    const data = new FormData(document.getElementById('updateProfileForm'));
    const updates = {
        firstname: data.get('firstName'),
        lastname: data.get('lastName'),
        phone: data.get('phone'),
        dateofbirth: data.get('dateOfBirth'),
        address: data.get('address'),
        city: data.get('city'),
        state: data.get('state'),
        zipcode: data.get('zipCode'),
        licensenumber: data.get('licenseNumber'),
        emergencycontactname: data.get('emergencyContact'),
        emergencycontactphone: data.get('emergencyPhone')
    };

    const { data: { user } } = await supabase.auth.getUser();
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (error) throw error;
        currentUser = data;
        populateUserProfile();
        populateSidebar();
        btn.textContent = 'Updated!';
        btn.classList.replace('btn-primary', 'btn-success');
        showNotification('Profile updated successfully!', 'success');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            btn.classList.replace('btn-success', 'btn-primary');
        }, 2000);
    } catch (err) {
        console.error('Error updating profile:', err);
        showNotification('Error updating profile: ' + err.message, 'error');
        btn.innerHTML = original;
        btn.disabled = false;
    }
}
function resetForm() {
    if (confirm('Discard changes?')) {
        populateUpdateForm();
        showNotification('Form reset successfully', 'info');
    }
}

// Booking actions
function viewBookingDetails(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Create modal or navigate to details page
    showBookingModal(booking);
}

function showBookingModal(booking) {
    const modalHTML = `
        <div class="modal" id="bookingModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Booking Details</h3>
                    <button class="close-modal" onclick="closeBookingModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="booking-details-full">
                        <h4>${booking.cars?.name || 'Car'} ${booking.cars?.type || ''}</h4>
                        <div class="detail-grid">
                            <div><strong>Booking ID:</strong> ${booking.id}</div>
                            <div><strong>Status:</strong> ${booking.booking_status}</div>
                            <div><strong>Pickup Date:</strong> ${formatDate(booking.pickup_date)}</div>
                            <div><strong>Return Date:</strong> ${formatDate(booking.return_date)}</div>
                            <div><strong>Pickup Time:</strong> ${formatTime(booking.pickup_time)}</div>
                            <div><strong>Return Time:</strong> ${formatTime(booking.return_time)}</div>
                            <div><strong>Pickup Location:</strong> ${booking.pickup_location}</div>
                            <div><strong>Return Location:</strong> ${booking.return_location}</div>
                            <div><strong>Total Days:</strong> ${booking.total_days}</div>
                            <div><strong>Daily Rate:</strong> ₹${booking.daily_rate?.toLocaleString()}</div>
                            <div><strong>Subtotal:</strong> ₹${booking.subtotal?.toLocaleString()}</div>
                            <div><strong>Taxes:</strong> ₹${booking.taxes?.toLocaleString()}</div>
                            <div><strong>Security Deposit:</strong> ₹${booking.security_deposit?.toLocaleString()}</div>
                            <div><strong>Total Amount:</strong> ₹${booking.total_amount?.toLocaleString()}</div>
                            <div><strong>Payment Status:</strong> ${booking.payment_status}</div>
                            <div><strong>Payment Method:</strong> ${booking.payment_method}</div>
                            ${booking.special_requests ? `<div><strong>Special Requests:</strong> ${booking.special_requests}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.remove();
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const { error } = await supabase
            .from('bookings')
            .update({ booking_status: 'cancelled' })
            .eq('id', bookingId);

        if (error) throw error;

        // Refresh bookings
        userBookings = await getUserBookings();
        populateUserBookings();
        
        showNotification('Booking cancelled successfully', 'success');

    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Error cancelling booking: ' + error.message, 'error');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const { error } = await supabase
            .from('bookings')
            .update({ booking_status: 'cancelled' })
            .eq('id', bookingId);

        if (error) throw error;

        // Refresh bookings
        userBookings = await getUserBookings();
        populateUserBookings();
        
        showNotification('Booking cancelled successfully', 'success');

    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Error cancelling booking: ' + error.message, 'error');
    }
}
// Invoice stub
function downloadInvoice(id) {
    showNotification('Invoice downloaded successfully (demo).', 'success');
}

// Utilities
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}
function formatTime(t) {
    if (!t) return '';
    return new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
// Click outside to close mobile menu
function attachEventListeners() {
    const toggle = document.getElementById('menuToggle');
    toggle?.addEventListener('click', e => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    document.addEventListener('click', e => {
        if (mobileMenuOpen && !e.target.closest('#sidebar') && !e.target.closest('#menuToggle')) {
            toggleMobileMenu();
        }
    });
}


// New: Download invoice button (stub or real implementation)
function downloadInvoice(bookingId) {
  const booking = userBookings.find(b => b.id === bookingId);
  if (!booking) return showNotification('Booking not found.', 'error');

  // You can later integrate PDF generation here.
  // For now, just simulate.
  showNotification('Invoice downloaded successfully (demo).', 'success');
}
// ...existing code...

// Replace the showBookingModal function with this version:
function showBookingModal(booking) {
  const modalHTML = `
    <div class="modal-overlay" id="bookingModal">
      <div class="modal-box animate-in">
        <div class="modal-header">
          <h3>Booking Details</h3>
          <button class="close-modal" onclick="closeBookingModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-summary">
            <img src="${booking.cars?.image_url || ''}" alt="${booking.cars?.name || 'Car'}"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="modal-info">
              <h2>${booking.cars?.name || 'Car'} ${booking.cars?.type || ''}</h2>
              <p><strong>Status:</strong> ${booking.booking_status}</p>
              <p><strong>Total:</strong> ₹${booking.total_amount?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div class="detail-grid">
            <div><strong>Booking ID:</strong> ${booking.id}</div>
            <div><strong>Status:</strong> ${booking.booking_status}</div>
            <div><strong>Pickup Date:</strong> ${formatDate(booking.pickup_date)}</div>
            <div><strong>Return Date:</strong> ${formatDate(booking.return_date)}</div>
            <div><strong>Pickup Time:</strong> ${formatTime(booking.pickup_time)}</div>
            <div><strong>Return Time:</strong> ${formatTime(booking.return_time)}</div>
            <div><strong>Pickup Location:</strong> ${booking.pickup_location}</div>
            <div><strong>Return Location:</strong> ${booking.return_location}</div>
            <div><strong>Total Days:</strong> ${booking.total_days}</div>
            <div><strong>Daily Rate:</strong> ₹${booking.daily_rate?.toLocaleString()}</div>
            <div><strong>Subtotal:</strong> ₹${booking.subtotal?.toLocaleString()}</div>
            <div><strong>Taxes:</strong> ₹${booking.taxes?.toLocaleString()}</div>
            <div><strong>Security Deposit:</strong> ₹${booking.security_deposit?.toLocaleString()}</div>
            <div><strong>Total Amount:</strong> ₹${booking.total_amount?.toLocaleString()}</div>
            <div><strong>Payment Status:</strong> ${booking.payment_status}</div>
            <div><strong>Payment Method:</strong> ${booking.payment_method}</div>
            ${booking.special_requests ? `<div><strong>Special Requests:</strong> ${booking.special_requests}</div>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="downloadInvoice('${booking.id}')">📄 Download Invoice</button>
          <button class="btn btn-primary" onclick="closeBookingModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
