# Confused with Data Dashboard

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Shahnab.ConfusedWithData)
[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://shahnab.github.io/ConfusedWithData/)

> Confusion dashboard: too many metrics to track and then cannot decide what to do

A procedural retro-futuristic data visualization engine that generates infinite, unique bento-grid layouts filled with animated data visualizations. Perfect for when you want to feel overwhelmed by metrics in style.

**Live Demo:** [https://shahnab.github.io/ConfusedWithData/](https://shahnab.github.io/ConfusedWithData/)

## ✨ Features

- **15+ Visualization Types**: Sine waves, bar charts, gauges, radar plots, line graphs, matrices, cubes, binary streams, hex dumps, scatter plots, and more
- **12 Themes**: From engineering blueprints to vaporwave aesthetics
- **4 Data Contexts**: Aerospace telemetry, server infrastructure, market analytics, and bio-metrics
- **Infinite Grid**: Dynamically generated bento-grid layouts that adapt to your viewport
- **Real-time Animation**: All visualizations update in real-time with smooth transitions
- **Auto Mode**: Sit back and let the dashboard shuffle through themes and layouts automatically

## 🎮 Dashboard Controls

The control module at the bottom of the screen provides the following options:

### 🎲 Mix
Regenerates the entire grid layout with new randomized visualizations. Creates a completely fresh dashboard arrangement.

### 🎨 Theme
Cycles through 12 unique visual themes:
- **ENGINEERING** - Clean light gray with red accents
- **BLUEPRINT** - Classic blue with yellow highlights
- **TERMINAL** - Green phosphor on black
- **MIDNIGHT** - Dark theme with subtle grays
- **PAPER** - Warm off-white with red accents
- **BRAUN** - Industrial dark with yellow
- **VAPORWAVE** - Purple and cyan retro aesthetic
- **FOREST** - Dark green nature-inspired palette
- **MONOCHROME** - Stark black and white
- **SOLARIS** - Dark cyan base with warm accents
- **NEON GRID** - Electric blue and lime on dark
- **ACID PROTOCOL** - Black with bright neon green and magenta

### 💾 Data
Switches between 4 data contexts, changing all labels and metrics:
- **AEROSPACE TELEMETRY** - Flight data (altitude, pitch, yaw, thrust, etc.)
- **SERVER INFRASTRUCTURE** - System metrics (CPU, memory, I/O, latency, etc.)
- **MARKET ANALYTICS** - Financial data (NASDAQ, volatility, ROI, volume, etc.)
- **BIO-METRICS** - Health monitoring (BPM, SPO2, blood pressure, glucose, etc.)

### ⚡ Speed
Toggles animation speed between three levels:
- **SLOW** - Relaxed pace for detailed observation
- **NORMAL** - Balanced speed (default)
- **FAST** - Rapid updates for maximum data confusion

### 🔄 Mode
Switches between manual and automatic modes:
- **MANUAL** - You control all changes via buttons
- **AUTO** - Dashboard automatically shuffles themes and layouts every 8 seconds

### ℹ️ Info
Opens the about panel with project information and credits.

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shahnab/ConfusedWithData.git
   cd ConfusedWithData
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Canvas API** - Real-time rendering
- **Lucide React** - Icon system
- **Tailwind CSS** - Styling

## 📊 Visualization Types

The dashboard includes 15 different visualization types, each with 4 variations:

1. **Sine Wave** - Smooth oscillating waveforms
2. **Bar Chart** - Vertical bar graphs
3. **Gauge** - Circular progress indicators
4. **Radar** - Multi-axis radar plots
5. **Line Graph** - Connected line charts
6. **Matrix** - Grid-based heatmaps
7. **Cube** - 3D rotating cubes
8. **Binary** - Streaming binary data
9. **Hex Dump** - Hexadecimal data streams
10. **Scatter Plot** - Point distribution graphs
11. **Waveform** - Audio-style waveforms
12. **Grid** - Tile-based visualizations
13. **Ring** - Concentric circle graphs
14. **Spiral** - Radial spiral patterns
15. **Noise** - Perlin noise fields

## 🎨 Customization

Want to add your own theme or data context? Edit:

- `constants.ts` - Add new themes, contexts, or speed levels
- `utils/renderers.ts` - Create new visualization types
- `types.ts` - Define new data structures

## 📝 License

MIT License - feel free to use and modify as needed.

## 👤 Created By

**Shahnab Ahmed**  
[LinkedIn](https://www.linkedin.com/in/shahnabahmed/)

---

*Built with React + Canvas API for maximum confusion and aesthetic pleasure.*
