/**
 * Camera Module
 * Handles webcam access and video streaming using MediaDevices API
 * Integrates with TensorFlow.js for drawing real-time detection bounding boxes
 */

const Camera = (function() {
    'use strict';

    // Private state
    let stream = null;
    let isActive = false;
    
    // DOM Elements
    const videoElement = document.getElementById('videoFeed');
    const canvasElement = document.getElementById('detectionCanvas');
    const canvasCtx = canvasElement.getContext('2d');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const statusElement = document.getElementById('cameraStatus');
    const placeholderElement = document.getElementById('videoPlaceholder');
    const errorElement = document.getElementById('cameraError');

    /**
     * Initialize camera module
     * Sets up event listeners
     */
    function init() {
        startBtn.addEventListener('click', startCamera);
        stopBtn.addEventListener('click', stopCamera);
        
        // Handle video loaded metadata to resize canvas
        videoElement.addEventListener('loadedmetadata', resizeCanvas);
        videoElement.addEventListener('play', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);
        
        console.log('[Camera] Module initialized');
    }

    /**
     * Request and start webcam access
     * @returns {Promise<Object>} Result with success or error
     */
    async function startCamera() {
        try {
            hideError();
            
            // Request camera permission
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            // Display video stream
            videoElement.srcObject = stream;
            videoElement.classList.add('active');
            
            // Update UI
            isActive = true;
            updateStatus(true);
            updateButtons(true);
            placeholderElement.classList.add('hidden');
            
            // Wait for video to be ready
            await videoElement.play();
            
            // Resize canvas to match video
            resizeCanvas();
            
            console.log('[Camera] Started successfully');
            return { success: true };
            
        } catch (error) {
            const errorResult = handleCameraError(error);
            showError(errorResult.message);
            console.error('[Camera] Error:', errorResult);
            return errorResult;
        }
    }

    /**
     * Stop camera and release stream
     */
    function stopCamera() {
        if (stream) {
            // Stop all tracks (video/audio)
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        // Clear video
        videoElement.srcObject = null;
        videoElement.classList.remove('active');
        
        // Clear canvas
        clearCanvas();
        
        // Update UI
        isActive = false;
        updateStatus(false);
        updateButtons(false);
        placeholderElement.classList.remove('hidden');
        
        console.log('[Camera] Stopped');
    }

    /**
     * Get current video stream
     * @returns {MediaStream|null} Current stream or null
     */
    function getStream() {
        return stream;
    }

    /**
     * Check if camera is active
     * @returns {boolean} Camera status
     */
    function isRunning() {
        return isActive;
    }

    /**
     * Get video element reference
     * @returns {HTMLVideoElement} Video element
     */
    function getVideoElement() {
        return videoElement;
    }

    /**
     * Get canvas element reference
     * @returns {HTMLCanvasElement} Canvas element
     */
    function getCanvasElement() {
        return canvasElement;
    }

    /**
     * Resize canvas to match video dimensions
     */
    function resizeCanvas() {
        if (videoElement && videoElement.videoWidth && videoElement.videoHeight) {
            const container = videoElement.parentElement;
            const containerWidth = container.clientWidth;
            
            // Calculate aspect ratio
            const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            
            // Set canvas size to match video
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            
            // Scale canvas via CSS to fit container
            canvasElement.style.width = '100%';
            canvasElement.style.height = 'auto';
            
            console.log('[Camera] Canvas resized to', canvasElement.width, 'x', canvasElement.height);
        }
    }

    /**
     * Draw a single bounding box on canvas overlay
     * @param {Object} detection - Detection result with x, y, width, height, label, confidence
     * @param {number} index - Detection index (for color variation)
     */
    function drawBoundingBox(detection, index = 0) {
        resizeCanvas();
        
        const { x, y, width, height, displayName, confidence } = detection;
        
        // Color palette for different detections
        const colors = [
            '#3b82f6', // Blue
            '#10b981', // Green
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6'  // Purple
        ];
        
        const color = colors[index % colors.length];
        
        // Draw bounding box with glow effect
        canvasCtx.save();
        canvasCtx.shadowColor = color;
        canvasCtx.shadowBlur = 15;
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 4;
        canvasCtx.strokeRect(x, y, width, height);
        canvasCtx.restore();
        
        // Draw label background
        const labelHeight = 30;
        const labelPadding = 8;
        const labelWidth = canvasCtx.measureText(displayName || `${Math.round(confidence * 100)}%`).width + labelPadding * 2;
        
        // Label background
        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        
        // Label text
        canvasCtx.fillStyle = '#ffffff';
        canvasCtx.font = 'bold 14px Arial, sans-serif';
        canvasCtx.fillText(displayName || `${Math.round(confidence * 100)}%`, x + labelPadding, y - 8);
        
        // Draw confidence bar
        const barHeight = 6;
        const barY = y + height + 5;
        const barWidth = width;
        
        // Background bar
        canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        canvasCtx.fillRect(x, barY, barWidth, barHeight);
        
        // Confidence bar
        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(x, barY, barWidth * confidence, barHeight);
    }

    /**
     * Draw multiple bounding boxes on canvas
     * @param {Array} detections - Array of detection objects
     */
    function drawDetections(detections) {
        clearCanvas();
        
        detections.forEach((detection, index) => {
            drawBoundingBox(detection, index);
        });
    }

    /**
     * Clear all detection boxes from canvas
     */
    function clearCanvas() {
        if (canvasCtx && canvasElement) {
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.shadowBlur = 0;
        }
    }

    /**
     * Update camera status indicator
     * @param {boolean} active - Whether camera is active
     */
    function updateStatus(active) {
        if (active) {
            statusElement.classList.add('active');
            statusElement.classList.remove('error');
            statusElement.querySelector('.status-text').textContent = 'Camera Active';
        } else {
            statusElement.classList.remove('active');
            statusElement.classList.remove('error');
            statusElement.querySelector('.status-text').textContent = 'Camera Off';
        }
    }

    /**
     * Update button states
     * @param {boolean} active - Whether camera is active
     */
    function updateButtons(active) {
        startBtn.disabled = active;
        stopBtn.disabled = !active;
    }

    /**
     * Handle camera errors
     * @param {Error} error - Error object from camera request
     * @returns {Object} Error result with message
     */
    function handleCameraError(error) {
        if (error.name === 'NotAllowedError') {
            return {
                error: true,
                type: 'permission',
                message: 'Camera permission denied. Please allow camera access in your browser settings.'
            };
        } else if (error.name === 'NotFoundError') {
            return {
                error: true,
                type: 'hardware',
                message: 'No camera found. Please connect a camera and try again.'
            };
        } else if (error.name === 'NotReadableError') {
            return {
                error: true,
                type: 'hardware',
                message: 'Camera is in use by another application. Please close other apps using the camera.'
            };
        } else if (error.name === 'OverconstrainedError') {
            return {
                error: true,
                type: 'settings',
                message: 'Camera does not support the requested settings. Trying default settings...'
            };
        } else {
            return {
                error: true,
                type: 'unknown',
                message: `Camera error: ${error.message || 'Unknown error'}`
            };
        }
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
        statusElement.classList.add('error');
        statusElement.querySelector('.status-text').textContent = 'Camera Error';
    }

    /**
     * Hide error message
     */
    function hideError() {
        errorElement.classList.remove('visible');
    }

    /**
     * Capture current frame as image data
     * @returns {ImageData|null} Image data or null if camera not active
     */
    function captureFrame() {
        if (!isActive || !videoElement.videoWidth) {
            return null;
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoElement.videoWidth;
        tempCanvas.height = videoElement.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(videoElement, 0, 0);
        return tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Public API
    return {
        init,
        startCamera,
        stopCamera,
        getStream,
        isRunning,
        getVideoElement,
        getCanvasElement,
        drawBoundingBox,
        drawDetections,
        clearCanvas,
        captureFrame,
        resizeCanvas
    };
})();
