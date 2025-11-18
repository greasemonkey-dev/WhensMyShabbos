// MapTiler API Key - Replace with your own key from https://cloud.maptiler.com/
const MAPTILER_API_KEY = 'IOegHViiczZRkx2lZpbB';

// Suppress MapLibre warnings caused by ad blockers
const originalConsoleError = console.error;
console.error = function(...args) {
    const message = args[0]?.toString() || '';
    // Filter out known ad blocker-related warnings
    if (message.includes('could not be loaded') ||
        message.includes('styleimagemissing') ||
        message.includes('Fetch failed')) {
        return; // Silently ignore
    }
    originalConsoleError.apply(console, args);
};

// Initialize map
let map;
let userMarker;

// Initialize the application
async function init() {
    // Check if API key is set
    if (MAPTILER_API_KEY === 'YOUR_MAPTILER_API_KEY_HERE') {
        showError('Please set your MapTiler API key in main.js');
        return;
    }

    // Initialize map with world view for dramatic zoom effect
    map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS, // No white Glacier layer
        center: [0, 20], // Center of world
        zoom: 1.5, // World view
        apiKey: MAPTILER_API_KEY,
        pitch: 0, // Start flat
        bearing: 0
    });

    // Handle missing sprite images by creating a blank placeholder
    // This fixes issues with ad blockers blocking map sprites
    map.on('styleimagemissing', (e) => {
        const missingImageId = e.id;

        // Skip if ID is invalid (empty, whitespace, etc.)
        if (!missingImageId || missingImageId.trim() === '') {
            return;
        }

        // Create a blank 1x1 transparent image as placeholder
        const width = 1;
        const height = 1;
        const data = new Uint8Array(width * height * 4);

        // Add the missing image to prevent errors
        try {
            if (!map.hasImage(missingImageId)) {
                map.addImage(missingImageId, { width, height, data });
            }
        } catch (error) {
            // Silently ignore - some IDs can't be added
        }
    });

    // Wait for map to load before getting user location
    map.on('load', () => {
        getUserLocation();
    });

    // Add click event to map
    map.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        await updateShabbosInfo(lat, lng);
        updateMarker(lat, lng);
    });
}

// Get user's current location
function getUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Beautiful smooth zoom animation from world view to user location
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 14,
                    speed: 0.8, // Slower, more dramatic zoom
                    curve: 1.5, // More curved path for cinematic effect
                    duration: 3500, // 3.5 seconds for smooth animation
                    essential: true,
                    pitch: 45, // Add tilt for 3D effect
                    bearing: 0
                });

                // Wait a moment before adding marker for better visual flow
                setTimeout(() => {
                    updateMarker(latitude, longitude);
                }, 2000);

                // Fetch Shabbos times while animation is happening
                await updateShabbosInfo(latitude, longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                showError('Unable to detect location. Please click on the map to select a location.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser. Please click on the map to select a location.');
    }
}

// Update or create marker on map
function updateMarker(lat, lng) {
    if (userMarker) {
        userMarker.remove();
    }

    // Create a custom pulsing marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `
        <div class="marker-pulse"></div>
        <div class="marker-pin">📍</div>
    `;

    userMarker = new maptilersdk.Marker({
        element: markerElement,
        anchor: 'bottom'
    })
        .setLngLat([lng, lat])
        .addTo(map);
}

// Fetch and display Shabbos information
async function updateShabbosInfo(lat, lng) {
    showLoading();

    try {
        // Get location name using reverse geocoding
        const locationName = await getLocationName(lat, lng);

        // Get Shabbos times from HebCal API
        const shabbosData = await getShabbosTimesFromHebCal(lat, lng);

        // Display the information
        displayShabbosInfo(locationName, shabbosData);
    } catch (error) {
        console.error('Error fetching Shabbos info:', error);
        showError(`Unable to fetch Shabbos times: ${error.message}. Please check the browser console for details.`);
    }
}

// Get location name from coordinates using MapTiler geocoding
async function getLocationName(lat, lng) {
    try {
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];

            // Extract city and country from the place_name
            // The place_name format is typically: "Street, City, State, Country"
            // We want just "City, Country" or "City, State, Country"
            const placeName = feature.place_name || '';
            const parts = placeName.split(',').map(p => p.trim());

            // Skip the first part (street/address) and take city onwards
            // Usually: [street, city, region/state, country]
            if (parts.length > 2) {
                // Return city, region, country (skip street address)
                return parts.slice(1).join(', ');
            } else if (parts.length > 1) {
                // Return everything except first part
                return parts.slice(1).join(', ');
            }

            return placeName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Error getting location name:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// Get Shabbos times from HebCal API
async function getShabbosTimesFromHebCal(lat, lng) {
    // Don't use tzid=auto - HebCal will auto-detect timezone from coordinates
    const url = `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}`;

    console.log('Fetching Shabbos times from:', url);

    let response;
    try {
        response = await fetch(url, {
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
    } catch (fetchError) {
        console.error('Fetch error (likely CORS or network issue):', fetchError);
        throw new Error(`Network error fetching Shabbos times. This may be due to CORS restrictions. Try opening the app via a web server (npm start) instead of file://.`);
    }

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('HebCal API error:', errorText);
        throw new Error(`Failed to fetch Shabbos times: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('HebCal API response:', data);

    // Validate response has items
    if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response from HebCal API: missing items array');
    }

    if (data.items.length === 0) {
        throw new Error('No Shabbos times found for this location');
    }

    // Parse the response
    let candleLighting = null;
    let havdalah = null;
    let parsha = null;
    let shabbosDate = null;

    data.items.forEach(item => {
        if (item.category === 'candles') {
            candleLighting = new Date(item.date);
        } else if (item.category === 'havdalah') {
            havdalah = new Date(item.date);
        } else if (item.category === 'parashat') {
            parsha = item.title;
            shabbosDate = new Date(item.date);
        }
    });

    return {
        candleLighting,
        havdalah,
        parsha,
        shabbosDate,
        location: data.location
    };
}

// Display Shabbos information
function displayShabbosInfo(locationName, shabbosData) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    const shabbosInfo = document.getElementById('shabbos-info');
    shabbosInfo.classList.remove('hidden');

    document.getElementById('location-name').textContent = locationName;

    if (shabbosData.candleLighting) {
        document.getElementById('candle-time').textContent = formatTime(shabbosData.candleLighting);
    } else {
        document.getElementById('candle-time').textContent = 'N/A';
    }

    if (shabbosData.havdalah) {
        document.getElementById('havdalah-time').textContent = formatTime(shabbosData.havdalah);
    } else {
        document.getElementById('havdalah-time').textContent = 'N/A';
    }

    if (shabbosData.parsha) {
        document.getElementById('parsha').textContent = shabbosData.parsha;
    } else {
        document.getElementById('parsha').textContent = 'N/A';
    }

    if (shabbosData.shabbosDate) {
        const dateStr = shabbosData.shabbosDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('shabbos-date').textContent = dateStr;
    } else {
        document.getElementById('shabbos-date').textContent = '';
    }
}

// Format time for display
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Show loading state
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('shabbos-info').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

// Show error message
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('shabbos-info').classList.add('hidden');

    const errorElement = document.getElementById('error-message');
    errorElement.querySelector('p').textContent = message;
    errorElement.classList.remove('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
