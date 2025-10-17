// Enhanced Admin Dashboard JavaScript with Dynamic Supabase Integration

// Page Management
function showPage(pageId, event) {
    if (event) {
        event.preventDefault();
    }
    // Hide all pages with smooth transition
    document.querySelectorAll('.page').forEach(page => {
        page.style.opacity = '0';
        setTimeout(() => {
            page.style.display = 'none';
        }, 150);
    });

    // Show selected page with smooth transition
    setTimeout(() => {
        const selectedPage = document.getElementById(pageId);
        selectedPage.style.display = 'block';
        setTimeout(() => {
            selectedPage.style.opacity = '1';
        }, 50);
    }, 150);

    // Update active menu item
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Load specific page data
    if (pageId === 'managecar') {
        loadCars();
    } else if (pageId === 'dashboard') {
        loadDashboardStats();
    }

    // Close mobile menu after navigation
    if (window.innerWidth <= 968) {
        closeMobileMenu();
    }
}

// FIXED Mobile Menu Toggle
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    console.log('Initializing mobile menu...'); // Debug
    console.log('Mobile toggle found:', !!mobileToggle);
    console.log('Sidebar found:', !!sidebar);

    if (mobileToggle && sidebar) {
        // Remove existing event listeners by cloning
        const newToggle = mobileToggle.cloneNode(true);
        mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);

        // Add event listener to new toggle
        newToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked!'); // Debug
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnToggle = newToggle.contains(e.target);
            if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        // Close menu on window resize to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 968 && sidebar.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        // Close menu when clicking nav links on mobile
        const navLinks = sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 968) {
                    setTimeout(() => {
                        closeMobileMenu();
                    }, 300); // Delay to allow page transition
                }
            });
        });

        console.log('Mobile menu initialized successfully!'); // Debug
    } else {
        console.error('Mobile menu elements not found!');
    }
}

function openMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    if (sidebar && toggle) {
        sidebar.classList.add('open');
        toggle.classList.add('active');
        document.body.classList.add('menu-open');
        // Update icon
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times';
        }
        console.log('Mobile menu opened'); // Debug
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    if (sidebar && toggle) {
        sidebar.classList.remove('open');
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        // Update icon
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
        console.log('Mobile menu closed'); // Debug
    }
}

// === SUPABASE CAR MANAGEMENT ===

