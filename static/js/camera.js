/**
 * Camera Module for Hazard Reporting System
 * Handles camera access, capture, and image processing
 */

class CameraManager {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('camera-feed');
        this.canvas = document.getElementById('capture-canvas');
        this.startButton = document.getElementById('start-camera');
        this.captureButton = document.getElementById('capture-btn');
        this.retakeButton = document.getElementById('retake-btn');
        this.capturedPreview = document.getElementById('captured-image-preview');
        this.capturedImage = document.getElementById('captured-image');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Camera not supported in this browser');
        }
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startCamera());
        this.captureButton.addEventListener('click', () => this.captureImage());
        this.retakeButton.addEventListener('click', () => this.resetCamera());
    }
    
    async startCamera() {
        try {
            // Stop any existing stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            // Request camera access with optimal settings for mobile
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Store stream globally for cleanup
            window.cameraStream = this.stream;
            
            // Display camera feed
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            
            // Update UI
            this.startButton.style.display = 'none';
            this.captureButton.style.display = 'inline-block';
            
            // Handle video metadata loaded
            this.video.addEventListener('loadedmetadata', () => {
                console.log('Camera ready:', this.video.videoWidth, 'x', this.video.videoHeight);
            });
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.handleCameraError(error);
        }
    }
    
    captureImage() {
        try {
            // Set canvas dimensions to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            // Get canvas context and draw current video frame
            const context = this.canvas.getContext('2d');
            context.drawImage(this.video, 0, 0);
            
            // Convert to base64 image (JPEG with 80% quality for optimal file size)
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            
            // Display captured image
            this.capturedImage.src = imageData;
            this.capturedPreview.style.display = 'block';
            
            // Update UI
            this.video.style.display = 'none';
            this.captureButton.style.display = 'none';
            this.retakeButton.style.display = 'inline-block';
            
            // Trigger form validation
            if (window.checkFormComplete) {
                window.checkFormComplete();
            }
            
        } catch (error) {
            console.error('Image capture error:', error);
            this.showError('Failed to capture image');
        }
    }
    
    resetCamera() {
        // Hide preview
        this.capturedPreview.style.display = 'none';
        this.capturedImage.src = '';
        
        // Show camera feed again
        this.video.style.display = 'block';
        
        // Update UI
        this.retakeButton.style.display = 'none';
        this.captureButton.style.display = 'inline-block';
        
        // Trigger form validation
        if (window.checkFormComplete) {
            window.checkFormComplete();
        }
    }
    
    handleCameraError(error) {
        let message = 'Camera access failed';
        
        switch(error.name) {
            case 'NotAllowedError':
                message = 'Camera access denied. Please allow camera permission.';
                break;
            case 'NotFoundError':
                message = 'No camera found. Please check your device.';
                break;
            case 'NotSupportedError':
                message = 'Camera not supported in this browser.';
                break;
            case 'AbortError':
                message = 'Camera request was cancelled.';
                break;
            default:
                message = `Camera error: ${error.message}`;
        }
        
        this.showError(message);
        
        // Reset UI
        this.startButton.style.display = 'inline-block';
        this.captureButton.style.display = 'none';
    }
    
    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('camera-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'camera-error';
            errorDiv.className = 'error-message';
            document.querySelector('.camera-section').appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `<p class="text-error">❌ ${message}</p>`;
        errorDiv.style.display = 'block';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
            window.cameraStream = null;
        }
    }
    
    // Utility method to check if camera is active
    isActive() {
        return this.stream && this.stream.active;
    }
    
    // Get current captured image data
    getCapturedImage() {
        return this.capturedImage.src;
    }
}

// Initialize camera when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if camera elements exist
    if (document.getElementById('camera-feed')) {
        window.cameraManager = new CameraManager();
    }
});

// Cleanup camera on page unload
window.addEventListener('beforeunload', function() {
    if (window.cameraManager) {
        window.cameraManager.stopCamera();
    }
});

// Handle visibility change to pause/resume camera
document.addEventListener('visibilitychange', function() {
    if (window.cameraManager) {
        if (document.hidden) {
            // Page is hidden, pause camera
            window.cameraManager.stopCamera();
        } else {
            // Page is visible, resume camera if it was active
            // Note: User will need to click start camera again for security
        }
    }
});

// Handle orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        if (window.cameraManager && window.cameraManager.isActive()) {
            // Recalculate video dimensions after orientation change
            const video = window.cameraManager.video;
            if (video && video.srcObject) {
                // Force redraw
                video.style.display = 'none';
                setTimeout(() => {
                    video.style.display = 'block';
                }, 100);
            }
        }
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraManager;
}