// Gramin Healthcare - Frontend JavaScript

// API Base URL (Change this to your Python backend URL)
const API_BASE_URL = 'http://localhost:8000';

// State Management
let currentUser = null;
let allDoctors = [];
let allBookings = [];
let districtMasterList = [];

const SPECIALIZATIONS = [
    'General Physician',
    'Pediatrician',
    'Cardiologist',
    'Orthopedic',
    'Dermatologist',
    'Gynecologist',
    'Dentist',
    'Ayurveda',
    'Neurologist',
    'ENT Specialist',
    'Psychiatrist',
    'Ophthalmologist'
];

const villageToDistrict = {
    'Rampur Village': 'Varanasi',
    'Shivpur Village': 'Lucknow',
    'Lakshmipur Village': 'Prayagraj',
    'Ganeshpur Village': 'Kanpur Dehat',
    'Krishnapur Village': 'Gorakhpur',
    'Suryapur Village': 'Jaunpur',
    'Nandgaon Village': 'Azamgarh',
    'Haripur Village': 'Ballia',
    'Ranjitpur Village': 'Basti'
};

// Sample Data (Fallback if API not available)
const sampleDoctors = [
    {
        id: 1, name: "Dr. Rajesh Kumar", specialization: "General Physician",
        location: "Rampur Village", contact_number: "9876543210", fees: 150.00,
        available_days: "Monday,Wednesday,Friday", start_time: "09:00",
        end_time: "17:00", seat_capacity: 20, experience: 15,
        qualification: "MBBS, MD", rating: 4.8
    },
    {
        id: 2, name: "Dr. Priya Sharma", specialization: "Pediatrician",
        location: "Shivpur Village", contact_number: "9876543211", fees: 200.00,
        available_days: "Tuesday,Thursday,Saturday", start_time: "10:00",
        end_time: "18:00", seat_capacity: 15, experience: 10,
        qualification: "MBBS, MD (Pediatrics)", rating: 4.9
    },
    {
        id: 3, name: "Dr. Anamika Singh", specialization: "Gynecologist",
        location: "Lakshmipur Village", contact_number: "9876543212", fees: 300.00,
        available_days: "Monday,Tuesday,Thursday", start_time: "09:00",
        end_time: "16:00", seat_capacity: 12, experience: 12,
        qualification: "MBBS, MS (Gynecology)", rating: 4.7
    },
    {
        id: 4, name: "Dr. Sunil Verma", specialization: "Dentist",
        location: "Rampur Village", contact_number: "9876543213", fees: 250.00,
        available_days: "Wednesday,Friday,Saturday", start_time: "11:00",
        end_time: "19:00", seat_capacity: 18, experience: 8,
        qualification: "BDS, MDS", rating: 4.6
    },
    {
        id: 5, name: "Dr. Meera Devi", specialization: "Ayurveda",
        location: "Ganeshpur Village", contact_number: "9876543214", fees: 100.00,
        available_days: "Monday,Tuesday,Wednesday,Thursday,Friday", start_time: "08:00",
        end_time: "14:00", seat_capacity: 30, experience: 25,
        qualification: "BAMS, MD (Ayurveda)", rating: 4.9
    },
    {
        id: 6, name: "Dr. Vikram Patel", specialization: "Cardiologist",
        location: "Krishnapur Village", contact_number: "9876543215", fees: 500.00,
        available_days: "Tuesday,Thursday", start_time: "14:00",
        end_time: "20:00", seat_capacity: 8, experience: 20,
        qualification: "MBBS, MD (Cardiology)", rating: 4.9
    },
    {
        id: 7, name: "Dr. Kavita Rao", specialization: "Dermatologist",
        location: "Shivpur Village", contact_number: "9876543216", fees: 350.00,
        available_days: "Wednesday,Saturday", start_time: "10:00",
        end_time: "17:00", seat_capacity: 10, experience: 7,
        qualification: "MBBS, MD (Dermatology)", rating: 4.5
    },
    {
        id: 8, name: "Dr. Suresh Yadav", specialization: "Orthopedic",
        location: "Suryapur Village", contact_number: "9876543217", fees: 400.00,
        available_days: "Monday,Friday", start_time: "09:00",
        end_time: "15:00", seat_capacity: 15, experience: 18,
        qualification: "MBBS, MS (Orthopedics)", rating: 4.8
    },
    {
        id: 9, name: "Dr. Anita Devi", specialization: "General Physician",
        location: "Ganeshpur Village", contact_number: "9876543218", fees: 120.00,
        available_days: "Tuesday,Wednesday,Thursday,Friday", start_time: "08:30",
        end_time: "16:30", seat_capacity: 25, experience: 10,
        qualification: "MBBS", rating: 4.6
    },
    {
        id: 10, name: "Dr. Ramesh Prasad", specialization: "Pediatrician",
        location: "Lakshmipur Village", contact_number: "9876543219", fees: 180.00,
        available_days: "Monday,Wednesday,Friday", start_time: "09:00",
        end_time: "17:00", seat_capacity: 20, experience: 12,
        qualification: "MBBS, DCH", rating: 4.7
    },
    {
        id: 11, name: "Dr. Amit Barman", specialization: "Neurologist",
        location: "Ranjitpur Village", contact_number: "9876543229", fees: 2000.00,
        available_days: "Monday,Friday", start_time: "09:00",
        end_time: "18:00", seat_capacity: 20, experience: 13,
        qualification: "MBBS, MD Neurology", rating: 4.7
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    await setupMasterFilters();

    // Check for logged in user
    const savedUser = localStorage.getItem('graminUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    // Load doctors
    await loadDoctors();
    
    // Load bookings if user logged in
    if (currentUser) {
        await loadUserBookings();
    }
    
    // Set min date for booking
    const today = new Date().toISOString().split('T')[0];
    const bookingDateInput = document.getElementById('bookingDate');
    if (bookingDateInput) {
        bookingDateInput.min = today;
    }
}

async function setupMasterFilters() {
    setSelectOptions('specializationFilter', SPECIALIZATIONS, 'All Specializations');
    setSelectOptions('doctorSpecialization', SPECIALIZATIONS, 'Select specialization');

    districtMasterList = await loadAllIndiaDistricts();
    populateDistrictSelectors();

    updateVillageSelect('locationFilter', '', 'All Villages');
    updateVillageSelect('locationSelectAI', '', 'Any Location');
    updateVillageSuggestions('registerVillageList', '', true);
    updateVillageSuggestions('doctorLocationList', '', true);

    const districtFilter = document.getElementById('districtFilter');
    if (districtFilter) {
        districtFilter.addEventListener('change', () => {
            updateVillageSelect('locationFilter', districtFilter.value, 'All Villages');
            filterDoctors();
        });
    }

    const registerDistrict = document.getElementById('registerDistrict');
    if (registerDistrict) {
        registerDistrict.addEventListener('input', () => {
            updateVillageSuggestions('registerVillageList', registerDistrict.value, true);
            const registerVillage = document.getElementById('registerVillage');
            if (registerVillage) registerVillage.value = '';
        });
    }

    const doctorDistrict = document.getElementById('doctorDistrict');
    if (doctorDistrict) {
        doctorDistrict.addEventListener('input', () => {
            updateVillageSuggestions('doctorLocationList', doctorDistrict.value, true);
            const doctorLocation = document.getElementById('doctorLocation');
            if (doctorLocation) doctorLocation.value = '';
        });
    }
}

async function loadAllIndiaDistricts() {
    const response = await apiCall('/api/locations/districts');
    if (response && Array.isArray(response.districts) && response.districts.length > 0) {
        return [...new Set(response.districts)].sort();
    }

    return [...new Set(Object.values(villageToDistrict))].sort();
}

function getDistrictOptions() {
    const doctorDistricts = allDoctors
        .map((doctor) => doctor.district)
        .filter((district) => district && district !== 'Unknown District');

    return [...new Set([...districtMasterList, ...Object.values(villageToDistrict), ...doctorDistricts])].sort();
}

function populateDistrictSelectors() {
    const districts = getDistrictOptions();
    setSelectOptions('districtFilter', districts, 'All Districts');
    updateDistrictSuggestions('registerDistrictList', districts);
    updateDistrictSuggestions('doctorDistrictList', districts);
}

function updateDistrictSuggestions(listId, districts) {
    const dataList = document.getElementById(listId);
    if (!dataList) return;

    dataList.innerHTML = districts
        .map((district) => `<option value="${district}"></option>`)
        .join('');
}

function setSelectOptions(selectId, options, defaultLabel) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `<option value="">${defaultLabel}</option>` + options
        .map((option) => `<option value="${option}">${option}</option>`)
        .join('');

    if (previousValue && options.includes(previousValue)) {
        select.value = previousValue;
    }
}

function getVillagesByDistrict(district) {
    return Object.keys(villageToDistrict)
        .filter((village) => !district || villageToDistrict[village] === district)
        .sort();
}

function updateVillageSelect(selectId, district, defaultLabel) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const villages = getVillagesByDistrict(district);

    select.innerHTML = `<option value="">${defaultLabel}</option>` + villages
        .map((village) => `<option value="${village}">${village}</option>`)
        .join('');
}

