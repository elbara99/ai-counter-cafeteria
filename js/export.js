/**
 * Export Module
 * Handles order export to JSON format with timestamps
 */

const Export = (function() {
    'use strict';

    /**
     * Initialize export module
     */
    function init() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportAllOrders);
        }
        console.log('[Export] Module initialized');
    }

    /**
     * Generate unique order ID
     * @returns {string} Unique order identifier
     */
    function generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `order_${timestamp}_${random}`;
    }

    /**
     * Export single order to JSON and download
     * @param {Object} orderData - Order data to export
     * @returns {Object} Export result with success status and filename
     */
    function exportOrder(orderData) {
        try {
            const orderId = generateOrderId();
            const exportData = {
                orderId: orderId,
                timestamp: new Date().toISOString(),
                items: orderData.items,
                total: orderData.total,
                itemsCount: orderData.itemsCount
            };
            
            const filename = downloadJSON(exportData, `order_${orderId}.json`);
            
            console.log('[Export] Order exported:', orderId);
            return { success: true, orderId: orderId, filename: filename };
            
        } catch (error) {
            console.error('[Export] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Export all statistics to JSON
     * Combines current stats with order history
     * @returns {Object} Export result
     */
    function exportAllOrders() {
        try {
            const stats = Stats.getStats();
            const exportData = {
                exportTimestamp: new Date().toISOString(),
                application: 'POS System with AI Camera Detection',
                model: 'TensorFlow.js COCO-SSD',
                stats: stats
            };
            
            const filename = downloadJSON(exportData, `pos_export_${Date.now()}.json`);
            
            console.log('[Export] All data exported');
            return { success: true, filename: filename };
            
        } catch (error) {
            console.error('[Export] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Download JSON file
     * @param {Object} data - Data to export
     * @param {string} filename - Filename for download
     * @returns {string} The filename used
     */
    function downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        return filename;
    }

    /**
     * Export cart as order
     * @returns {Object} Export result
     */
    function exportCurrentCart() {
        const orderData = Cart.getOrderData();
        
        if (orderData.items.length === 0) {
            return { success: false, error: 'Cart is empty' };
        }
        
        return exportOrder(orderData);
    }

    /**
     * Export single item detection
     * @param {Object} detection - Detection result
     * @returns {Object} Export result
     */
    function exportDetection(detection) {
        try {
            const exportData = {
                detectionId: generateOrderId(),
                timestamp: new Date().toISOString(),
                product: detection.product,
                confidence: detection.confidence,
                boundingBox: detection.boundingBox,
                cocoClass: detection.cocoClass
            };
            
            const filename = downloadJSON(exportData, `detection_${exportData.detectionId}.json`);
            
            console.log('[Export] Detection exported:', exportData.detectionId);
            return { success: true, filename: filename };
            
        } catch (error) {
            console.error('[Export] Error:', error);
            return { success: false, error: error.message };
        }
    }

    // Public API
    return {
        init,
        exportOrder,
        exportAllOrders,
        exportCurrentCart,
        exportDetection,
        generateOrderId
    };
})();
