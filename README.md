# Elamani Tech Dynamic Website

Welcome to the **Elamani Tech** premium landing page repository. This project serves as a state-of-the-art, cinematic introduction to Elamani Tech—a DPIIT-certified indigenous manufacturer of robotic actuators and quadruped robots.

## 🌟 Key Features

### 1. Cinematic "Scroll-to-Content" Architecture
Inspired by premium tech showcases (like Apple), this site uses a custom, high-performance scroll engine:
- **Lerp Animation Engine**: As you scroll, a custom math engine scrubs through over 1,000 high-resolution frames of robotic animation. 
- **Sticky Theater Layout**: The animation drives smoothly forward, freezing perfectly on the final frame before gracefully allowing the text content to scroll up over the cinematic background.
- **Shock Absorber Logic**: Bypasses typical scroll-glitches. No matter how fast you flick your scroll wheel, the robot flawlessly catches up without skipping frames.

### 2. Interactive Three.js Companion
- A lightweight, fully 3D interactive robot companion lives on the page.
- Built from scratch using native `Three.js` primitives.
- Follows your mouse cursor, acts as a dynamic "Quick Menu", and perfectly matches the SVG pre-loader dimensions.

### 3. Dynamic Audio & Atmosphere
- **Smart Autoplay Management**: Bypasses browser autoplay restrictions silently. The background audio engine waits for your absolute first interaction (a click or scroll) and beautifully fades in the soundtrack.
- **Section-Aware Audio**: Different robotic sections seamlessly crossfade their unique audio tracks as you scroll down the page.
- **Particle System & Glassmorphism**: Interactive background particles paired with heavy backdrop-filters provide a deep, premium dark-mode aesthetic.

## 🛠️ Technology Stack
- **Structure**: Vanilla HTML5 (Semantic).
- **Styling**: Pure CSS3. Custom CSS variables (Design Tokens), fluid typography clamps (`clamp()`), and no heavy frameworks.
- **Logic & Animation**: Vanilla ES6+ JavaScript.
- **3D Graphics**: Three.js (via CDN).

## 🚀 Running Locally

Because this website loads over 1,000 local high-resolution images to create its cinematic scroll effect, it **must** be run through a local web server (to bypass CORS and `file:///` protocol restrictions).

### Option 1: VS Code (Recommended)
1. Open this folder in Visual Studio Code.
2. Install the **"Live Server"** extension.
3. Click the **"Go Live"** button in the bottom right corner of the window.

### Option 2: Python HTTP Server
If you have Python installed, open your terminal in this directory and run:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## 📂 Project Structure
- `index.html`: The main markup and layout.
- `styles.css`: The entire design system, variables, and responsive constraints.
- `main.js`: The brains of the operation. Contains the custom Lerp engine, Three.js robot logic, canvas drawing, and audio management.
- `Section_wise/`: Contains all the 1000+ `.png` frames used for the cinematic scroll effect, divided by section, as well as the accompanying `.mp3` audio tracks.
- `assets/`: Contains static logos and founder images.

## 📜 License
Copyright © 2026 Elamani Tech Private Limited. All rights reserved.