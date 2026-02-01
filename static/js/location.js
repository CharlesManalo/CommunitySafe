/**
 * Location Module for Hazard Reporting System
 * Handles GPS location capture and geolocation services
 */

class LocationManager {
    constructor() {
        this.getLocationButton = document.getElementById('get-location');
        this.locationInfo = document.getElementById('location-info');
        this.locationError = document.getElementById('location-error');
        this.latitudeSpan = document.getElementById('latitude');
        this.longitudeSpan = document.getElementById('longitude');
        
        this.currentPosition = null;
        this.watchId = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            this.getLocationButton.disabled = true;
        }
        
        // Auto-request location on page load (with permission)
        this.autoRequestLocation();
    }
    
    bindEvents() {
        if (this.getLocationButton) {
            this.getLocationButton.addEventListener('click', () => this.getCurrentLocation());
        }
    }
    
    autoRequestLocation() {
        // Only auto-request if user has previously granted permission
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' })
                .then(permission => {
                    if (permission.state === 'granted') {
                        this.getCurrentLocation();
                    }
                })
                .catch(() => {
                    // Fallback: don't auto-request
                });
        }
    }
    
    getCurrentLocation() {
        // Show loading state
        this.getLocationButton.disabled = true;
        this.getLocationButton.innerHTML = '📍 Getting location...';
        this.hideError();
        
        // Configure position options for high accuracy on mobile
        const options = {
            enableHighAccuracy: true, // Use GPS if available
            timeout: 15000, // 15 second timeout
            maximumAge: 0 // Don't use cached position
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => this.handlePositionSuccess(position),
            (error) => this.handlePositionError(error),
            options
        );
    }
    
    handlePositionSuccess(position) {
        this.currentPosition = position;
        const coords = position.coords;
        
        // Update UI with coordinates
        this.latitudeSpan.textContent = coords.latitude.toFixed(6);
        this.longitudeSpan.textContent = coords.longitude.toFixed(6);
        
        // Show location info
        this.locationInfo.style.display = 'block';
        this.hideError();
        
        // Reset button
        this.getLocationButton.disabled = false;
        this.getLocationButton.innerHTML = '📍 Update Location';
        
        // Store coordinates in hidden form fields if they exist
        this.updateFormFields(coords);
        
        // Trigger form validation
        if (window.checkFormComplete) {
            window.checkFormComplete();
        }
        
        // Get location name if possible (reverse geocoding)
        this.reverseGeocode(coords.latitude, coords.longitude);
        
        console.log('Location captured:', coords.latitude, coords.longitude);
    }
    
    handlePositionError(error) {
        let message = 'Unable to get your location';
        let isRetryable = true;
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location access denied. Please enable location services and refresh the page.';
                isRetryable = false;
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable. Please check your connection.';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
            default:
                message = `Location error: ${error.message}`;
        }
        
        this.showError(message);
        
        // Reset button
        this.getLocationButton.disabled = false;
        this.getLocationButton.innerHTML = isRetryable ? '📍 Try Again' : '📍 Location Blocked';
        
        // Hide location info
        this.locationInfo.style.display = 'none';
        
        console.error('Geolocation error:', error);
    }
    
    reverseGeocode(latitude, longitude) {
        // Optional: Use a geocoding service to get address
        // This is a lightweight implementation without external API calls
        
        // You can integrate with services like:
        // - Google Maps Geocoding API
        // - OpenStreetMap Nominatim
        // - Mapbox Geocoding API
        
        // For now, we'll just show coordinates
        const accuracy = this.currentPosition.coords.accuracy;
        if (accuracy) {
            const accuracyInfo = document.createElement('p');
            accuracyInfo.innerHTML = `<small>Accuracy: ${Math.round(accuracy)} meters</small>`;
            accuracyInfo.style.opacity = '0.7';
            
            // Remove existing accuracy info
            const existing = this.locationInfo.querySelector('p:last-child');
            if (existing && existing.innerHTML.includes('Accuracy')) {
                existing.remove();
            }
            
            this.locationInfo.appendChild(accuracyInfo);
        }
    }
    
    updateFormFields(coords) {
        // Create hidden form fields if they don't exist
        let latField = document.getElementById('latitude-field');
        let lngField = document.getElementById('longitude-field');
        
        if (!latField) {
            latField = document.createElement('input');
            latField.type = 'hidden';
            latField.id = 'latitude-field';
            latField.name = 'latitude';
            document.querySelector('form')?.appendChild(latField);
        }
        
        if (!lngField) {
            lngField = document.createElement('input');
            lngField.type = 'hidden';
            lngField.id = 'longitude-field';
            lngField.name = 'longitude';
            document.querySelector('form')?.appendChild(lngField);
        }
        
        // Update field values
        if (latField) latField.value = coords.latitude;
        if (lngField) lngField.value = coords.longitude;
    }
    
    showError(message) {
        this.locationError.innerHTML = `<p class="text-error">❌ ${message}</p>`;
        this.locationError.style.display = 'block';
        this.locationInfo.style.display = 'none';
    }
    
    hideError() {
        this.locationError.style.display = 'none';
    }
    
    // Start watching position for updates
    startWatching() {
        if (this.watchId) {
            this.stopWatching();
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minute
        };
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionSuccess(position),
            (error) => this.handlePositionError(error),
            options
        );
    }
    
    // Stop watching position
    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
    
    // Get current coordinates
    getCoordinates() {
        if (this.currentPosition) {
            return {
                latitude: this.currentPosition.coords.latitude,
                longitude: this.currentPosition.coords.longitude,
                accuracy: this.currentPosition.coords.accuracy
            };
        }
        return null;
    }
    
    // Check if location is available
    hasLocation() {
        return this.currentPosition !== null;
    }
    
    // Calculate distance between two points (in meters)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // Format coordinates for display
    formatCoordinates(lat, lng, decimals = 6) {
        return {
            latitude: lat.toFixed(decimals),
            longitude: lng.toFixed(decimals)
        };
    }
}

// Utility functions for location-related tasks
const LocationUtils = {
    // Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
    decimalToDMS(decimal, type) {
        const direction = decimal < 0 ? (type === 'lat' ? 'S' : 'W') : (type === 'lat' ? 'N' : 'E');
        decimal = Math.abs(decimal);
        
        const degrees = Math.floor(decimal);
        const minutesFloat = (decimal - degrees) * 60;
        const minutes = Math.floor(minutesFloat);
        const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
        
        return `${degrees}°${minutes}'${seconds}"${direction}`;
    },
    
    // Generate Google Maps URL
    getGoogleMapsUrl(lat, lng, zoom = 17) {
        return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
    },
    
    // Generate OpenStreetMap URL
    getOpenStreetMapUrl(lat, lng, zoom = 17) {
        return `https://www.openstreetmap.org/#map=${zoom}/${lat}/${lng}`;
    },
    
    // Check if coordinates are valid
    isValidCoordinate(lat, lng) {
        return !isNaN(lat) && !isNaN(lng) &&
               lat >= -90 && lat <= 90 &&
               lng >= -180 && lng <= 180;
    }
};

// Initialize location manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if location elements exist
    if (document.getElementById('get-location')) {
        window.locationManager = new LocationManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LocationManager, LocationUtils };
}