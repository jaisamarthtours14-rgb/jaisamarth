// ===== GOOGLE SHEETS URL - PASTE YOUR APPS SCRIPT URL HERE =====
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwQiUvfc-iBjtBFvVoSIvV26X96hTSco0bhiVtSdz-3bPamfE500IVtTda22ZBALgzO/exec';

// ===== BOOKINGS STORAGE =====
let bookings = JSON.parse(localStorage.getItem('jst_bookings') || '[]');

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
    scrollTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    scrollTop.classList.remove('visible');
  }
});

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ===== MOBILE MENU =====
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

// ===== HERO SLIDER =====
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = n;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

setInterval(() => {
  goToSlide((currentSlide + 1) % slides.length);
}, 5000);

// ===== STATS COUNTER =====
function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-number').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) statsObserver.observe(statsStrip);

// ===== SCROLL ANIMATIONS =====
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .fleet-card, .dest-card, .why-card, .contact-card, .testimonial-card, .about-content, .about-images').forEach(el => {
  el.classList.add('animate-on-scroll');
  animObserver.observe(el);
});

// ===== TESTIMONIALS SLIDER =====
let testiIndex = 0;
const track = document.getElementById('testimonialTrack');
const cards = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('testiDots');
let cardsPerView = window.innerWidth <= 768 ? 1 : 3;

function buildTestiDots() {
  dotsContainer.innerHTML = '';
  const total = Math.ceil(cards.length / cardsPerView);
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goToTesti(i);
    dotsContainer.appendChild(d);
  }
}

function goToTesti(n) {
  const total = Math.ceil(cards.length / cardsPerView);
  testiIndex = (n + total) % total;
  const cardWidth = cards[0].offsetWidth + 28;
  track.style.transform = `translateX(-${testiIndex * cardsPerView * cardWidth}px)`;
  document.querySelectorAll('.testi-dot').forEach((d, i) => {
    d.classList.toggle('active', i === testiIndex);
  });
}

function nextTestimonial() { goToTesti(testiIndex + 1); }
function prevTestimonial() { goToTesti(testiIndex - 1); }

buildTestiDots();
setInterval(() => nextTestimonial(), 4000);

window.addEventListener('resize', () => {
  cardsPerView = window.innerWidth <= 768 ? 1 : 3;
  buildTestiDots();
  goToTesti(0);
});

// ===== SET MIN DATE =====
const travelDateInput = document.getElementById('travelDate');
if (travelDateInput) {
  const today = new Date().toISOString().split('T')[0];
  travelDateInput.min = today;
}

// ===== BOOKING FORM =====
function handleBooking(e) {
  e.preventDefault();

  const booking = {
    id: 'JST-' + Date.now(),
    submittedAt: new Date().toLocaleString('en-IN'),
    fullName: document.getElementById('fullName').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    email: document.getElementById('email').value.trim() || 'N/A',
    vehicleType: document.getElementById('vehicleType').value,
    pickup: document.getElementById('pickup').value.trim(),
    drop: document.getElementById('drop').value.trim(),
    travelDate: document.getElementById('travelDate').value,
    pickupTime: document.getElementById('pickupTime').value,
    passengers: document.getElementById('passengers').value,
    tripType: document.getElementById('tripType').value,
    requirements: document.getElementById('requirements').value.trim() || 'None',
    status: 'Pending'
  };

  bookings.push(booking);
  localStorage.setItem('jst_bookings', JSON.stringify(bookings));

  document.getElementById('modalDetails').innerHTML = `
    <strong>Booking ID:</strong> ${booking.id}<br>
    <strong>Name:</strong> ${booking.fullName}<br>
    <strong>Mobile:</strong> ${booking.mobile}<br>
    <strong>Vehicle:</strong> ${booking.vehicleType}<br>
    <strong>From:</strong> ${booking.pickup}<br>
    <strong>To:</strong> ${booking.drop}<br>
    <strong>Date:</strong> ${booking.travelDate} at ${booking.pickupTime}<br>
    <strong>Passengers:</strong> ${booking.passengers}<br>
    <strong>Trip Type:</strong> ${booking.tripType}
  `;

  document.getElementById('successModal').classList.add('active');
  document.getElementById('bookingForm').reset();
  document.getElementById('downloadBtn').style.display = 'flex';

  // ===== SEND TO GOOGLE SHEETS =====
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
    const params = new URLSearchParams({
      id: booking.id,
      submittedAt: booking.submittedAt,
      fullName: booking.fullName,
      mobile: booking.mobile,
      email: booking.email,
      vehicleType: booking.vehicleType,
      pickup: booking.pickup,
      drop: booking.drop,
      travelDate: booking.travelDate,
      pickupTime: booking.pickupTime,
      passengers: booking.passengers,
      tripType: booking.tripType,
      requirements: booking.requirements,
      status: booking.status
    });
    fetch(GOOGLE_SHEET_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' })
      .catch(() => {});
  }
}

function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}

document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== DOWNLOAD EXCEL =====
function downloadBookings() {
  if (bookings.length === 0) {
    alert('No bookings found yet. Please submit a booking first.');
    return;
  }

  const headers = [
    'Booking ID', 'Submitted At', 'Full Name', 'Mobile', 'Email',
    'Vehicle Type', 'Pickup Location', 'Drop Location',
    'Travel Date', 'Pickup Time', 'Passengers', 'Trip Type',
    'Special Requirements', 'Status'
  ];

  const rows = bookings.map(b => [
    b.id, b.submittedAt, b.fullName, b.mobile, b.email,
    b.vehicleType, b.pickup, b.drop,
    b.travelDate, b.pickupTime, b.passengers, b.tripType,
    b.requirements, b.status
  ]);

  const wsData = [headers, ...rows];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = headers.map((h, i) => ({
    wch: Math.max(h.length, ...rows.map(r => String(r[i] || '').length)) + 4
  }));

  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'FF6B35' } },
        alignment: { horizontal: 'center' }
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  XLSX.writeFile(wb, `JaiSamarth_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ===== SHOW DOWNLOAD BTN IF BOOKINGS EXIST =====
if (bookings.length > 0) {
  const btn = document.getElementById('downloadBtn');
  if (btn) btn.style.display = 'flex';
}

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});
