/**
 * Detection Module
 * Custom Coffee, Water & Empty Detection using TensorFlow.js Teachable Machine Model
 * 
 * Model trained with 3 classes:
 * - caffee → Coffee (قهوة) - 100 DZD
 * - water → Water (ماء) - 30 DZD
 * - empty → (ignored, no product)
 */

const Detection = (function() {
    'use strict';

    // ============================================================================
    // PRODUCT CATALOG
    // ============================================================================
    const PRODUCTS = [
        { id: 1, nameAr: 'قهوة', nameEn: 'Coffee', price: 100, modelClass: 'caffee' },
        { id: 2, nameAr: 'ماء', nameEn: 'Water', price: 30, modelClass: 'water' }
    ];

    // ============================================================================
    // DETECTION SETTINGS
    // ============================================================================
    const MIN_CONFIDENCE = 0.5; // 50% minimum confidence
    const IMAGE_SIZE = 224;

    // ============================================================================
    // MODEL STATE
    // ============================================================================
    let model = null;
    let modelLoading = false;
    let modelLoaded = false;

    // ============================================================================
    // MAP MODEL CLASS TO PRODUCT
    // ============================================================================
    function mapClassToProduct(className) {
        // Handle class names (trim spaces, case insensitive)
        const cleanName = className.trim().toLowerCase();
        return PRODUCTS.find(p => p.modelClass.trim().toLowerCase() === cleanName) || null;
    }

    // ============================================================================
    // MODEL LOADING
    // ============================================================================
    async function loadModel() {
        if (modelLoaded) {
            console.log('[Detection] Model already loaded');
            return true;
        }
        
        if (modelLoading) {
            console.log('[Detection] Model already loading...');
            return false;
        }
        
        modelLoading = true;
        console.log('[Detection] Loading custom model...');
        
        try {
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded');
            }
            
            model = await tf.loadLayersModel('./model/model.json');
            
            modelLoaded = true;
            modelLoading = false;
            console.log('[Detection] Custom model loaded successfully');
            return true;
            
        } catch (error) {
            console.error('[Detection] Failed to load model:', error);
            modelLoading = false;
            throw error;
        }
    }

    function isModelLoaded() {
        return modelLoaded;
    }

    function getModelStatus() {
        return {
            loaded: modelLoaded,
            loading: modelLoading,
            modelType: 'Teachable Machine Custom',
            classes: ['caffee → Coffee', 'water → Water', 'empty → Ignore'],
            products: PRODUCTS.map(p => `${p.nameAr} / ${p.nameEn} - ${p.price} DZD`)
        };
    }

    // ============================================================================
    // PRODUCT QUERY FUNCTIONS
    // ============================================================================
    function getProducts() {
        return PRODUCTS;
    }

    function getProductById(id) {
        return PRODUCTS.find(p => p.id === id) || null;
    }

    // ============================================================================
    // IMAGE PREPROCESSING
    // ============================================================================
    function preprocessImage(source) {
        const tf = window.tf;
        let tensor = tf.browser.fromPixels(source)
            .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
            .toFloat();
        tensor = tensor.div(255.0);
        tensor = tensor.expandDims(0);
        return tensor;
    }

    // ============================================================================
    // DETECTION FUNCTIONS
    // ============================================================================
    async function detectObjects(videoElement) {
        if (!modelLoaded || !model) {
            throw new Error('Model not loaded');
        }
        
        if (!videoElement || videoElement.readyState < 2) {
            return [];
        }
        
        try {
            const inputTensor = preprocessImage(videoElement);
            const prediction = model.predict(inputTensor);
            const probabilities = await prediction.data();
            
            // Find the class with highest probability
            let maxProb = 0;
            let maxIndex = 0;
            for (let i = 0; i < probabilities.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    maxIndex = i;
                }
            }
            
            const confidence = maxProb;
            
            // Get class name from metadata
            const classNames = ['caffee', 'water', 'empty'];
            const className = classNames[maxIndex] || 'unknown';
            
            tf.dispose([inputTensor, prediction]);
            
            console.log('[Detection] Prediction:', className, confidence.toFixed(2));
            
            // Skip if confidence too low
            if (confidence < MIN_CONFIDENCE) {
                return [];
            }
            
            // Skip "empty" class - no product
            if (className === 'empty') {
                console.log('[Detection] Detected empty, ignoring');
                return [];
            }
            
            // Map to product
            const product = mapClassToProduct(className);
            
            if (product) {
                const videoWidth = videoElement.videoWidth || 640;
                const videoHeight = videoElement.videoHeight || 480;
                
                const boxSize = Math.min(videoWidth, videoHeight) * 0.6;
                const boxX = (videoWidth - boxSize) / 2;
                const boxY = (videoHeight - boxSize) / 2;
                
                return [{
                    product: product,
                    className: className,
                    confidence: confidence,
                    displayName: `${product.nameAr} / ${product.nameEn}`,
                    boundingBox: {
                        x: boxX,
                        y: boxY,
                        width: boxSize,
                        height: boxSize
                    }
                }];
            }
            
            return [];
            
        } catch (error) {
            console.error('[Detection] Inference error:', error);
            return [];
        }
    }

    async function scanProducts() {
        if (!modelLoaded) {
            try {
                await loadModel();
            } catch (error) {
                console.error('[Detection] Model load failed:', error);
                return [];
            }
        }
        
        const videoElement = document.getElementById('videoFeed');
        
        if (!videoElement) {
            console.error('[Detection] Video element not found');
            return [];
        }
        
        const detections = await detectObjects(videoElement);
        console.log('[Detection] Scan complete:', detections.length, 'products detected');
        
        return detections;
    }

    function getStats() {
        return {
            totalProducts: PRODUCTS.length,
            minConfidence: MIN_CONFIDENCE,
            modelLoaded: modelLoaded,
            modelType: 'Teachable Machine (caffee, water, empty)',
            classes: ['caffee → Coffee', 'water → Water', 'empty → Ignore']
        };
    }

    // ============================================================================
    // CONTINUOUS DETECTION
    // ============================================================================
    let continuousDetectionId = null;
    let continuousDetectionCallback = null;

    function startContinuousDetection(callback, interval = 500) {
        if (continuousDetectionId) return;
        if (!modelLoaded) {
            console.error('[Detection] Model not loaded');
            return;
        }
        
        continuousDetectionCallback = callback;
        
        const detectFrame = async () => {
            const videoElement = document.getElementById('videoFeed');
            if (videoElement) {
                const detections = await detectObjects(videoElement);
                if (continuousDetectionCallback) {
                    continuousDetectionCallback(detections);
                }
            }
            continuousDetectionId = setTimeout(detectFrame, interval);
        };
        
        detectFrame();
        console.log('[Detection] Continuous detection started');
    }

    function stopContinuousDetection() {
        if (continuousDetectionId) {
            clearTimeout(continuousDetectionId);
            continuousDetectionId = null;
            continuousDetectionCallback = null;
            console.log('[Detection] Continuous detection stopped');
        }
    }

    function isContinuousDetectionRunning() {
        return continuousDetectionId !== null;
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================
    return {
        loadModel,
        isModelLoaded,
        getModelStatus,
        getProducts,
        getProductById,
        scanProducts,
        detectObjects,
        startContinuousDetection,
        stopContinuousDetection,
        isContinuousDetectionRunning,
        getStats,
        PRODUCTS,
        MIN_CONFIDENCE
    };
})();
