# POS System with AI Camera Detection - Architecture Plan

## Overview
A modern Point of Sale system for cafes/restaurants featuring simulated AI object detection via webcam, shopping cart functionality, and real-time statistics dashboard.

## Project Structure

```
cafee-project/
├── index.html          # Main HTML entry point
├── css/
│   └── style.css       # All styles (dark theme, responsive)
├── js/
│   ├── app.js          # Main application coordinator
│   ├── camera.js       # Camera access and video handling
│   ├── detection.js    # Object detection simulation
│   ├── cart.js         # Shopping cart management
│   ├── stats.js        # Statistics dashboard
│   └── export.js       # Order export functionality
└── README.md           # Documentation
```

## Module Responsibilities

### 1. camera.js (Camera Module)
**Responsibilities:**
- Request webcam access via MediaDevices API
- Start/Stop camera controls
- Render video stream to `<video>` element
- Manage canvas overlay for detection boxes
- Handle camera errors (permissions, hardware issues)

**Key Functions:**
- `initCamera()` - Request and setup webcam
- `startCamera()` - Begin video stream
- `stopCamera()` - Stop video stream
- `getStream()` - Return video stream reference
- `drawBoundingBox()` - Draw detection boxes on canvas

### 2. detection.js (Detection Module)
**Responsibilities:**
- Simulate product detection (for MVP)
- Randomly select products from predefined list
- Generate confidence scores (70-100%)
- Draw bounding boxes on canvas
- Return detection results to cart

**Predefined Products:**
```javascript
const PRODUCTS = [
    { id: 1, nameAr: 'قهوة سادة', nameEn: 'Black Coffee', price: 100 },
    { id: 2, nameAr: 'قهوة بالحليب', nameEn: 'Coffee with Milk', price: 120 },
    { id: 3, nameAr: 'نسكافيه', nameEn: 'Nescafe', price: 80 },
    { id: 4, nameAr: 'عصير برتقال', nameEn: 'Orange Juice', price: 150 },
    { id: 5, nameAr: 'كابتشينو', nameEn: 'Cappuccino', price: 140 },
    { id: 6, nameAr: 'شاي', nameEn: 'Tea', price: 50 }
];
```

**Future Integration Point:**
```javascript
// TODO: Replace with YOLOv8 or TensorFlow.js
// async function detectObjects(imageData) {
//     const model = await tf.loadGraphModel('/model/path');
//     const predictions = await model.predict(imageData);
//     return processPredictions(predictions);
// }
```

**Key Functions:**
- `scanProducts()` - Trigger product detection
- `simulateDetection()` - Random product selection
- `getRandomConfidence()` - Generate confidence score

### 3. cart.js (Cart Module)
**Responsibilities:**
- Maintain cart state (array of items)
- Add detected items to cart
- Remove items from cart
- Calculate running total
- Clear cart functionality
- Display cart items in UI

**Key Functions:**
- `addItem(product)` - Add product to cart
- `removeItem(itemId)` - Remove specific item
- `clearCart()` - Empty cart
- `getTotal()` - Calculate total price
- `getItems()` - Return cart contents
- `renderCart()` - Update cart display

### 4. stats.js (Statistics Module)
**Responsibilities:**
- Track items scanned count
- Track orders completed count
- Track total revenue
- Update dashboard in real-time
- Persist stats to localStorage

**Key Functions:**
- `incrementItemsScanned(count)` - Add scanned items
- `incrementOrders()` - Record completed order
- `addRevenue(amount)` - Add to total revenue
- `updateDisplay()` - Refresh stats UI
- `getStats()` - Return current stats

### 5. export.js (Export Module)
**Responsibilities:**
- Export orders to JSON format
- Include timestamp
- Download as file
- Handle export errors

**Export Format:**
```json
{
    "orderId": "order_1709312345",
    "timestamp": "2026-01-31T22:39:05.000Z",
    "items": [...],
    "total": 450,
    "itemsCount": 4
}
```

**Key Functions:**
- `exportOrder(orderData)` - Create and download JSON
- `generateOrderId()` - Unique order identifier

### 6. app.js (Main Application)
**Responsibilities:**
- Initialize all modules
- Coordinate module interactions
- Handle global events
- Error handling and logging

**Initialization Flow:**
```javascript
1. DOMContentLoaded
2. Initialize Stats module
3. Initialize Camera module
4. Setup event listeners
5. Render initial UI
```

## UI Layout

