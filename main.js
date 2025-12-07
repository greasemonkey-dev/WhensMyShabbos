// MapTiler API Key - Replace with your own key from https://cloud.maptiler.com/
const MAPTILER_API_KEY = 'IOegHViiczZRkx2lZpbB';

// Google Analytics helper function
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}

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

// Minhagim configuration cache
let minhagimConfig = null;

// Load minhagim configuration from JSON file
async function loadMinhagimConfig() {
    if (minhagimConfig) return minhagimConfig;

    try {
        const response = await fetch('minhagim.json');
        minhagimConfig = await response.json();
        console.log('Loaded minhagim config:', minhagimConfig);
        return minhagimConfig;
    } catch (error) {
        console.warn('Could not load minhagim.json, using defaults:', error);
        minhagimConfig = { default: 20, locations: [] };
        return minhagimConfig;
    }
}

// Get candle lighting minutes based on location name
async function getCandleLightingMinutes(locationName) {
    const config = await loadMinhagimConfig();

    if (!locationName || !config.locations) {
        return config.default;
    }

    // Search for a matching location (case-insensitive partial match)
    const locationLower = locationName.toLowerCase();

    for (const location of config.locations) {
        for (const name of location.names) {
            if (locationLower.includes(name.toLowerCase())) {
                console.log(`Found minhag match: "${name}" in "${locationName}" → ${location.minutes} minutes`);
                return location.minutes;
            }
        }
    }

    return config.default;
}

// Initialize the application
async function init() {
    // Initialize language system
    if (window.i18n) {
        window.i18n.initLanguage();
        window.i18n.updatePageLanguage();
    }

    // Set up language switcher
    const langSwitcher = document.getElementById('lang-switcher-btn');
    if (langSwitcher) {
        langSwitcher.addEventListener('click', () => {
            const currentLang = window.i18n.getLanguage();
            const newLang = currentLang === 'en' ? 'he' : 'en';
            window.i18n.setLanguage(newLang);
            trackEvent('language_switch', { language: newLang });
        });
    }

    // Check if API key is set
    if (MAPTILER_API_KEY === 'YOUR_MAPTILER_API_KEY_HERE') {
        showError(window.i18n ? window.i18n.t('apiKeyError') : 'Please set your MapTiler API key in main.js');
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
        trackEvent('map_click', {
            latitude: lat.toFixed(4),
            longitude: lng.toFixed(4)
        });
        await updateShabbosInfo(lat, lng);
        updateMarker(lat, lng);
    });
}

// Hide header with smooth animation
function hideHeader() {
    const header = document.querySelector('header');
    const infoPanel = document.getElementById('info-panel');

    if (header) {
        header.classList.add('header-hidden');
    }
    if (infoPanel) {
        infoPanel.classList.add('header-collapsed');
    }
}

// Helper function to get translated string
function t(key, replacements = {}) {
    return window.i18n ? window.i18n.t(key, replacements) : key;
}

