/**
 * Cart Module
 * Manages shopping cart state and operations
 */

const Cart = (function() {
    'use strict';

    // Private state
    let items = [];
    let itemIdCounter = 0;

    // DOM Elements
    const cartItemsElement = document.getElementById('cartItems');
    const cartItemCountElement = document.getElementById('cartItemCount');
    const cartTotalElement = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const completeOrderBtn = document.getElementById('completeOrderBtn');

    /**
     * Initialize cart module
     */
    function init() {
        clearCartBtn.addEventListener('click', clearCart);
        completeOrderBtn.addEventListener('click', getOrderData);
        renderCart();
        console.log('[Cart] Module initialized');
    }

    /**
     * Add product to cart
     * @param {Object} product - Product to add
     * @param {number} confidence - Detection confidence (optional)
     */
    function addItem(product, confidence = null) {
        const cartItem = {
            id: ++itemIdCounter,
            productId: product.id,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: product.price,
            confidence: confidence,
            addedAt: new Date().toISOString()
        };
        
        items.push(cartItem);
        renderCart();
        updateButtons();
        
        console.log('[Cart] Added item:', product.nameEn);
        return cartItem;
    }

    /**
     * Remove item from cart
     * @param {number} itemId - Item ID to remove
     */
    function removeItem(itemId) {
        const index = items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const removedItem = items.splice(index, 1)[0];
            renderCart();
            updateButtons();
            console.log('[Cart] Removed item:', removedItem.nameEn);
        }
    }

    /**
     * Clear all items from cart
     */
    function clearCart() {
        items = [];
        renderCart();
        updateButtons();
        console.log('[Cart] Cleared');
    }

    /**
     * Get cart total price
     * @returns {number} Total price
     */
    function getTotal() {
        return items.reduce((sum, item) => sum + item.price, 0);
    }

    /**
     * Get item count
     * @returns {number} Number of items
     */
    function getItemCount() {
        return items.length;
    }

    /**
     * Get all cart items
     * @returns {Array} Cart items
     */
    function getItems() {
        return [...items];
    }

    /**
     * Get order data for export
     * @returns {Object} Order data
     */
    function getOrderData() {
        return {
            items: getItems(),
            total: getTotal(),
            itemsCount: getItemCount()
        };
    }

    /**
     * Render cart items in UI
     */
    function renderCart() {
        if (items.length === 0) {
            cartItemsElement.innerHTML = '<p class="empty-cart-message">Cart is empty. Start scanning products!</p>';
        } else {
            cartItemsElement.innerHTML = items.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.nameAr}</span>
                        <span class="cart-item-name-en">${item.nameEn}</span>
                        ${item.confidence ? `<span class="cart-item-name-en" style="color: var(--accent-warning)">${Math.round(item.confidence * 100)}% confidence</span>` : ''}
                    </div>
                    <span class="cart-item-price">${item.price} DZD</span>
                    <button class="cart-item-remove" onclick="Cart.removeItem(${item.id})">×</button>
                </div>
            `).join('');
        }
        
        // Update summary
        cartItemCountElement.textContent = getItemCount();
        cartTotalElement.textContent = `${getTotal().toLocaleString()} DZD`;
    }

    /**
     * Update button states based on cart content
     */
    function updateButtons() {
        const hasItems = items.length > 0;
        clearCartBtn.disabled = !hasItems;
        completeOrderBtn.disabled = !hasItems;
    }

    /**
     * Check if cart is empty
     * @returns {boolean} True if empty
     */
    function isEmpty() {
        return items.length === 0;
    }

    // Public API
    return {
        init,
        addItem,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
        getItems,
        getOrderData,
        isEmpty
    };
})();
