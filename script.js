document.addEventListener('DOMContentLoaded', () => {
  // Mock tracking data
  const mockTrackingData = {
    'NX123456': {
      shipmentType: 'truck',
      status: 'In Transit',
      currentLocation: 'Chicago Hub',
      pickup: 'New York, NY - July 15, 2025',
      pickupDetails: 'Loaded at New York port, 40ft container',
      statusDetails: 'In transit to Chicago hub',
      eta: 'July 20, 2025, 14:00',
      deliveryDate: 'Los Angeles, CA - July 20, 2025',
      deliveryDetails: 'Awaiting final delivery confirmation',
      progress: 50,
      cargo: 'Industrial Machinery (40ft Container, 20t)',
      driver: 'John Doe, License #XYZ123',
      distance: '500km',
      co2: '0.8t'
    },
    'NX654321': {
      shipmentType: 'ship',
      status: 'At Port',
      currentLocation: 'Shanghai Port',
      pickup: 'Tokyo, Japan - July 10, 2025',
      pickupDetails: 'Loaded at Tokyo port, 20ft container',
      statusDetails: 'Awaiting customs clearance',
      eta: 'July 22, 2025, 09:00',
      deliveryDate: 'Singapore - July 22, 2025',
      deliveryDetails: 'Scheduled for unloading',
      progress: 30,
      cargo: 'Electronics (20ft Container, 15t)',
      driver: 'N/A',
      distance: '1200km',
      co2: '1.2t'
    },
    'NX987654': {
      shipmentType: 'air',
      status: 'In Flight',
      currentLocation: 'En Route to Dubai',
      pickup: 'London, UK - July 17, 2025',
      pickupDetails: 'Loaded at Heathrow Airport',
      statusDetails: 'Flight EK202, cruising at 35,000ft',
      eta: 'July 18, 2025, 22:00',
      deliveryDate: 'Dubai, UAE - July 18, 2025',
      deliveryDetails: 'Awaiting landing and customs',
      progress: 70,
      cargo: 'Pharmaceuticals (10 pallets, 5t)',
      driver: 'N/A',
      distance: '5500km',
      co2: '2.5t'
    }
  };

  // DOM elements
  const trackingInput = document.querySelector('#tracking-number');
  const shipmentType = document.querySelector('#shipment-type');
  const trackButton = document.querySelector('#track-button');
  const trackButtonText = document.querySelector('#track-button-text');
  const trackButtonSpinner = document.querySelector('#track-button-spinner');
  const refreshButton = document.querySelector('#refresh-button');
  const shareButton = document.querySelector('#share-button');
  const trackingResults = document.querySelector('#tracking-results');
  const trackingError = document.querySelector('#tracking-error');
  const trackingStatus = document.querySelector('#tracking-status');
  const trackingLocation = document.querySelector('#tracking-location');
  const trackingPickup = document.querySelector('#tracking-pickup');
  const trackingDelivery = document.querySelector('#tracking-delivery');
  const pickupDetails = document.querySelector('#pickup-details');
  const statusDetails = document.querySelector('#status-details');
  const deliveryDetails = document.querySelector('#delivery-details');
  const pickupDetailsToggle = document.querySelector('#pickup-details-toggle');
  const statusDetailsToggle = document.querySelector('#status-details-toggle');
  const deliveryDetailsToggle = document.querySelector('#delivery-details-toggle');
  const milestonePickup = document.querySelector('#pickup-badge');
  const milestoneTransit = document.querySelector('#status-badge');
  const milestoneDelivery = document.querySelector('#delivery-badge');
  const shipmentIcon = document.querySelector('#shipment-icon');
  const progressPath = document.querySelector('#progress-path');
  const progressVehicle = document.querySelector('#progress-vehicle');
  const mapProgressPath = document.querySelector('#map-progress-path');
  const mapVehicle = document.querySelector('#map-vehicle');
  const progressText = document.querySelector('#progress-text');
  const toggleMapButton = document.querySelector('#toggle-map');
  const progressView = document.querySelector('#progress-view');
  const mapView = document.querySelector('#map-view');
  const navbar = document.querySelector('nav');
  const languageToggle = document.querySelector('#languageToggle');
  const mobileLanguageToggle = document.querySelector('#mobileLanguageToggle');

  let etaInterval;

  // Update ETA ticker
  function updateETA(trackingNumber) {
    const etaTicker = document.querySelector('.eta-ticker');
    if (etaTicker && mockTrackingData[trackingNumber]) {
      etaTicker.textContent = mockTrackingData[trackingNumber].eta;
    }
  }

  // Toggle map/progress view
  function toggleMapView() {
    const isMapView = mapView.classList.contains('block');
    mapView.classList.toggle('hidden', isMapView);
    mapView.classList.toggle('block', !isMapView);
    progressView.classList.toggle('hidden', !isMapView);
    progressView.classList.toggle('block', isMapView);
    toggleMapButton.textContent = isMapView ? 'Show Map' : 'Show Progress';
    toggleMapButton.setAttribute('aria-label', isMapView ? 'Show route progress' : 'Show route map');
  }

  // Generate share link
  function generateShareLink(trackingNumber) {
    const shareLink = `https://nexavion.com/track/${trackingNumber}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      shareButton.textContent = 'Link Copied!';
      setTimeout(() => {
        shareButton.textContent = 'Share Tracking';
      }, 2000);
    });
  }

  // Track and Refresh Handler
  function handleTracking() {
    const trackingNumber = trackingInput.value.trim();
    const effectiveShipmentType = shipmentType.value;
    clearInterval(etaInterval);
    trackingResults.classList.add('hidden');
    trackingError.classList.add('hidden');
    trackButton.disabled = true;
    trackButton.setAttribute('aria-busy', 'true');
    trackButtonText.classList.add('hidden');
    trackButtonSpinner.classList.remove('hidden');
    refreshButton.classList.add('hidden');
    shareButton.classList.add('hidden');

    // Reset UI
    milestonePickup.className = 'status-badge bg-emerald text-titanium-white px-2 py-1 rounded ml-2';
    milestoneTransit.className = 'status-badge bg-amber text-titanium-white px-2 py-1 rounded ml-2';
    milestoneDelivery.className = 'status-badge bg-gray-500 text-titanium-white px-2 py-1 rounded ml-2';
    progressPath.style.strokeDashoffset = '300';
    progressVehicle.style.transform = 'translate(20, 60)';
    mapProgressPath.style.strokeDashoffset = '300';
    mapVehicle.style.transform = 'translate(20, 100)';
    progressText.textContent = '0%';
    pickupDetails.classList.add('hidden');
    statusDetails.classList.add('hidden');
    deliveryDetails.classList.add('hidden');
    pickupDetailsToggle.setAttribute('aria-expanded', 'false');
    statusDetailsToggle.setAttribute('aria-expanded', 'false');
    deliveryDetailsToggle.setAttribute('aria-expanded', 'false');
    trackingStatus.textContent = '';
    trackingLocation.textContent = '';
    trackingPickup.textContent = '';
    trackingDelivery.textContent = '';
    pickupDetails.textContent = '';
    statusDetails.innerHTML = '';
    deliveryDetails.textContent = '';
    trackingError.textContent = '';

    // Validate tracking number
    const trackingRegex = /^NX\d{6}$/;
    if (!trackingNumber || !trackingRegex.test(trackingNumber)) {
      trackingInput.classList.add('animate-shake');
      setTimeout(() => trackingInput.classList.remove('animate-shake'), 300);
      trackingResults.classList.remove('hidden');
      trackingError.classList.remove('hidden');
      trackingError.textContent = 'Please enter a valid tracking number (e.g., NX123456).';
      trackButton.disabled = false;
      trackButton.setAttribute('aria-busy', 'false');
      trackButtonText.classList.remove('hidden');
      trackButtonSpinner.classList.add('hidden');
      return;
    }

    trackingResults.classList.remove('hidden');

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (mockTrackingData[trackingNumber] && mockTrackingData[trackingNumber].shipmentType === effectiveShipmentType) {
          const data = mockTrackingData[trackingNumber];
          trackingStatus.textContent = `${data.status} (${data.shipmentType.toUpperCase()})`;
          trackingLocation.textContent = `Current Location: ${data.currentLocation}`;
          trackingPickup.textContent = data.pickup;
          trackingDelivery.textContent = data.deliveryDate;
          pickupDetails.textContent = data.pickupDetails;
          statusDetails.innerHTML = `${data.statusDetails} | ETA: <span class="eta-ticker">${data.eta}</span>`;
          deliveryDetails.textContent = data.deliveryDetails;
          document.querySelector('#tracking-cargo').textContent = `Cargo: ${data.cargo}`;
          document.querySelector('#tracking-driver').textContent = `Driver: ${data.driver}`;
          document.querySelector('#tracking-distance').textContent = `Distance: ${data.distance}`;
          document.querySelector('#tracking-co2').textContent = `CO2 Emissions: ${data.co2}`;
          milestonePickup.setAttribute('data-tooltip', 'Loaded at origin');
          milestoneTransit.setAttribute('data-tooltip', data.statusDetails);
          milestoneDelivery.setAttribute('data-tooltip', 'Awaiting delivery');
          milestonePickup.classList.add('bg-emerald');
          milestoneTransit.classList.toggle('bg-amber', data.progress >= 50);
          milestoneDelivery.classList.toggle('bg-emerald', data.progress >= 100);
          shipmentIcon.innerHTML = data.shipmentType === 'truck' ?
            '<path d="M18 7h-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v1H2v6h2v7a1 1 0 001 1h6a1 1 0 001-1v-2h4v2a1 1 0 001 1h2a1 1 0 001-1v-7h2V7h-2z"/>' :
            data.shipmentType === 'ship' ?
            '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z"/>' :
            '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-2h4v2h-4zm0-4.5V9h4v3h-4zm0-4.5V5h4v2h-4z"/>';
          requestAnimationFrame(() => {
            const offset = 300 - (data.progress / 100) * 300;
            const translateX = (data.progress / 100) * 260 + 20;
            const rotation = data.progress > 0 && data.progress < 100 ? 'rotate(5deg)' : 'rotate(0deg)';
            progressPath.style.strokeDashoffset = offset;
            progressVehicle.style.transform = `translate(${translateX}, 60) ${rotation}`;
            mapProgressPath.style.strokeDashoffset = offset;
            mapVehicle.style.transform = `translate(${translateX}, 100) ${rotation}`;
            progressText.textContent = `${data.progress}%`;
          });
          etaInterval = setInterval(() => updateETA(trackingNumber), 10000);
          refreshButton.classList.remove('hidden');
          shareButton.classList.remove('hidden');
        } else {
          trackingInput.classList.add('animate-shake');
          setTimeout(() => trackingInput.classList.remove('animate-shake'), 300);
          trackingError.classList.remove('hidden');
          trackingError.textContent = 'Invalid tracking number or shipment type. Please try again.';
        }
        trackButton.disabled = false;
        trackButton.setAttribute('aria-busy', 'false');
        trackButtonText.classList.remove('hidden');
        trackButtonSpinner.classList.add('hidden');
      }, 150);
    });
  }

  // Toggle Details
  function toggleDetails(toggle, details) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    toggle.textContent = isExpanded ? 'Show Details' : 'Hide Details';
    details.classList.toggle('hidden', isExpanded);
  }

  // Navbar and Hero
  const hamburger = document.querySelector('#hamburger');
  const mobileMenu = document.querySelector('#mobileMenu');
  const closeMenu = document.querySelector('#closeMenu');
  const headlines = document.querySelectorAll('.headline');
  let currentHeadlineIndex = 0;

  function toggleMenu() {
    mobileMenu.classList.toggle('hidden'); // Simple display toggle
  }

  hamburger.addEventListener('click', toggleMenu);
  closeMenu.addEventListener('click', toggleMenu);

  function cycleHeadlines() {
    headlines[currentHeadlineIndex].classList.remove('active');
    currentHeadlineIndex = (currentHeadlineIndex + 1) % headlines.length;
    headlines[currentHeadlineIndex].classList.add('active');
  }

  headlines[currentHeadlineIndex].classList.add('active');
  setInterval(cycleHeadlines, 4000);

  // Remove navbar scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.remove('bg-opacity-90', 'backdrop-blur-md'); // Static navbar
  });

  // Language toggle synchronization
  function syncLanguageToggles() {
    const selectedLang = languageToggle.value;
    mobileLanguageToggle.value = selectedLang;
  }

  languageToggle.addEventListener('change', syncLanguageToggles);
  mobileLanguageToggle.addEventListener('change', () => {
    languageToggle.value = mobileLanguageToggle.value;
  });

  // Particle Animation
  const canvas = document.querySelector('#particleCanvas');
  const ctx = canvas.getContext('2d');
  let particlesArray = [];

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.size > 0.2) this.size -= 0.05;
      if (this.opacity > 0) this.opacity -= 0.002;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 211, 238, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / (window.innerWidth < 640 ? 12000 : 9000));
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
  });

  resizeCanvas();

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
      if (particlesArray[i].size <= 0.2 || particlesArray[i].opacity <= 0) {
        particlesArray.splice(i, 1);
        i--;
        particlesArray.push(new Particle());
      }
    }
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  // Event Listeners
  pickupDetailsToggle.addEventListener('click', () => toggleDetails(pickupDetailsToggle, pickupDetails));
  statusDetailsToggle.addEventListener('click', () => toggleDetails(statusDetailsToggle, statusDetails));
  deliveryDetailsToggle.addEventListener('click', () => toggleDetails(deliveryDetailsToggle, deliveryDetails));
  trackButton.addEventListener('click', handleTracking);
  refreshButton.addEventListener('click', handleTracking);
  shareButton.addEventListener('click', () => generateShareLink(trackingInput.value.trim()));
  toggleMapButton.addEventListener('click', toggleMapView);
});