// Load cars from Supabase
async function loadCars() {
    console.log('Loading cars from Supabase...');
    const carsContainer = document.getElementById('carsContainer');

    if (!carsContainer) {
        console.error('Cars container not found');
        return;
    }

    // Show loading state
    carsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading cars...</p>
        </div>
    `;

    try {
        const { data: cars, error } = await window.supabaseClient
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading cars:', error);
            carsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load cars. Please try again.</p>
                    <button class="btn btn-primary" onclick="loadCars()">Retry</button>
                </div>
            `;
            return;
        }

        console.log('Cars loaded:', cars?.length || 0);
        renderCars(cars || []);
    } catch (error) {
        console.error('Error loading cars:', error);
        carsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load cars. Please check your connection.</p>
            </div>
        `;
    }
}

// Render cars in the manage cars table
function renderCars(cars) {
    const carsContainer = document.getElementById('carsContainer');

    if (!cars || cars.length === 0) {
        carsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h3>No cars found</h3>
                <p>Add your first car to get started</p>
                <button class="btn btn-primary" onclick="showPage('addcar', event)">
                    <i class="fas fa-plus"></i>
                    Add Car
                </button>
            </div>
        `;
        return;
    }

    const carsHTML = cars.map(car => {
        const isAvailable = car.status !== 'unavailable';
        const statusClass = isAvailable ? 'available' : 'not-available';
        const statusText = isAvailable ? 'Available' : 'Not Available';
        const toggleIcon = isAvailable ? 'fa-eye' : 'fa-eye-slash';

        return `
            <div class="car-row" data-car-id="${car.id}">
                <div class="car-info">
                    <div class="car-image">
                        ${car.image_url ?
                `<img src="${car.image_url}" alt="${car.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />` :
                `<i class="fas fa-car"></i>`
            }
                    </div>
                    <div class="car-details">
                        <strong>${car.name || 'Unknown Car'}</strong>
                        <small>${car.type || ''} â€¢ ${car.fuel || ''} â€¢ ${car.transmission || ''}</small>
                    </div>
                </div>
                <div class="car-price">${car.price || 'N/A'}</div>
                <div class="car-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="car-bookings">0 bookings</div>
                <div class="car-actions">
                    <button class="action-btn toggle-status" title="Toggle availability" data-car-id="${car.id}">
                        <i class="fas ${toggleIcon}"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit car" data-car-id="${car.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete car" data-car-id="${car.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    carsContainer.innerHTML = carsHTML;
}

// Toggle car status (available/unavailable)
async function toggleCarStatus(carId) {
    try {
        // Get current car data
        const { data: car, error: fetchError } = await window.supabaseClient
            .from('cars')
            .select('status')
            .eq('id', carId)
            .single();

        if (fetchError) {
            console.error('Error fetching car:', fetchError);
            showNotification('Failed to fetch car status', 'error');
            return;
        }

        // Toggle status
        const currentStatus = car.status || 'available';
        const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';

        // Update in Supabase
        const { error: updateError } = await window.supabaseClient
            .from('cars')
            .update({ status: newStatus })
            .eq('id', carId);

        if (updateError) {
            console.error('Error updating car status:', updateError);
            showNotification('Failed to update car status', 'error');
            return;
        }

        showNotification(`Car status updated to ${newStatus}`, 'success');

        // Update UI immediately
        const carRow = document.querySelector(`[data-car-id="${carId}"]`);
        if (carRow) {
            const statusBadge = carRow.querySelector('.status-badge');
            const toggleBtn = carRow.querySelector('.toggle-status i');

            if (newStatus === 'available') {
                statusBadge.textContent = 'Available';
                statusBadge.className = 'status-badge available';
                toggleBtn.className = 'fas fa-eye';
            } else {
                statusBadge.textContent = 'Not Available';
                statusBadge.className = 'status-badge not-available';
                toggleBtn.className = 'fas fa-eye-slash';
            }

            // Add update animation
            statusBadge.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                statusBadge.style.animation = '';
            }, 600);
        }

        // Update dashboard stats
        loadDashboardStats();
    } catch (error) {
        console.error('Error toggling car status:', error);
        showNotification('Failed to update car status', 'error');
    }
}

// Delete car from Supabase
async function deleteCar(carId) {
    const confirmDelete = confirm('Are you sure you want to delete this car? This action cannot be undone.');

    if (!confirmDelete) {
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('cars')
            .delete()
            .eq('id', carId);

        if (error) {
            console.error('Error deleting car:', error);
            showNotification('Failed to delete car', 'error');
            return;
        }

        showNotification('Car deleted successfully!', 'success');

        // Remove from UI with animation
        const carRow = document.querySelector(`[data-car-id="${carId}"]`);
        if (carRow) {
            carRow.style.animation = 'slideOut 0.5s ease-in-out forwards';
            setTimeout(() => {
                carRow.remove();

                // Check if no cars left
                const remainingCars = document.querySelectorAll('#carsContainer .car-row');
                if (remainingCars.length === 0) {
                    renderCars([]);
                }
            }, 500);
        }

        // Update dashboard stats
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting car:', error);
        showNotification('Failed to delete car', 'error');
    }
}

// Car Actions Event Handler
function initCarActions() {
    document.addEventListener('click', async function (e) {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const carId = button.getAttribute('data-car-id');
        if (!carId) return;

        if (button.classList.contains('toggle-status')) {
            await toggleCarStatus(carId);
        } else if (button.classList.contains('delete-btn')) {
            await deleteCar(carId);
        } else if (button.classList.contains('edit-btn')) {
            // TODO: Implement edit functionality
            showNotification('Edit functionality coming soon!', 'info');
        }
    });
}