// Get user's current location
async function getUserLocation() {
    if (!('geolocation' in navigator)) {
        showError(t('geolocationNotSupported'));
        return;
    }

    // Check if we're on HTTPS (required for geolocation in most browsers)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Geolocation may not work over HTTP. HTTPS is recommended.');
    }

    // Check permission status first (if Permissions API is available)
    if ('permissions' in navigator) {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            if (permissionStatus.state === 'denied') {
                showError(t('locationDeniedPreviously'));
                return;
            }
        } catch (e) {
            // Permissions API not fully supported, continue with geolocation request
            console.log('Permissions API check failed, proceeding with geolocation request');
        }
    }

    // Request location with timeout and options
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            trackEvent('geolocation_success', {
                latitude: latitude.toFixed(4),
                longitude: longitude.toFixed(4)
            });

            // Hide the header as the map starts zooming in
            // Small delay to let user see the initial state
            setTimeout(() => {
                hideHeader();
            }, 500);

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
            trackEvent('geolocation_error', {
                error_code: error.code,
                error_message: error.message
            });

            // Provide specific error messages based on error code
            let errorKey;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorKey = 'locationDenied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorKey = 'locationUnavailable';
                    break;
                case error.TIMEOUT:
                    errorKey = 'locationTimeout';
                    break;
                default:
                    errorKey = 'locationError';
            }
            showError(t(errorKey));
        },
        {
            enableHighAccuracy: false, // Faster response, sufficient for city-level accuracy
            timeout: 10000, // 10 second timeout to prevent hanging
            maximumAge: 300000 // Accept cached position up to 5 minutes old
        }
    );
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
        <img class="marker-pin" src="marker-icon.svg" alt="Location marker" />
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

        // Get Shabbos times from HebCal API (pass locationName for minhag lookup)
        const shabbosData = await getShabbosTimesFromHebCal(lat, lng, locationName);

        // Display the information
        displayShabbosInfo(locationName, shabbosData);
    } catch (error) {
        console.error('Error fetching Shabbos info:', error);
        showError(t('fetchError', { message: error.message }));
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

            // Use context array to build clean location name without addresses/zip codes
            // Context contains structured data: place, region, country, etc.
            const locationParts = [];

            // Get place/city name from context
            if (feature.context) {
                // Look for city/place - could be 'place', 'municipality', or 'locality'
                const place = feature.context.find(c => c.id && (
                    c.id.startsWith('place') ||
                    c.id.startsWith('municipality') ||
                    c.id.startsWith('locality')
                ));
                const region = feature.context.find(c => c.id && c.id.startsWith('region'));
                const country = feature.context.find(c => c.id && c.id.startsWith('country'));

                if (place) locationParts.push(place.text);
                if (region) locationParts.push(region.text);
                if (country) locationParts.push(country.text);
            }

            // If no place found in context, check the feature itself
            if (locationParts.length === 0 || !locationParts[0]) {
                // The feature.text often contains the city/place name
                if (feature.text && feature.place_type &&
                    (feature.place_type.includes('place') ||
                     feature.place_type.includes('municipality') ||
                     feature.place_type.includes('locality'))) {
                    locationParts.unshift(feature.text);
                }
            }

            // If we got structured data, return it
            if (locationParts.length > 0) {
                return locationParts.join(', ');
            }

            // Fallback: parse place_name and remove anything that looks like a zip code
            const placeName = feature.place_name || '';
            const parts = placeName.split(',').map(p => p.trim());

            // Filter out parts that are just numbers (zip codes) or start with numbers
            const filtered = parts.filter(part => {
                // Remove if it's all digits (zip code)
                if (/^\d+$/.test(part)) return false;
                // Remove if it starts with digits followed by space (e.g., "12345 Street")
                if (/^\d+\s/.test(part)) return false;
                return true;
            });

            // Skip first part (likely street address) and return the rest
            if (filtered.length > 1) {
                return filtered.slice(1).join(', ');
            }

            return filtered.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Error getting location name:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// Get Shabbos times from HebCal API
async function getShabbosTimesFromHebCal(lat, lng, locationName) {
    // Get candle lighting minutes based on location minhag
    const candleLightingMinutes = await getCandleLightingMinutes(locationName);

    // Don't use tzid=auto - HebCal will auto-detect timezone from coordinates
    const url = `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&b=${candleLightingMinutes}`;

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

    trackEvent('shabbos_times_loaded', {
        location: locationName,
        parsha: shabbosData.parsha || 'N/A'
    });

    document.getElementById('location-name').textContent = locationName;

    // Get locale for formatting
    const locale = window.i18n ? window.i18n.getLocale() : 'en-US';
    const notAvailable = t('notAvailable');

    // Candle lighting time with datetime attribute for SEO
    const candleTimeElement = document.getElementById('candle-time');
    if (shabbosData.candleLighting) {
        candleTimeElement.textContent = formatTime(shabbosData.candleLighting, locale);
        candleTimeElement.setAttribute('datetime', shabbosData.candleLighting.toISOString());
    } else {
        candleTimeElement.textContent = notAvailable;
        candleTimeElement.removeAttribute('datetime');
    }

    // Havdalah time with datetime attribute for SEO
    const havdalahTimeElement = document.getElementById('havdalah-time');
    if (shabbosData.havdalah) {
        havdalahTimeElement.textContent = formatTime(shabbosData.havdalah, locale);
        havdalahTimeElement.setAttribute('datetime', shabbosData.havdalah.toISOString());
    } else {
        havdalahTimeElement.textContent = notAvailable;
        havdalahTimeElement.removeAttribute('datetime');
    }

    // Parsha (Torah portion)
    if (shabbosData.parsha) {
        document.getElementById('parsha').textContent = shabbosData.parsha;
    } else {
        document.getElementById('parsha').textContent = notAvailable;
    }

    // Shabbos date with datetime attribute for SEO
    const shabbosDateElement = document.getElementById('shabbos-date');
    if (shabbosData.shabbosDate) {
        const dateStr = shabbosData.shabbosDate.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        shabbosDateElement.textContent = dateStr;
        shabbosDateElement.setAttribute('datetime', shabbosData.shabbosDate.toISOString().split('T')[0]);
    } else {
        shabbosDateElement.textContent = '';
        shabbosDateElement.removeAttribute('datetime');
    }
}

// Format time for display
function formatTime(date, locale = 'en-US') {
    // Hebrew uses 24-hour format by default, but keep hour12 consistent
    const options = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: locale === 'en-US'
    };
    return date.toLocaleTimeString(locale, options);
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

    trackEvent('error', {
        error_message: message
    });

    const errorElement = document.getElementById('error-message');
    errorElement.querySelector('p').textContent = message;
    errorElement.classList.remove('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
