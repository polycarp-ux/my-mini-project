// Global variables
let map;
let markers = [];
let userLocationMarker = null;
let infoWindows = [];
let currentVenueId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const venueCard = this.closest('.venue-card');
            currentVenueId = venueCard.getAttribute('data-id');
            openVenueModal(currentVenueId);
        });
    });

    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('locate-me').addEventListener('click', locateUser);
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('venue-modal')) {
            closeModal();
        }
    });
});

// Initialize Google Map
function initMap() {
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        styles: [
            { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] }
        ]
    });
    addVenueMarkers();
    map.addListener('click', function() {
        infoWindows.forEach(window => window.close());
    });
}

// Add markers for all venues on the map
function addVenueMarkers() {
    clearMarkers();
    document.querySelectorAll('.venue-card').forEach(card => {
        const venueId = card.getAttribute('data-id');
        const lat = parseFloat(card.getAttribute('data-lat'));
        const lng = parseFloat(card.getAttribute('data-lng'));
        const venueName = card.querySelector('h3').textContent;
        const venueAddress = card.querySelector('.venue-location').textContent.replace('📍', '').trim();

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: venueName
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h3>${venueName}</h3>
                    <p>${venueAddress}</p>
                    <button onclick="openVenueModalFromMap('${venueId}')" class="map-view-btn">View Details</button>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindows.forEach(window => window.close());
            infoWindow.open(map, marker);
            highlightVenueCard(venueId);
        });

        markers.push(marker);
        infoWindows.push(infoWindow);
    });
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    infoWindows = [];
}

// Highlight venue card when marker is clicked
function highlightVenueCard(venueId) {
    document.querySelectorAll('.venue-card').forEach(card => {
        card.style.boxShadow = card.getAttribute('data-id') === venueId ?
            '0 0 0 3px rgba(110, 72, 170, 0.5)' :
            '0 2px 10px rgba(0, 0, 0, 0.1)';
    });
}

// Open venue modal from card click
function openVenueModal(venueId) {
    const venueCard = document.querySelector(`.venue-card[data-id="${venueId}"]`);
    if (!venueCard) return;

    const venueName = venueCard.querySelector('h3').textContent;
    const venueAddress = venueCard.querySelector('.venue-location').textContent.replace('📍', '').trim();
    const venueCapacity = venueCard.querySelector('.venue-capacity').textContent.replace('👥', '').trim();
    const venuePrice = venueCard.querySelector('.venue-price').textContent;
    const venueImage = venueCard.querySelector('.venue-image img').src;

    const features = [];
    venueCard.querySelectorAll('.venue-features span').forEach(feature => {
        features.push(feature.textContent);
    });

    document.getElementById('venue-modal-title').textContent = venueName;
    document.getElementById('venue-modal-address').textContent = venueAddress;

    let description = '';
    if (venueId === '1') {
        description = 'Luxurious hotel with state-of-the-art conference facilities and ballrooms suitable for weddings and corporate events. Our elegant spaces can be customized to fit your needs, with professional event planning services available.';
    } else if (venueId === '2') {
        description = 'Charming guest house perfect for intimate gatherings, small weddings, and family reunions. Features a cozy atmosphere with personalized service and beautiful outdoor spaces for your event.';
    } else if (venueId === '3') {
        description = 'Modern convention center with flexible spaces for trade shows, conferences, and large-scale events. Offers full technical support, catering services, and professional event staff.';
    } else if (venueId === '4') {
        description = 'Beautiful outdoor venue with manicured gardens, perfect for weddings and summer parties. Features a romantic gazebo, fountain, and multiple photo opportunities throughout the property.';
    } else if (venueId === '5') {
        description = 'Elegant waterfront hotel with stunning views and versatile event spaces. Perfect for weddings with ocean views or corporate retreats with premium amenities.';
    } else if (venueId === '6') {
        description = 'Industrial-chic loft spaces perfect for modern weddings, art shows, and corporate events. Features exposed brick, high ceilings, and customizable lighting options.';
    }
    document.getElementById('venue-description').textContent = description;

    const gallery = document.getElementById('venue-gallery');
    gallery.innerHTML = '';
    const img = document.createElement('img');
    img.src = venueImage;
    img.alt = venueName;
    gallery.appendChild(img);

    if (venueId === '1') {
        const img2 = document.createElement('img');
        img2.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        img2.alt = venueName;
        gallery.appendChild(img2);
    } else if (venueId === '2') {
        const img2 = document.createElement('img');
        img2.src = 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        img2.alt = venueName;
        gallery.appendChild(img2);
    }

    const featuresContainer = document.getElementById('venue-features');
    featuresContainer.innerHTML = '';
    features.forEach(feature => {
        const span = document.createElement('span');
        span.innerHTML = feature;
        featuresContainer.appendChild(span);
    });

    document.getElementById('venue-modal').style.display = 'block';

    const lat = parseFloat(venueCard.getAttribute('data-lat'));
    const lng = parseFloat(venueCard.getAttribute('data-lng'));
    map.panTo({ lat, lng });

    markers.forEach((marker, index) => {
        if (marker.getTitle() === venueName) {
            infoWindows[index].open(map, marker);
        }
    });
}

// Open venue modal from map click
function openVenueModalFromMap(venueId) {
    openVenueModal(venueId);
}

// Close modal
function closeModal() {
    document.getElementById('venue-modal').style.display = 'none';
}

// Locate the user
function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (userLocationMarker) {
                    userLocationMarker.setMap(null);
                }
                userLocationMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: 'white'
                    }
                });
                map.panTo(userLocation);
                findNearbyVenues(userLocation);
            },
            error => {
                alert('Unable to get your location: ' + error.message);
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Find venues near user location
function findNearbyVenues(userLocation) {
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: userLocation,
        radius: 5000,
        type: 'event_venue',
        keyword: 'event space, wedding venue, conference center'
    }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                if (place.geometry && place.geometry.location) {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name
                    });
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div class="map-info-window">
                                <h3>${place.name}</h3>
                                <p>${place.vicinity || ''}</p>
                                <p>Rating: ${place.rating || 'Not rated'}</p>
                            </div>
                        `
                    });
                    marker.addListener('click', () => {
                        infoWindows.forEach(window => window.close());
                        infoWindow.open(map, marker);
                    });
                    markers.push(marker);
                    infoWindows.push(infoWindow);
                }
            });
        }
    });
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();

    const formData = {
        venueId: currentVenueId,
        eventName: document.getElementById('event-name').value,
        eventDate: document.getElementById('event-date').value,
        guestCount: document.getElementById('guest-count').value,
        eventType: document.getElementById('event-type').value,
        contactName: document.getElementById('contact-name').value,
        contactEmail: document.getElementById('contact-email').value,
        contactPhone: document.getElementById('contact-phone').value,
        specialRequests: document.getElementById('special-requests').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Thank you, ${formData.contactName}! Your booking request for ${formData.venueName} has been submitted.`);
            document.getElementById('booking-form').reset();
            closeModal();
        } else {
            alert(`Failed to submit booking: ${result.message}`);
            console.error('Backend error:', result.details);
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('An error occurred while submitting the booking. Please check your backend server.');
    }
}