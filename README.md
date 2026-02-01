# AI-Powered POS System for Cafes 🍵

A modern Point of Sale system with AI-powered camera detection for cafes and restaurants. Built with pure HTML/CSS/JavaScript using TensorFlow.js for object detection.

![POS System](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **📷 Camera Integration**: Live webcam feed with real-time video display
- **🤖 AI Object Detection**: TensorFlow.js-powered product detection (with simulation mode for MVP)
- **🛒 Shopping Cart**: Add detected items, calculate totals, complete orders
- **📊 Statistics Dashboard**: Track items scanned, orders completed, and revenue
- **📤 Export Orders**: Download order data in JSON format with timestamps
- **🌙 Dark Theme**: Modern slate/blue color scheme with responsive design

## 📋 Supported Products

| Arabic Name | English Name | Price (DZD) |
|-------------|--------------|-------------|
| قهوة سادة | Black Coffee | 100 |
| قهوة بالحليب | Coffee with Milk | 120 |
| نسكافيه | Nescafe | 80 |
| عصير برتقال | Orange Juice | 150 |
| كابتشينو | Cappuccino | 140 |
| شاي | Tea | 50 |

## 🚀 Getting Started

### Prerequisites
- A modern web browser with camera support (Chrome, Firefox, Edge)
- Webcam/camera connected to your device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cafee-pos.git
cd cafee-pos
```

2. Open `index.html` in your web browser:
```bash
# Using Python
python -m http.server 8000

# Then open http://localhost:8000
```

3. Or simply double-click `index.html` to open it directly

## 🏗️ Project Structure

```
cafee-pos/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # Dark theme styles
├── js/
│   ├── app.js          # Main application coordinator
│   ├── camera.js       # Camera module (MediaDevices API)
│   ├── detection.js    # Object detection (TensorFlow.js)
│   ├── cart.js         # Shopping cart management
│   ├── stats.js        # Statistics dashboard
│   └── export.js       # Order export functionality
├── model/              # TensorFlow.js model files
└── README.md
```

## 🔧 Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **JavaScript ES6+** - Modern JavaScript
- **TensorFlow.js** - ML library for in-browser detection
- **Canvas API** - Drawing detection boxes
- **MediaDevices API** - Webcam access

## 🎯 Future Integrations

This MVP uses simulated detection for demonstration. For production use:

- **YOLOv8**: Replace simulation with YOLOv8 model for real-time detection
- **TensorFlow.js**: Use custom-trained model on your product images
- **Backend Integration**: Connect to a REST API for order management

## 📱 Responsive Design

The system works on both desktop and mobile devices:
- Desktop: 2-column layout (camera left, cart right)
- Mobile: Stacked layout for better usability

## 📝 License

MIT License - feel free to use this project for your cafe or restaurant!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.
