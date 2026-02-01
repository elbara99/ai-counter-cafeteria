/**
 * Main Application Coordinator
 * Initializes all modules and coordinates interactions
 * Handles TensorFlow.js model loading and real object detection
 */

const App = (function() {
    'use strict';

    let continuousScanActive = false;
    let currentDetections = [];

    /**
     * Initialize application on DOM ready
     */
    async function init() {
        console.log('[App] Initializing POS System with TensorFlow.js...');
        
        try {
            Stats.init();
            Cart.init();
            Camera.init();
            Export.init();
            
            setupCameraEvents();
            setupScanEvent();
            setupContinuousScanEvent();
            setupCompleteOrderEvent();
            setupClearCartEvent();
            setupExportEvent();
            
            updateButtonStates();
            loadAIModel();
            
            console.log('[App] Initialization complete');
            
        } catch (error) {
            console.error('[App] Initialization error:', error);
        }
    }

    /**
     * Load TensorFlow.js custom model
     */
    async function loadAIModel() {
        const modelStatusText = document.getElementById('modelStatusText');
        
        try {
            modelStatusText.innerHTML = '<span class="loading-spinner"></span> Loading AI Model...';
            modelStatusText.className = 'model-loading';
            
            await Detection.loadModel();
            
            const status = Detection.getModelStatus();
            if (status.loaded) {
                modelStatusText.innerHTML = '✅ AI Model Ready';
                modelStatusText.className = 'model-ready';
                console.log('[App] AI Model loaded successfully');
            } else {
                throw new Error('Model failed to load');
            }
            
        } catch (error) {
            console.error('[App] Model load error:', error);
            modelStatusText.innerHTML = '❌ Model Load Failed';
            modelStatusText.className = 'model-error';
            
            const errorDiv = document.getElementById('cameraError');
            if (errorDiv) {
                errorDiv.textContent = 'AI Model Error: ' + error.message;
                errorDiv.classList.add('visible');
            }
        }
    }

    /**
     * Setup camera start/stop events
     */
    function setupCameraEvents() {
        const startBtn = document.getElementById('startCameraBtn');
        const stopBtn = document.getElementById('stopCameraBtn');
        
        startBtn.addEventListener('click', async () => {
            const result = await Camera.startCamera();
            if (result.success) {
                updateButtonStates();
                if (continuousScanActive) {
                    stopContinuousScan();
                }
            }
        });
        
        stopBtn.addEventListener('click', () => {
            Camera.stopCamera();
            updateButtonStates();
            stopContinuousScan();
            clearDetectedProductsDisplay();
        });
    }

    /**
     * Setup scan button event
     */
    function setupScanEvent() {
        const scanBtn = document.getElementById('scanBtn');
        scanBtn.addEventListener('click', async () => {
            await performScan();
        });
    }

    /**
     * Setup continuous scan button event
     */
    function setupContinuousScanEvent() {
        const continuousBtn = document.getElementById('continuousScanBtn');
        continuousBtn.addEventListener('click', () => {
            if (continuousScanActive) {
                stopContinuousScan();
            } else {
                startContinuousScan();
            }
        });
    }

    /**
     * Start continuous scanning
     */
    function startContinuousScan() {
        if (!Camera.isRunning()) {
            alert('Please start the camera first!');
            return;
        }
        
        const modelStatus = Detection.getModelStatus();
        if (!modelStatus.loaded) {
            alert('AI Model is still loading. Please wait...');
            return;
        }
        
        continuousScanActive = true;
        const continuousBtn = document.getElementById('continuousScanBtn');
        continuousBtn.textContent = '⏹ Stop Scan';
        continuousBtn.classList.add('active');
        
        document.querySelector('.scan-controls').classList.add('scanning');
        
        Detection.startContinuousDetection((detections) => {
            currentDetections = detections;
            if (detections.length > 0) {
                Camera.drawDetections(detections);
                updateDetectedProductsDisplay(detections);
            } else {
                Camera.clearCanvas();
                clearDetectedProductsDisplay();
            }
        }, 500);
        
        console.log('[App] Continuous scanning started');
    }

    /**
     * Stop continuous scanning
     */
    function stopContinuousScan() {
        if (!continuousScanActive) return;
        
        continuousScanActive = false;
        const continuousBtn = document.getElementById('continuousScanBtn');
        continuousBtn.textContent = '▶️ Continuous Scan';
        continuousBtn.classList.remove('active');
        
        document.querySelector('.scan-controls').classList.remove('scanning');
        
        Detection.stopContinuousDetection();
        Camera.clearCanvas();
        
        console.log('[App] Continuous scanning stopped');
    }

    /**
     * Perform a single scan
     */
    async function performScan() {
        if (!Camera.isRunning()) {
            alert('Please start the camera first!');
            return;
        }
        
        const modelStatus = Detection.getModelStatus();
        if (!modelStatus.loaded) {
            alert('AI Model is still loading. Please wait...');
            return;
        }
        
        const scanBtn = document.getElementById('scanBtn');
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<span class="loading-spinner"></span> Scanning...';
        
        document.querySelector('.scan-controls').classList.add('scanning');
        
        try {
            Camera.clearCanvas();
            const detections = await Detection.scanProducts();
            currentDetections = detections;
            
            document.querySelector('.scan-controls').classList.remove('scanning');
            
            if (detections.length === 0) {
                console.log('[App] No products detected');
                clearDetectedProductsDisplay();
                const detectedList = document.getElementById('detectedList');
                detectedList.innerHTML = '<p class="no-detection">No products detected. Try adjusting camera angle.</p>';
            } else {
                Camera.drawDetections(detections);
                updateDetectedProductsDisplay(detections);
                
                // Auto-add to cart
                const firstDetection = detections[0];
                if (firstDetection.product) {
                    Cart.addItem(firstDetection.product, firstDetection.confidence);
                    Stats.incrementItemsScanned(1);
                    console.log('[App] Added', firstDetection.product.nameEn, 'to cart');
                }
            }
            
        } catch (error) {
            console.error('[App] Scan error:', error);
            document.querySelector('.scan-controls').classList.remove('scanning');
            alert('Scan failed: ' + error.message);
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '🔍 Scan Products';
        }
    }

    /**
     * Update detected products display
     */
    function updateDetectedProductsDisplay(detections) {
        const detectedList = document.getElementById('detectedList');
        
        if (!detections || detections.length === 0) {
            detectedList.innerHTML = '<p class="no-detection">No products detected</p>';
            return;
        }
        
        detectedList.innerHTML = detections.map((detection, index) => {
            const productName = detection.product ? 
                `${detection.product.nameAr} / ${detection.product.nameEn}` : 
                'Unknown';
            const productPrice = detection.product ? 
                `${detection.product.price} DZD` : '';
            
            return `
                <div class="detected-item">
                    <div class="detected-item-info">
                        <div class="detected-item-name">${productName}</div>
                        <div class="detected-item-class">
                            Confidence: ${Math.round(detection.confidence * 100)}% | ${productPrice}
                        </div>
                    </div>
                    ${detection.product ? `
                    <button class="add-to-cart-btn" onclick="App.addDetectedToCart(${index})">
                        Add to Cart
                    </button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Clear detected products display
     */
    function clearDetectedProductsDisplay() {
        const detectedList = document.getElementById('detectedList');
        detectedList.innerHTML = '<p class="no-detection">Point camera at products and scan</p>';
        currentDetections = [];
    }

    /**
     * Add detected product to cart
     */
    function addDetectedToCart(detectionIndex) {
        const detection = currentDetections[detectionIndex];
        if (detection && detection.product) {
            Cart.addItem(detection.product, detection.confidence);
            Stats.incrementItemsScanned(1);
            console.log('[App] Added', detection.product.nameEn, 'to cart');
        }
    }

    /**
     * Setup complete order event
     */
    function setupCompleteOrderEvent() {
        const completeOrderBtn = document.getElementById('completeOrderBtn');
        
        completeOrderBtn.addEventListener('click', () => {
            const orderData = Cart.getOrderData();
            
            if (orderData.items.length === 0) {
                alert('Cart is empty!');
                return;
            }
            
            const confirmComplete = confirm(
                `Complete order?\n` +
                `Items: ${orderData.itemsCount}\n` +
                `Total: ${orderData.total} DZD`
            );
            
            if (!confirmComplete) return;
            
            if (continuousScanActive) {
                stopContinuousScan();
            }
            
            const exportResult = Export.exportOrder(orderData);
            
            if (exportResult.success) {
                Stats.incrementOrders();
                Stats.addRevenue(orderData.total);
                Cart.clearCart();
                Camera.clearCanvas();
                clearDetectedProductsDisplay();
                
                const statsSection = document.querySelector('.stats-dashboard');
                statsSection.classList.add('success-animation');
                setTimeout(() => statsSection.classList.remove('success-animation'), 500);
                
                alert('✅ Order completed successfully!\n\nOrder ID: ' + exportResult.orderId);
            } else {
                alert('Export failed: ' + exportResult.error);
            }
        });
    }

    /**
     * Setup clear cart event
     */
    function setupClearCartEvent() {
        const clearCartBtn = document.getElementById('clearCartBtn');
        
        clearCartBtn.addEventListener('click', () => {
            Cart.clearCart();
            Camera.clearCanvas();
            clearDetectedProductsDisplay();
        });
    }

    /**
     * Setup export event
     */
    function setupExportEvent() {
        const exportBtn = document.getElementById('exportBtn');
        
        exportBtn.addEventListener('click', () => {
            const stats = Stats.getStats();
            if (stats.ordersCompleted === 0) {
                alert('No orders to export yet!');
                return;
            }
            
            const exportResult = Export.exportAllOrders();
            if (exportResult.success) {
                alert('✅ Orders exported successfully!\n\nFile: ' + exportResult.filename);
            } else {
                alert('Export failed: ' + exportResult.error);
            }
        });
    }

    /**
     * Update button states
     */
    function updateButtonStates() {
        const scanBtn = document.getElementById('scanBtn');
        const continuousBtn = document.getElementById('continuousScanBtn');
        const modelStatus = Detection.getModelStatus();
        
        const cameraActive = Camera.isRunning();
        const modelReady = modelStatus.loaded;
        
        scanBtn.disabled = !cameraActive || !modelReady;
        continuousBtn.disabled = !cameraActive || !modelReady;
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        Camera.resizeCanvas();
    }

    /**
     * Handle visibility change
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            if (continuousScanActive) {
                stopContinuousScan();
            }
        } else {
            Camera.resizeCanvas();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Public API
    return {
        init,
        updateButtonStates,
        addDetectedToCart,
        startContinuousScan,
        stopContinuousScan
    };
})();