function updateVillageSuggestions(listId, district, includeGlobal = false) {
    const dataList = document.getElementById(listId);
    if (!dataList) return;

    let villages = getVillagesByDistrict(district);
    if (includeGlobal) {
        villages = [...new Set([...villages, ...Object.keys(villageToDistrict)])].sort();
    }

    dataList.innerHTML = villages
        .map((village) => `<option value="${village}"></option>`)
        .join('');
}

function syncVillageDistrictMap(doctors) {
    doctors.forEach((doctor) => {
        const location = (doctor.location || '').trim();
        const district = (doctor.district || '').trim();
        if (location && district && district !== 'Unknown District') {
            villageToDistrict[location] = district;
        }
    });
}

function refreshLocationControls() {
    populateDistrictSelectors();

    const districtFilter = document.getElementById('districtFilter');
    const registerDistrict = document.getElementById('registerDistrict');
    const doctorDistrict = document.getElementById('doctorDistrict');

    updateVillageSelect('locationFilter', districtFilter ? districtFilter.value : '', 'All Villages');
    updateVillageSelect('locationSelectAI', '', 'Any Location');
    updateVillageSuggestions('registerVillageList', registerDistrict ? registerDistrict.value : '', true);
    updateVillageSuggestions('doctorLocationList', doctorDistrict ? doctorDistrict.value : '', true);

    const totalVillages = document.getElementById('totalVillages');
    if (totalVillages) {
        totalVillages.textContent = Object.keys(villageToDistrict).length;
    }
}