### Desktop (2-Column Grid)
```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│        Camera Feed (Left)           │       Shopping Cart (Right)         │
│  ┌─────────────────────────────┐    │  ┌─────────────────────────────┐    │
│  │    [Video + Canvas]         │    │  │   🛒 Cart Items             │    │
│  │                             │    │  │  ┌─────────────────────┐    │    │
│  │                             │    │  │  │ Item 1              │    │    │
│  │                             │    │  │  │ Item 2              │    │    │
│  │                             │    │  │  │ ...                  │    │    │
│  └─────────────────────────────┘    │  │  └─────────────────────┘    │    │
│  [📷 Start Camera] [🔍 Scan]        │  │  Total: 450 DZD             │    │
│                                     │  │  [Clear Cart] [✅ Complete] │    │
├─────────────────────────────────────┴─────────────────────────────────────┤
│                         Statistics Dashboard                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ 📦 Scanned  │  │ 📋 Orders   │  │ 💰 Revenue  │                      │
│  │     24      │  │      5      │  │   2,450 DZD │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
├─────────────────────────────────────────────────────────────────────────┤
│                         Instructions & Demo Notice                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📌 How to use: 1. Start camera → 2. Point at products → 3. Scan │    │
│  │ ⚠️ Demo Mode: This simulates AI detection. Real detection would  │    │
│  │    use YOLOv8 or TensorFlow.js for actual object recognition.   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                          [📤 Export Orders]                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile (Single Column)
```
┌─────────────────────────────┐
│     Statistics Header       │
│  📦 24  │ 📋 5  │ 💰 2,450 │
├─────────────────────────────┤
│      Camera Feed           │
│  ┌─────────────────────┐   │
│  │    [Video + Canvas] │   │
│  └─────────────────────┘   │
│  [📷 Start] [🔍 Scan]      │
├─────────────────────────────┤
│      Shopping Cart         │
│  🛒 Cart Items             │
│  ┌─────────────────────┐   │
│  │ Item 1              │   │
│  │ Item 2              │   │
│  └─────────────────────┘   │
│  Total: 450 DZD            │
│  [Clear] [Complete]        │
├─────────────────────────────┤
│    Instructions & Notice   │
└─────────────────────────────┘
```

## Color Scheme (CSS Variables)

```css
:root {
    /* Background Colors */
    --bg-primary: #0f172a;      /* Slate 900 */
    --bg-secondary: #1e293b;    /* Slate 800 */
    --bg-tertiary: #334155;     /* Slate 700 */
    
    /* Accent Colors */
    --accent-primary: #3b82f6;  /* Blue 500 */
    --accent-hover: #2563eb;    /* Blue 600 */
    --accent-success: #10b981;  /* Emerald 500 */
    --accent-warning: #f59e0b;  /* Amber 500 */
    --accent-danger: #ef4444;   /* Red 500 */
    
    /* Text Colors */
    --text-primary: #f1f5f9;    /* Slate 100 */
    --text-secondary: #94a3b8;  /* Slate 400 */
    --text-muted: #64748b;      /* Slate 500 */
    
    /* Border */
    --border-color: #334155;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}
```

## Event Flow

```
User clicks [Start Camera]
    ↓
camera.initCamera()
    ↓
Browser requests permission
    ↓
On success: Show video stream, enable [Scan] button
On error: Show error message

User clicks [Scan]
    ↓
detection.scanProducts()
    ↓
Random product selection + confidence
    ↓
camera.drawBoundingBox()
    ↓
cart.addItem(product)
    ↓
cart.renderCart()
    ↓
stats.incrementItemsScanned()
    ↓
stats.updateDisplay()

User clicks [Complete Order]
    ↓
export.exportOrder(orderData)
    ↓
stats.incrementOrders()
    ↓
stats.addRevenue(total)
    ↓
stats.updateDisplay()
    ↓
cart.clearCart()
    ↓
Show success alert
```

## Error Handling

### Camera Permissions
```javascript
try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
} catch (error) {
    if (error.name === 'NotAllowedError') {
        return { error: 'Camera permission denied. Please allow camera access.' };
    } else if (error.name === 'NotFoundError') {
        return { error: 'No camera found. Please connect a camera.' };
    }
    return { error: `Camera error: ${error.message}` };
}
```

### General Errors
- Display user-friendly error messages
- Log technical details to console
- Provide retry options when applicable

## Future AI Integration

```javascript
// In detection.js - Replace simulateDetection() with:

/**
 * FUTURE: Real object detection using YOLOv8 or TensorFlow.js
 * 
 * Integration steps:
 * 1. Load pre-trained model (e.g., COCO-trained YOLOv8)
 * 2. Preprocess video frame (resize, normalize)
 * 3. Run inference on model
 * 4. Parse detections with confidence > threshold
 * 5. Map detected classes to product catalog
 * 
 * Example:
 * 
 * import * as tf from '@tensorflow/tfjs';
 * import * as yolo from 'yolojs';
 * 
 * async function detectProducts(videoFrame) {
 *     const model = await yolo.load({ modelPath: '/models/yolov8n.pt' });
 *     const detections = await model.detect(videoFrame);
 *     return mapDetectionsToProducts(detections);
 * }
 */
```

## Responsive Design Breakpoints

```css
/* Desktop */
@media (min-width: 1024px) {
    .main-container {
        grid-template-columns: 1fr 1fr;
    }
}

/* Tablet */
@media (max-width: 1023px) {
    .main-container {
        grid-template-columns: 1fr;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .stats-dashboard {
        flex-wrap: wrap;
    }
    .stat-card {
        flex: 1 1 45%;
    }
}
```

## Testing Checklist

- [ ] Camera permission handling
- [ ] Video stream display
- [ ] Detection simulation (random products)
- [ ] Bounding box drawing
- [ ] Cart add/remove/clear
- [ ] Total calculation
- [ ] Order completion
- [ ] Statistics updates
- [ ] JSON export
- [ ] Responsive layout (desktop/tablet/mobile)
- [ ] Error messages display
- [ ] Success alerts
- [ ] Pulse animation for camera status

## Estimated Files to Create

1. `index.html` - ~150 lines
2. `css/style.css` - ~300 lines
3. `js/app.js` - ~80 lines
4. `js/camera.js` - ~120 lines
5. `js/detection.js` - ~100 lines
6. `js/cart.js` - ~100 lines
7. `js/stats.js` - ~80 lines
8. `js/export.js` - ~60 lines

**Total: ~990 lines of code**
