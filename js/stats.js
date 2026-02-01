/**
 * Stats Module
 * Manages statistics dashboard with localStorage persistence
 */

const Stats = (function() {
    'use strict';

    // Private state
    let stats = {
        itemsScanned: 0,
        ordersCompleted: 0,
        totalRevenue: 0
    };

    // Storage key
    const STORAGE_KEY = 'pos_stats';

    // DOM Elements
    const itemsScannedElement = document.getElementById('itemsScanned');
    const ordersCompletedElement = document.getElementById('ordersCompleted');
    const totalRevenueElement = document.getElementById('totalRevenue');

    /**
     * Initialize stats module
     * Loads stats from localStorage
     */
    function init() {
        loadStats();
        updateDisplay();
        console.log('[Stats] Module initialized');
    }

    /**
     * Load stats from localStorage
     */
    function loadStats() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                stats = JSON.parse(stored);
                console.log('[Stats] Loaded from storage:', stats);
            }
        } catch (error) {
            console.error('[Stats] Failed to load from storage:', error);
        }
    }

    /**
     * Save stats to localStorage
     */
    function saveStats() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
            console.log('[Stats] Saved to storage');
        } catch (error) {
            console.error('[Stats] Failed to save to storage:', error);
        }
    }

    /**
     * Increment items scanned count
     * @param {number} count - Number of items to add
     */
    function incrementItemsScanned(count = 1) {
        stats.itemsScanned += count;
        saveStats();
        updateDisplay();
        console.log('[Stats] Items scanned:', stats.itemsScanned);
    }

    /**
     * Increment orders completed count
     */
    function incrementOrders() {
        stats.ordersCompleted += 1;
        saveStats();
        updateDisplay();
        console.log('[Stats] Orders completed:', stats.ordersCompleted);
    }

    /**
     * Add revenue to total
     * @param {number} amount - Amount to add
     */
    function addRevenue(amount) {
        stats.totalRevenue += amount;
        saveStats();
        updateDisplay();
        console.log('[Stats] Total revenue:', stats.totalRevenue);
    }

    /**
     * Update stats display in UI
     */
    function updateDisplay() {
        itemsScannedElement.textContent = stats.itemsScanned;
        ordersCompletedElement.textContent = stats.ordersCompleted;
        totalRevenueElement.textContent = `${stats.totalRevenue.toLocaleString()} DZD`;
    }

    /**
     * Get current stats
     * @returns {Object} Current stats
     */
    function getStats() {
        return { ...stats };
    }

    /**
     * Reset all stats
     */
    function resetStats() {
        stats = {
            itemsScanned: 0,
            ordersCompleted: 0,
            totalRevenue: 0
        };
        saveStats();
        updateDisplay();
        console.log('[Stats] Reset');
    }

    // Public API
    return {
        init,
        incrementItemsScanned,
        incrementOrders,
        addRevenue,
        updateDisplay,
        getStats,
        resetStats
    };
})();