function getDistrictByVillage(village) {
    return villageToDistrict[village] || 'Unknown District';
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.log('API Call failed, using local data:', error);
        return null;
    }
}

// Load Doctors
async function loadDoctors() {
    const response = await apiCall('/api/doctors');
    allDoctors = (response ? response.doctors : sampleDoctors).map((doctor) => ({
        ...doctor,
        district: doctor.district || getDistrictByVillage(doctor.location),
    }));
    syncVillageDistrictMap(allDoctors);
    refreshLocationControls();
    displayDoctors(allDoctors);
    
    // Update stats
    document.getElementById('totalDoctors').textContent = allDoctors.length + '+';
}

// Display Doctors
function displayDoctors(doctors) {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;
    
    if (doctors.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: rgba(5, 150, 105, 0.3);"></i>
                <h3 style="margin: 1rem 0;">No Doctors Found</h3>
                <p style="color: rgba(31, 41, 55, 0.7);">Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = doctors.map((doctor, index) => `
        <div class="doctor-card" style="animation-delay: ${index * 0.1}s">
            <div class="doctor-header">
                <div class="doctor-rating"><i class="fas fa-star"></i> ${doctor.rating}</div>
                <div class="doctor-name">${doctor.name}</div>
                <div class="doctor-specialization">${doctor.specialization}</div>
            </div>
            <div class="doctor-body">
                <div class="doctor-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${doctor.location}, ${doctor.district || getDistrictByVillage(doctor.location)}</span>
                </div>
                <div class="doctor-info">
                    <i class="fas fa-phone"></i>
                    <span>${doctor.contact_number}</span>
                </div>
                <div class="doctor-info">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${doctor.qualification}</span>
                </div>
                <div class="doctor-info">
                    <i class="fas fa-briefcase"></i>
                    <span>${doctor.experience} years experience</span>
                </div>
                <div class="doctor-stats">
                    <div class="doctor-stat">
                        <div class="doctor-stat-value">₹${doctor.fees}</div>
                        <div class="doctor-stat-label">Fees</div>
                    </div>
                    <div class="doctor-stat">
                        <div class="doctor-stat-value">${doctor.seat_capacity}</div>
                        <div class="doctor-stat-label">Seats/Day</div>
                    </div>
                    <div class="doctor-stat">
                        <div class="doctor-stat-value">${doctor.start_time}</div>
                        <div class="doctor-stat-label">Start Time</div>
                    </div>
                </div>
                <div class="doctor-info">
                    <i class="fas fa-calendar-week"></i>
                    <span>${doctor.available_days}</span>
                </div>
                <div class="doctor-footer">
                    <button class="btn btn-secondary" onclick="viewDoctorDetails(${doctor.id})">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn btn-primary" onclick="openBookingModal(${doctor.id})">
                        <i class="fas fa-calendar-plus"></i> Book
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Doctors
async function filterDoctors() {
    const specialization = document.getElementById('specializationFilter').value;
    const district = document.getElementById('districtFilter').value;
    const location = document.getElementById('locationFilter').value;
    
    let filtered = [...allDoctors];
    
    if (specialization) {
        filtered = filtered.filter(d => d.specialization === specialization);
    }
    
    if (location) {
        filtered = filtered.filter(d => d.location === location);
    }

    if (district) {
        filtered = filtered.filter(d => (d.district || getDistrictByVillage(d.location)) === district);
    }
    
    displayDoctors(filtered);
}

// Add Doctor Modal
function showAddDoctorModal() {
    document.getElementById('addDoctorModal').classList.add('active');
}

function closeAddDoctorModal() {
    document.getElementById('addDoctorModal').classList.remove('active');
    document.getElementById('addDoctorForm').reset();
    document.getElementById('doctorRating').value = '4.5';
    document.getElementById('doctorActive').value = '1';
}

async function handleAddDoctor(event) {
    event.preventDefault();

    const district = document.getElementById('doctorDistrict').value;
    const location = document.getElementById('doctorLocation').value.trim();

    if (!district) {
        showToast('Please select district', 'error');
        return;
    }

    if (!location) {
        showToast('Please enter village/location', 'error');
        return;
    }

    const doctorData = {
        name: document.getElementById('doctorName').value.trim(),
        specialization: document.getElementById('doctorSpecialization').value,
        district,
        location,
        contact_number: document.getElementById('doctorContact').value.trim(),
        fees: parseFloat(document.getElementById('doctorFees').value),
        available_days: document.getElementById('doctorDays').value.trim(),
        start_time: document.getElementById('doctorStartTime').value,
        end_time: document.getElementById('doctorEndTime').value,
        seat_capacity: parseInt(document.getElementById('doctorSeats').value, 10),
        experience: parseInt(document.getElementById('doctorExperience').value, 10),
        qualification: document.getElementById('doctorQualification').value.trim(),
        rating: parseFloat(document.getElementById('doctorRating').value),
        is_active: document.getElementById('doctorActive').value === '1'
    };

    const response = await apiCall('/api/doctors', 'POST', doctorData);

    if (!response) {
        showToast('Could not save doctor. Check backend.', 'error');
        return;
    }

    villageToDistrict[location] = district;
    refreshLocationControls();
    closeAddDoctorModal();
    await loadDoctors();
    showToast('Doctor added successfully');
}

// Search by Specialization from Landing Page
function searchBySpecialization(specialization) {
    showSection('search');
    document.getElementById('specializationFilter').value = specialization;
    filterDoctors();
}

// View Doctor Details
function viewDoctorDetails(doctorId) {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    alert(`
Doctor Details:
----------------
Name: ${doctor.name}
Specialization: ${doctor.specialization}
Location: ${doctor.location}
District: ${doctor.district || getDistrictByVillage(doctor.location)}
Contact: ${doctor.contact_number}
Fees: ₹${doctor.fees}
Qualification: ${doctor.qualification}
Experience: ${doctor.experience} years
Available Days: ${doctor.available_days}
Timing: ${doctor.start_time} - ${doctor.end_time}
Seat Capacity: ${doctor.seat_capacity}/day
Rating: ${doctor.rating} ⭐
    `.trim());
}

// Open Booking Modal
function openBookingModal(doctorId) {
    if (!currentUser) {
        showAuthModal('login');
        showToast('Please login to book an appointment', 'error');
        return;
    }
    
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    const summary = `
        <h4><i class="fas fa-user-md"></i> Doctor Summary</h4>
        <div class="booking-summary-detail">
            <span>Name:</span>
            <span>${doctor.name}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Specialization:</span>
            <span>${doctor.specialization}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Location:</span>
            <span>${doctor.location}, ${doctor.district || getDistrictByVillage(doctor.location)}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Fees:</span>
            <span>₹${doctor.fees}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Available Days:</span>
            <span>${doctor.available_days}</span>
        </div>
    `;
    
    document.getElementById('bookingSummary').innerHTML = summary;
    document.getElementById('bookingModal').classList.add('active');
    
    // Store current doctor for booking
    document.getElementById('bookingModal').dataset.doctorId = doctorId;
}

// Close Booking Modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.getElementById('bookingForm').reset();
    document.getElementById('availabilityInfo').innerHTML = '';
    document.getElementById('bookingBtn').disabled = true;
}

// Check Seat Availability
function checkAvailability() {
    const doctorId = parseInt(document.getElementById('bookingModal').dataset.doctorId);
    const bookingDate = document.getElementById('bookingDate').value;
    
    if (!doctorId || !bookingDate) return;
    
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    // Get booked seats count
    const bookedCount = allBookings.filter(b => 
        b.doctor_id === doctorId && 
        b.booking_date === bookingDate &&
        b.status !== 'cancelled'
    ).length;
    
    const availableSeats = doctor.seat_capacity - bookedCount;
    
    const availabilityHtml = `
        <div class="available-seats">
            <span>Available Seats: ${availableSeats} / ${doctor.seat_capacity}</span>
            <div class="seat-indicator">
                ${Array(doctor.seat_capacity).fill(0).map((_, i) => 
                    `<div class="seat ${i < availableSeats ? 'available' : 'booked'}"></div>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('availabilityInfo').innerHTML = availabilityHtml;
    
    const bookingBtn = document.getElementById('bookingBtn');
    if (availableSeats > 0) {
        bookingBtn.disabled = false;
        bookingBtn.textContent = `₹${doctor.fees} - Book & Get Token`;
    } else {
        bookingBtn.disabled = true;
        bookingBtn.textContent = 'No Seats Available';
    }
}

// Handle Booking
async function handleBooking(event) {
    event.preventDefault();
    
    const doctorId = parseInt(document.getElementById('bookingModal').dataset.doctorId);
    const bookingDate = document.getElementById('bookingDate').value;
    
    if (!doctorId || !bookingDate) return;
    
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    // Generate token number
    const existingTokens = allBookings
        .filter(b => b.doctor_id === doctorId && b.booking_date === bookingDate)
        .map(b => b.token_number);
    
    let newToken = 1;
    if (existingTokens.length > 0) {
        newToken = Math.max(...existingTokens) + 1;
    }
    
    const booking = {
        id: Date.now(),
        user_id: currentUser.id,
        user_name: currentUser.name,
        doctor_id: doctorId,
        doctor_name: doctor.name,
        specialization: doctor.specialization,
        location: doctor.location,
        contact_number: doctor.contact_number,
        booking_date: bookingDate,
        token_number: newToken,
        fees: doctor.fees,
        status: 'confirmed',
        created_at: new Date().toISOString()
    };
    
    // Try API call
    const response = await apiCall('/api/bookings', 'POST', {
        user_id: booking.user_id,
        doctor_id: booking.doctor_id,
        booking_date: booking.booking_date,
        token_number: booking.token_number,
        fees: booking.fees,
        status: booking.status
    });
    
    // Save booking locally
    const localBookings = JSON.parse(localStorage.getItem('graminBookings') || '[]');
    localBookings.push(booking);
    localStorage.setItem('graminBookings', JSON.stringify(localBookings));
    allBookings = localBookings;
    
    // Close booking modal and show token
    closeBookingModal();
    showTokenModal(booking);
    
    // Refresh bookings list
    loadUserBookings();
    
    showToast('Appointment booked successfully!');
}

// Show Token Modal
function showTokenModal(booking) {
    const tokenDisplay = `T${String(booking.token_number).padStart(3, '0')}`;
    
    document.getElementById('tokenNumber').textContent = tokenDisplay;
    document.getElementById('tokenDetails').innerHTML = `
        <div class="booking-summary-detail">
            <span>Doctor:</span>
            <span>${booking.doctor_name}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Date:</span>
            <span>${formatDate(booking.booking_date)}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Location:</span>
            <span>${booking.location}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Fees:</span>
            <span>₹${booking.fees}</span>
        </div>
        <div class="booking-summary-detail">
            <span>Contact:</span>
            <span>${booking.contact_number}</span>
        </div>
    `;
    
    document.getElementById('tokenModal').classList.add('active');
}

// Close Token Modal
function closeTokenModal() {
    document.getElementById('tokenModal').classList.remove('active');
}

// Load User Bookings
async function loadUserBookings() {
    if (!currentUser) return;
    
    const localBookings = JSON.parse(localStorage.getItem('graminBookings') || '[]');
    allBookings = localBookings.filter(b => b.user_id === currentUser.id);
    
    displayBookings(allBookings);
}

// Display Bookings
function displayBookings(bookings) {
    const list = document.getElementById('bookingsList');
    const noBookings = document.getElementById('noBookings');
    
    if (!list) return;
    
    if (bookings.length === 0) {
        list.style.display = 'none';
        noBookings.style.display = 'block';
        return;
    }
    
    list.style.display = 'block';
    noBookings.style.display = 'none';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    list.innerHTML = bookings.map(booking => {
        const bookingDate = new Date(booking.booking_date);
        const isPast = bookingDate < today;
        
        return `
            <div class="booking-card ${isPast ? 'past' : ''}">
                <div class="booking-header">
                    <div class="booking-token">#${String(booking.token_number).padStart(3, '0')}</div>
                    <div class="booking-status">${isPast ? 'Past Appointment' : 'Upcoming'}</div>
                </div>
                <div class="booking-body">
                    <div class="booking-details">
                        <div class="booking-detail">
                            <span class="booking-detail-label">Doctor</span>
                            <span class="booking-detail-value">${booking.doctor_name}</span>
                        </div>
                        <div class="booking-detail">
                            <span class="booking-detail-label">Specialization</span>
                            <span class="booking-detail-value">${booking.specialization}</span>
                        </div>
                        <div class="booking-detail">
                            <span class="booking-detail-label">Date</span>
                            <span class="booking-detail-value">${formatDate(booking.booking_date)}</span>
                        </div>
                        <div class="booking-detail">
                            <span class="booking-detail-label">Location</span>
                            <span class="booking-detail-value">${booking.location}</span>
                        </div>
                        <div class="booking-detail">
                            <span class="booking-detail-label">Contact</span>
                            <span class="booking-detail-value">${booking.contact_number}</span>
                        </div>
                        <div class="booking-detail">
                            <span class="booking-detail-label">Fees</span>
                            <span class="booking-detail-value">₹${booking.fees}</span>
                        </div>
                    </div>
                    ${!isPast ? `
                        <div class="booking-actions">
                            <button class="btn btn-secondary" onclick="cancelBooking(${booking.id})">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Cancel Booking
function cancelBooking(bookingId) {
    const index = allBookings.findIndex(b => b.id === bookingId);
    if (index === -1) return;
    
    if (confirm('Are you sure you want to cancel this booking?')) {
        allBookings[index].status = 'cancelled';
        
        const localBookings = JSON.parse(localStorage.getItem('graminBookings') || '[]');
        const localIndex = localBookings.findIndex(b => b.id === bookingId);
        if (localIndex !== -1) {
            localBookings[localIndex].status = 'cancelled';
            localStorage.setItem('graminBookings', JSON.stringify(localBookings));
        }
        
        loadUserBookings();
        showToast('Booking cancelled successfully');
    }
}

// AI Recommendation
async function getAIRecommendation() {
    const symptoms = document.getElementById('symptomsInput').value;
    const location = document.getElementById('locationSelectAI').value;
    
    if (!symptoms.trim()) {
        showToast('Please describe your symptoms', 'error');
        return;
    }
    
    // Try API call first
    const response = await apiCall(`/api/doctors/recommend?symptoms=${encodeURIComponent(symptoms)}${location ? `&location=${location}` : ''}`);
    
    if (response && response.recommendations) {
        displayAIRecommendations(response);
    } else {
        // Fallback to local ML-like recommendation
        const recommendations = localRecommend(symptoms, location);
        displayAIRecommendations(recommendations);
    }
}

// Local Recommendation (Fallback)
function localRecommend(symptoms, location) {
    const symptomMap = {
        'fever': ['General Physician', 'Pediatrician'],
        'cold': ['General Physician', 'Pediatrician'],
        'cough': ['General Physician', 'Pediatrician'],
        'headache': ['General Physician'],
        'child': ['Pediatrician'],
        'baby': ['Pediatrician'],
        'kid': ['Pediatrician'],
        'heart': ['Cardiologist'],
        'chest': ['Cardiologist'],
        'skin': ['Dermatologist'],
        'rash': ['Dermatologist'],
        'bone': ['Orthopedic'],
        'joint': ['Orthopedic'],
        'women': ['Gynecologist'],
        'pregnant': ['Gynecologist'],
        'tooth': ['Dentist'],
        'dental': ['Dentist'],
        'herbal': ['Ayurveda'],
        'natural': ['Ayurveda']
    };
    
    const symptomsLower = symptoms.toLowerCase();
    let matchedSpecializations = new Set(['General Physician']);
    
    for (const [keyword, specs] of Object.entries(symptomMap)) {
        if (symptomsLower.includes(keyword)) {
            specs.forEach(s => matchedSpecializations.add(s));
        }
    }
    
    let recommendedDoctors = allDoctors.filter(d => 
        matchedSpecializations.has(d.specialization)
    );
    
    if (location) {
        recommendedDoctors = recommendedDoctors.filter(d => d.location === location);
    }
    
    // Sort by rating
    recommendedDoctors.sort((a, b) => b.rating - a.rating);
    
    return {
        symptoms: symptoms,
        matched_specializations: Array.from(matchedSpecializations).map(s => ({ specialization: s, confidence: 0.9 })),
        recommendations: recommendedDoctors.slice(0, 5)
    };
}

// Display AI Recommendations
function displayAIRecommendations(result) {
    const container = document.getElementById('aiResults');
    
    const matchedSpecs = result.matched_specializations || 
                        (result.recommendations ? result.recommendations.map(r => r.specialization) : []);
    
    const doctors = result.recommendations || result.recommended_doctors || [];
    
    let html = `
        <div class="glass-card" style="padding: 1.5rem; margin-bottom: 1rem;">
            <h4 style="color: var(--primary-1); margin-bottom: 0.5rem;">
                <i class="fas fa-brain"></i> Analysis Results
            </h4>
            <p><strong>Symptoms:</strong> ${result.symptoms}</p>
            <p><strong>Suggested Specializations:</strong> ${matchedSpecs.map(s => 
                typeof s === 'string' ? s : s.specialization
            ).join(', ')}</p>
            <p><strong>${doctors.length} doctors found</strong></p>
        </div>
    `;
    
    doctors.forEach((doctor, index) => {
        html += `
            <div class="ai-match-card">
                <div class="ai-match-header">
                    <div>
                        <h3 style="margin-bottom: 0.25rem;">${doctor.name}</h3>
                        <span style="color: rgba(31, 41, 55, 0.7);">${doctor.specialization}</span>
                    </div>
                    <div class="ai-match-badge">${typeof doctor.match_score !== 'undefined' ? (doctor.match_score * 100).toFixed(0) + '% Match' : '⭐ ' + doctor.rating}</div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                    <span><i class="fas fa-map-marker-alt" style="color: var(--primary-1);"></i> ${doctor.location}</span>
                    <span><i class="fas fa-phone" style="color: var(--primary-1);"></i> ${doctor.contact_number}</span>
                    <span><i class="fas fa-rupee-sign" style="color: var(--primary-1);"></i> ${doctor.fees}</span>
                    <span><i class="fas fa-briefcase" style="color: var(--primary-1);"></i> ${doctor.experience} yrs</span>
                </div>
                ${doctor.recommendation_reason ? `
                    <p class="ai-match-reason">${doctor.recommendation_reason}</p>
                ` : ''}
                <button class="btn btn-primary btn-full" onclick="openBookingModal(${doctor.id})">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Authentication
function showAuthModal(mode = 'login') {
    document.getElementById('authModal').classList.add('active');
    
    if (mode === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('authModalTitle').textContent = 'Login';
        document.getElementById('authSwitchText').textContent = "Don't have an account?";
        document.getElementById('authSwitchBtn').textContent = 'Register';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'Register';
        document.getElementById('authSwitchText').textContent = 'Already have an account?';
        document.getElementById('authSwitchBtn').textContent = 'Login';
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function toggleAuthMode() {
    const isLogin = document.getElementById('loginForm').style.display === 'block';
    showAuthModal(isLogin ? 'register' : 'login');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Try API
    const response = await apiCall('/api/auth/login', 'POST', { email, password });
    
    if (response && response.user) {
        currentUser = response.user;
    } else {
        // Fallback to local
        const localUsers = JSON.parse(localStorage.getItem('graminUsers') || '[]');
        const hashedPassword = simpleHash(password);
        currentUser = localUsers.find(u => u.email === email && u.password === hashedPassword);
    }
    
    if (currentUser) {
        localStorage.setItem('graminUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        showToast('Login successful!');
        loadUserBookings();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const district = document.getElementById('registerDistrict').value;
    const village = document.getElementById('registerVillage').value.trim();

    if (!district) {
        showToast('Please select district', 'error');
        return;
    }

    if (!village) {
        showToast('Please enter village', 'error');
        return;
    }
    
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        phone: document.getElementById('registerPhone').value,
        age: parseInt(document.getElementById('registerAge').value),
        district,
        village,
        password: document.getElementById('registerPassword').value
    };
    
    // Try API
    const response = await apiCall('/api/auth/register', 'POST', userData);
    
    if (response && response.user_id) {
        userData.id = response.user_id;
    } else {
        // Fallback to local
        const localUsers = JSON.parse(localStorage.getItem('graminUsers') || '[]');
        
        if (localUsers.some(u => u.email === userData.email)) {
            showToast('Email already registered', 'error');
            return;
        }
        
        userData.id = Date.now();
        userData.password = simpleHash(userData.password);
        localUsers.push(userData);
        localStorage.setItem('graminUsers', JSON.stringify(localUsers));
    }
    
    currentUser = userData;
    localStorage.setItem('graminUser', JSON.stringify(currentUser));
    
    updateAuthUI();
    closeAuthModal();
    showToast('Registration successful!');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('graminUser');
    updateAuthUI();
    allBookings = [];
    displayBookings([]);
    showToast('Logged out successfully');
}

function updateAuthUI() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        userName.textContent = currentUser.name;
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
    }
}

// Simple Hash Function (for demo)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = 'toast active';
    if (type === 'error') {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
});