// Add new car to Supabase
async function addCar(carData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('cars')
            .insert([{
                ...carData,
                status: 'available',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error adding car:', error);
            showNotification('Failed to add car', 'error');
            return false;
        }

        showNotification('Car added successfully!', 'success');

        // Update dashboard stats
        loadDashboardStats();

        return true;
    } catch (error) {
        console.error('Error adding car:', error);
        showNotification('Failed to add car', 'error');
        return false;
    }
}

// Add Car Form Handler
function initAddCarForm() {
    const addCarForm = document.getElementById('addCarForm');
    if (addCarForm) {
        addCarForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(addCarForm);
            const carData = {
                name: document.getElementById('carName').value.trim(),
                type: document.getElementById('carType').value.trim(),
                price: document.getElementById('carPrice').value.trim(),
                seats: document.getElementById('carSeats').value.trim(),
                fuel: document.getElementById('carFuel').value.trim(),
                transmission: document.getElementById('carTransmission').value.trim(),
                location: document.getElementById('carLocation').value.trim(),
                image_url: document.getElementById('carImageUrl').value.trim()
            };

            // Basic validation
            const requiredFields = ['name', 'type', 'price', 'seats', 'fuel', 'transmission', 'location', 'image_url'];
            const missingFields = requiredFields.filter(field => !carData[field]);

            if (missingFields.length > 0) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = addCarForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding Car...';
            submitBtn.disabled = true;

            // Add car
            const success = await addCar(carData);

            if (success) {
                // Reset form
                addCarForm.reset();
                const fileMessage = document.getElementById('fileMessage');
                if (fileMessage) {
                    fileMessage.textContent = '';
                }

                // Navigate to manage cars
                setTimeout(() => {
                    showPage('managecar');
                }, 1000);
            }

            // Reset submit button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        // Fetch cars data
        const { data: cars, error: carsError } = await window.supabaseClient
            .from('cars')
            .select('status');

        if (carsError) {
            console.error('Error loading cars stats:', carsError);
        }

        // Fetch bookings data
        const { data: bookings, error: bookingsError } = await window.supabaseClient
            .from('bookings')
            .select('id');

        if (bookingsError) {
            console.error('Error loading bookings stats:', bookingsError);
        }

        // Calculate car stats
        const totalCars = cars?.length || 0;
        const availableCars = cars?.filter(car => car.status !== 'unavailable').length || 0;
        const unavailableCars = totalCars - availableCars;

        // Calculate booking stats
        const totalBookings = bookings?.length || 0;

        // Update dashboard stats - Cars
        const totalCarsElement = document.getElementById('totalCarsCount');
        const availableCarsElement = document.getElementById('availableCarsCount');
        const unavailableCarsElement = document.getElementById('unavailableCarsCount');

        if (totalCarsElement) totalCarsElement.textContent = totalCars;
        if (availableCarsElement) availableCarsElement.textContent = availableCars;
        if (unavailableCarsElement) unavailableCarsElement.textContent = unavailableCars;

        // Update dashboard stats - Bookings
        const totalBookingsElement = document.getElementById('totalBookingsCount');
        if (totalBookingsElement) totalBookingsElement.textContent = totalBookings;

        // Update change indicators - Cars
        const totalCarsChange = document.getElementById('totalCarsChange');
        const availableCarsChange = document.getElementById('availableCarsChange');
        const unavailableCarsChange = document.getElementById('unavailableCarsChange');

        if (totalCarsChange) totalCarsChange.textContent = `${totalCars} total cars`;
        if (availableCarsChange) availableCarsChange.textContent = `${availableCars} ready to rent`;
        if (unavailableCarsChange) unavailableCarsChange.textContent = `${unavailableCars} need attention`;

        // Update change indicators - Bookings
        const totalBookingsChange = document.getElementById('totalBookingsChange');
        if (totalBookingsChange) totalBookingsChange.textContent = `${totalBookings} total bookings`;

        console.log('Dashboard stats loaded:', {
            totalCars,
            availableCars,
            unavailableCars,
            totalBookings
        });

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Search Cars
function initCarSearch() {
    const searchInput = document.getElementById('carSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const carRows = document.querySelectorAll('#carsContainer .car-row');

            carRows.forEach(row => {
                const carDetails = row.querySelector('.car-details');
                if (carDetails) {
                    const carName = carDetails.querySelector('strong')?.textContent.toLowerCase() || '';
                    const carInfo = carDetails.querySelector('small')?.textContent.toLowerCase() || '';

                    if (carName.includes(searchTerm) || carInfo.includes(searchTerm)) {
                        row.style.display = 'grid';
                        row.style.animation = 'fadeIn 0.3s ease-in';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }
}

// Load bookings from Supabase with car and user details
async function loadBookings() {
    console.log('Loading bookings from Supabase...');
    const bookingsContainer = document.querySelector('.booking-table');
    
    if (!bookingsContainer) {
        console.error('Bookings container not found');
        return;
    }

    // Find the table body (skip header row)
    let bookingsBody = bookingsContainer.querySelector('.bookings-body');
    if (!bookingsBody) {
        // Create bookings body if it doesn't exist
        bookingsBody = document.createElement('div');
        bookingsBody.className = 'bookings-body';
        // Keep the header row and append body after it
        const headerRow = bookingsContainer.querySelector('.booking-row.header');
        if (headerRow) {
            headerRow.parentNode.insertBefore(bookingsBody, headerRow.nextSibling);
        }
    }

    // Show loading state
    bookingsBody.innerHTML = `
        <div class="booking-row loading-row">
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading bookings...</p>
            </div>
        </div>
    `;

    try {
        // Fetch bookings with car and user details using joins
const { data: bookings, error } = await window.supabaseClient
            .from('bookings')
            .select(`
                *,
                cars (
                    id,
                    name,
                    type,
                    image_url
                ),
                users (
                    id,
                    firstname,
                    lastname
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            showBookingsError('Failed to load bookings. Please try again.');
            return;
        }

        if (!bookings || bookings.length === 0) {
            showNoBookings();
            return;
        }

        // Render bookings
        renderBookings(bookings);
        console.log(`Loaded ${bookings.length} bookings successfully`);

    } catch (error) {
        console.error('Unexpected error loading bookings:', error);
        showBookingsError('Failed to load bookings. Please check your connection.');
    }
}

// Render bookings in the table
function renderBookings(bookings) {
    const bookingsBody = document.querySelector('.bookings-body');
    
    bookingsBody.innerHTML = bookings.map(booking => {
        const customerName = booking.users ? 
            `${booking.users.firstname || ''} ${booking.users.lastname || ''}`.trim() : 
            'Unknown Customer';
        
        const carName = booking.cars?.name || 'Unknown Car';
        const carType = booking.cars?.type || '';
        
        // Format dates
        const startDate = new Date(booking.pickup_date).toLocaleDateString();
        const endDate = new Date(booking.return_date).toLocaleDateString();
        
        // Calculate total days
        const pickupDate = new Date(booking.pickup_date);
        const returnDate = new Date(booking.return_date);
const totalDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
        
        // Get status display
        const statusInfo = getStatusInfo(booking.booking_status);
        
        return `
            <div class="booking-row" data-booking-id="${booking.id}">
                <div class="booking-info">
                    <div class="customer-info">
                        <strong>${customerName}</strong>
                        <small>${carName}${carType ? ` - ${carType}` : ''}</small>
                    </div>
                </div>
                <div class="booking-details">
                    <div>Start: ${startDate}</div>
                    <div>End: ${endDate}</div>
                    <div><small>ID: ${booking.id.substring(0, 8)}...</small></div>
                </div>
                <div class="booking-duration">
                    ${totalDays} day${totalDays !== 1 ? 's' : ''}
                </div>
                <div class="booking-amount">
                    ₹${booking.total_amount ? booking.total_amount.toLocaleString() : 'N/A'}
                </div>
                <div class="booking-status">
                    <span class="status-badge ${booking.booking_status}">
                        ${statusInfo.display}
                    </span>
                </div>
                <div class="booking-actions">
                    <select class="action-select" onchange="updateBookingStatus('${booking.id}', this.value)" 
                            ${booking.booking_status === 'cancelled' ? 'disabled' : ''}>
                        <option value="">Change Status</option>
                        <option value="pending" ${booking.booking_status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${booking.booking_status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="pickup_successful" ${booking.booking_status === 'pickup_successful' ? 'selected' : ''}>Pickup Successful</option>
                        <option value="return_successful" ${booking.booking_status === 'return_successful' ? 'selected' : ''}>Return Successful</option>
                        <option value="complete" ${booking.booking_status === 'complete' ? 'selected' : ''}>Complete</option>
                        <option value="cancelled" ${booking.booking_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="action-btn view-btn" onclick="viewBookingDetails('${booking.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get status display info
function getStatusInfo(status) {
    const statusMap = {
        'pending': { display: 'Pending', class: 'pending' },
        'confirmed': { display: 'Confirmed', class: 'confirmed' },
        'pickup_successful': { display: 'Pickup Done', class: 'pickup' },
        'return_successful': { display: 'Return Done', class: 'return' },
        'complete': { display: 'Complete', class: 'completed' },
        'cancelled': { display: 'Cancelled', class: 'cancelled' }
    };
    
    return statusMap[status] || { display: status, class: 'unknown' };
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus) {
    if (!newStatus) return;
    
    try {
        console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
        
        const { data, error } = await supabase
            .from('bookings')
            .update({ 
                booking_status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select();

        if (error) {
            console.error('Error updating booking status:', error);
            alert('Failed to update booking status. Please try again.');
            return;
        }

        console.log('Booking status updated successfully:', data);
        
        // Refresh bookings to show updated status
        await loadBookings();
        
        // Show success message
        showSuccessMessage(`Booking status updated to "${getStatusInfo(newStatus).display}" successfully!`);
        
    } catch (error) {
        console.error('Unexpected error updating booking:', error);
        alert('Failed to update booking status. Please check your connection.');
    }
}

// View booking details
async function viewBookingDetails(bookingId) {
    try {
        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                *,
                cars (
                    id,
                    name,
                    type,
                    image_url,
                    price
                ),
                users (
                    id,
                    firstname,
                    lastname,
                    phone,
                    address
                )
            `)
            .eq('id', bookingId)
            .single();

        if (error) {
            console.error('Error fetching booking details:', error);
            alert('Failed to load booking details.');
            return;
        }

        showBookingDetailsModal(booking);
        
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('Failed to load booking details.');
    }
}

// Show booking details modal
function showBookingDetailsModal(booking) {
    const customerName = booking.users ? 
        `${booking.users.firstname || ''} ${booking.users.lastname || ''}`.trim() : 
        'Unknown Customer';
    
    const carName = booking.cars?.name || 'Unknown Car';
    const statusInfo = getStatusInfo(booking.booking_status);
    
    const modalHTML = `
        <div class="booking-details-modal" onclick="closeBookingModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Booking Details</h3>
                    <button class="close-btn" onclick="closeBookingModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${customerName}</p>
                        <p><strong>Phone:</strong> ${booking.users?.phone || 'N/A'}</p>
                        <p><strong>Address:</strong> ${booking.users?.address || 'N/A'}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Vehicle Information</h4>
                        <p><strong>Car:</strong> ${carName}</p>
                        <p><strong>Type:</strong> ${booking.cars?.type || 'N/A'}</p>
                        <p><strong>Daily Rate:</strong> â‚¹${booking.daily_rate || 'N/A'}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Booking Information</h4>
                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                        <p><strong>Pickup Date:</strong> ${new Date(booking.pickup_date).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> ${new Date(booking.return_date).toLocaleDateString()}</p>
                        <p><strong>Total Days:</strong> ${booking.total_days || 'N/A'}</p>
                        <p><strong>Pickup Location:</strong> ${booking.pickup_location || 'N/A'}</p>
                        <p><strong>Return Location:</strong> ${booking.return_location || 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${booking.booking_status}">${statusInfo.display}</span></p>
                    </div>
                    
                    <div class="detail-section">
                        <p><strong>Subtotal:</strong> ₹${booking.subtotal || 'N/A'}</p>
<p><strong>Taxes:</strong> ₹${booking.taxes || 'N/A'}</p>
<p><strong>Total Amount:</strong> ₹${booking.total_amount || 'N/A'}</p>

                        <p><strong>Payment Status:</strong> ${booking.payment_status || 'N/A'}</p>
                        <p><strong>Payment Method:</strong> ${booking.payment_method || 'N/A'}</p>
                    </div>
                    
                    ${booking.special_requests ? `
                        <div class="detail-section">
                            <h4>Special Requests</h4>
                            <p>${booking.special_requests}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close booking details modal
function closeBookingModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.querySelector('.booking-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Show error message
function showBookingsError(message) {
    const bookingsBody = document.querySelector('.bookings-body');
    if (bookingsBody) {
        bookingsBody.innerHTML = `
            <div class="booking-row error-row">
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="color: #e74c3c; margin-bottom: 1rem;"></i>
                    <p style="color: #e74c3c;">${message}</p>
                    <button class="btn btn-primary" onclick="loadBookings()" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

// Show no bookings message
function showNoBookings() {
    const bookingsBody = document.querySelector('.bookings-body');
    if (bookingsBody) {
        bookingsBody.innerHTML = `
            <div class="booking-row no-data-row">
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #95a5a6; margin-bottom: 1rem;"></i>
                    <h3 style="color: #7f8c8d; margin-bottom: 0.5rem;">No Bookings Found</h3>
                    <p style="color: #95a5a6;">No customer bookings available yet.</p>
                </div>
            </div>
        `;
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}
function filterBookings(status = 'all') {
  const bookingRows = document.querySelectorAll('.booking-row:not(.header)');

  bookingRows.forEach(row => {
    const statusBadge = row.querySelector('.status-badge');
    if (!statusBadge) return;

    const rowStatus = statusBadge.classList[1];
    const normalized = {
      pickup_successful: 'pickup',
      return_successful: 'return',
      complete: 'completed'
    }[rowStatus] || rowStatus;

    const matchesFilter = (status === 'all' || normalized === status);

    if (matchesFilter) {
      // Restore correct layout type
      if (window.innerWidth <= 768) {
        row.style.display = 'flex'; // mobile card layout
        row.style.flexDirection = 'column';
      } else {
        row.style.display = 'grid'; // desktop grid layout
      }
    } else {
      row.style.display = 'none';
    }
  });

  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === status);
  });
}

// Initialize filter buttons
function initBookingFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = btn.dataset.filter;
            filterBookings(filter);
        });
    });
}

// Add this to the showPage function for booking page
function loadBookingPage() {
    loadBookings();
    initBookingFilters();
}

// Updated showPage function to include booking page loading
function showPage(pageId, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Hide all pages with smooth transition
    document.querySelectorAll('.page').forEach(page => {
        page.style.opacity = '0';
        setTimeout(() => {
            page.style.display = 'none';
        }, 150);
    });
    
    // Show selected page with smooth transition
    setTimeout(() => {
        const selectedPage = document.getElementById(pageId);
        selectedPage.style.display = 'block';
        setTimeout(() => {
            selectedPage.style.opacity = '1';
        }, 50);
    }, 150);
    
    // Update active menu item
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load specific page data
    if (pageId === 'managecar') {
        loadCars();
    } else if (pageId === 'dashboard') {
        loadDashboardStats();
    } else if (pageId === 'booking') {
        // Load booking page with dynamic data
        loadBookingPage();
    }
    
    // Close mobile menu after navigation
    if (window.innerWidth <= 968) {
        closeMobileMenu();
    }
}
// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Stats Animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        const duration = 2000; // 2 seconds
        const increment = finalValue / (duration / 16); // 60 FPS
        let currentValue = 0;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(currentValue);
        }, 16);
    });
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
        // Quick navigation shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    showPage('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    showPage('addcar');
                    break;
                case '3':
                    e.preventDefault();
                    showPage('managecar');
                    break;
                case '4':
                    e.preventDefault();
                    showPage('booking');
                    break;
            }
        }

        // Escape key to close mobile menu
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                closeMobileMenu();
            }
        }
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Initializing Admin Dashboard...');

    // Check if Supabase client is available
    if (!window.supabaseClient) {
        console.error('Supabase client not found! Make sure supabaseClient.js is loaded.');
        showNotification('Database connection failed. Please refresh the page.', 'error');
        return;
    }

    // Initialize all components
    initMobileMenu(); // This must be first!
    initCarActions();
    initAddCarForm();
    initCarSearch();
    initBookingFilters();
    initBookingActions();
    initKeyboardNavigation();

    // Load initial data
    loadDashboardStats();

    // Animate stats on dashboard
    if (document.getElementById('dashboard').style.display !== 'none') {
        setTimeout(animateStats, 500);
    }

    // Add smooth transitions to all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.transition = 'opacity 0.3s ease-in-out';
    });

    console.log('Admin Dashboard initialized successfully!');
});

// Add CSS for notifications and loading states
const additionalCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease-in-out;
}

.notification.show {
    opacity: 1;
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 500;
}

.notification-success .notification-content {
    background: #d1fae5;
    color: #065f46;
    border-left: 4px solid #10b981;
}

.notification-error .notification-content {
    background: #fee2e2;
    color: #991b1b;
    border-left: 4px solid #ef4444;
}

.notification-warning .notification-content {
    background: #fef3c7;
    color: #92400e;
    border-left: 4px solid #f59e0b;
}

.notification-info .notification-content {
    background: #dbeafe;
    color: #1e40af;
    border-left: 4px solid #2563eb;
}

.notification i:first-child {
    margin-right: 0.75rem;
    font-size: 1.125rem;
}

.notification span {
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: 0.75rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.notification-close:hover {
    opacity: 1;
}

.loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: var(--gray-600);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-blue);
}

.error-state i, .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--gray-400);
}

.error-state h3, .empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: 0.5rem;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes slideOut {
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    100% {
        opacity: 0;
        transform: translateX(-100%);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@media (max-width: 480px) {
    .notification {
        left: 20px;
        right: 20px;
        min-width: auto;
    }
}
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
// Set Admin Name from Supabase Auth -> Users -> display name
async function setAdminDisplayNameFromSupabase() {
  const el = document.getElementById('adminDisplayName');
  if (!el || !window.supabaseClient) return;

  try {
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    if (error) throw error;

    if (!user) {
      el.textContent = 'Administrator';
      return;
    }

    // Priority: display_name (Supabase Users metadata "Display name" field in dashboard)
    let displayName =
      user.user_metadata?.display_name ||
      user.user_metadata?.displayName ||    // common variant
      user.user_metadata?.full_name ||      // provider default
      user.user_metadata?.name ||           // provider default
      (user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : null);

    el.textContent = displayName || user.email || 'Administrator';
  } catch (e) {
    console.warn('Name set failed:', e);
    const el = document.getElementById('adminDisplayName');
    if (el) el.textContent = 'Administrator';
  }
}

// Init on load and keep in sync with auth changes
document.addEventListener('DOMContentLoaded', () => {
  setAdminDisplayNameFromSupabase();

  if (window.supabaseClient?.auth?.onAuthStateChange) {
    window.supabaseClient.auth.onAuthStateChange(() => {
      setAdminDisplayNameFromSupabase();
    });
  }
});