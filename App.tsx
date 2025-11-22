
import React, { useState, useEffect, useCallback } from 'react';
import { VizGrid } from './components/VizGrid';
import { ControlModule } from './components/ControlModule';
import { THEMES, CONTEXTS, SPEED_LEVELS, VIZ_TYPES_LIST } from './constants';
import { VizLayoutItem, VizType } from './types';
import { X } from 'lucide-react';

// Helper to get a random array element
const rndArr = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const App: React.FC = () => {
  // --- State ---
  const [themeIndex, setThemeIndex] = useState(0);
  const [contextIndex, setContextIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [layout, setLayout] = useState<VizLayoutItem[]>([]);

  const currentTheme = THEMES[themeIndex];
  const currentContext = CONTEXTS[contextIndex];
  const currentSpeed = SPEED_LEVELS[speedIndex];

  // --- Layout Generation ---
  const generateLayout = useCallback(() => {
    const viewportArea = window.innerWidth * window.innerHeight;
    // Decrease approximate cell area slightly to increase density
    const approxCellArea = 100 * 100; 
    // Generate extra items to ensure overflow and no whitespace
    const targetCount = Math.ceil(viewportArea / approxCellArea * 1.8);
    const itemCount = Math.max(40, targetCount);

    const newLayout: VizLayoutItem[] = [];
    
    // Track used variation buckets (0, 1, 2, 3) for each VizType to prevent visual repetition
    const usedVariations = new Map<VizType, number[]>();

    // Type Deck to ensure we cycle through all VizTypes
    let typeDeck: VizType[] = [];
    const getNextType = () => {
      if (typeDeck.length === 0) {
        // Refill deck
        typeDeck = [...VIZ_TYPES_LIST, ...VIZ_TYPES_LIST].sort(() => Math.random() - 0.5);
      }
      return typeDeck.pop() as VizType;
    };

    // Smart Variation Picker: distributes variations across 4 quadrants (0.0-0.25, 0.25-0.5, etc.)
    const getSmartVariation = (type: VizType): number => {
        const used = usedVariations.get(type) || [];
        
        // 4 Buckets for maximum variety (matching the 4 modes in renderers)
        const buckets = [0, 1, 2, 3];
        
        // Filter out recently used buckets
        let available = buckets.filter(b => !used.includes(b));
        if (available.length === 0) {
            available = buckets; // Reset if all used
            usedVariations.set(type, []);
        }
        
        const bucket = rndArr(available);
        
        // Mark bucket as used
        const newUsed = usedVariations.get(type) || [];
        newUsed.push(bucket);
        usedVariations.set(type, newUsed);
        
        // Generate a specific float within that bucket range (e.g., 0.25 to 0.5)
        // bucket 0: 0.00 - 0.25
        // bucket 1: 0.25 - 0.50
        // ...
        const base = bucket * 0.25;
        const noise = Math.random() * 0.25; 
        return base + noise;
    };

    for (let i = 0; i < itemCount; i++) {
      const r = Math.random();
      let colSpan = 1;
      let rowSpan = 1;
      
      // Randomized grid spanning
      if (r > 0.94) { colSpan = 2; rowSpan = 2; }
      else if (r > 0.88) { colSpan = 2; }
      else if (r > 0.82) { rowSpan = 2; }

      const type = getNextType();

      newLayout.push({
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        colSpan,
        rowSpan,
        label: `${rndArr(currentContext.labels)} ${rndInt(1, 99)}`,
        variation: getSmartVariation(type)
      });
    }
    setLayout(newLayout);
  }, [currentContext]);

  // Initial load
  useEffect(() => {
    generateLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const handleShuffle = () => generateLayout();
  const handleTheme = () => setThemeIndex((prev) => (prev + 1) % THEMES.length);
  const handleSource = () => {
    setContextIndex((prev) => (prev + 1) % CONTEXTS.length);
  };
  
  useEffect(() => {
      generateLayout();
  }, [contextIndex, generateLayout]);

  const handleSpeed = () => setSpeedIndex((prev) => (prev + 1) % SPEED_LEVELS.length);
  const handleMode = () => setIsAutoMode((prev) => !prev);

  // --- Auto Mode Logic ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const updateRandomCell = () => {
      if (!isAutoMode) return;

      setLayout((prevLayout) => {
        if (prevLayout.length === 0) return prevLayout;
        const idx = rndInt(0, prevLayout.length - 1);
        const newLayout = [...prevLayout];
        
        const currentType = newLayout[idx].type;
        // Pick a new type that is different from the current one
        let newType = rndArr(VIZ_TYPES_LIST);
        while (newType === currentType && VIZ_TYPES_LIST.length > 1) {
            newType = rndArr(VIZ_TYPES_LIST);
        }

        newLayout[idx] = {
          ...newLayout[idx],
          type: newType,
          label: `${rndArr(currentContext.labels)} ${rndInt(1, 99)}`,
          // Completely random variation for single updates
          variation: Math.random() 
        };
        return newLayout;
      });

      const delay = rndInt(100, 600); // Faster updates for more "alive" feel
      timeout = setTimeout(updateRandomCell, delay);
    };

    if (isAutoMode) {
      updateRandomCell();
    }

    return () => clearTimeout(timeout);
  }, [isAutoMode, currentContext]);

  return (
    <div 
      className="w-screen h-screen overflow-hidden relative transition-colors duration-500"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.fg }}
    >
      {/* Grid Layer */}
      <VizGrid 
        layout={layout} 
        theme={currentTheme} 
        speed={currentSpeed.value} 
      />

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-10"
           style={{ 
             background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
             backgroundSize: '100% 4px'
           }} 
      />

      {/* UI Layer */}
      <ControlModule 
        onShuffle={handleShuffle}
        onTheme={handleTheme}
        onSource={handleSource}
        onSpeed={handleSpeed}
        onMode={handleMode}
        onAbout={() => setShowAbout(true)}
        speedLabel={currentSpeed.label}
        modeLabel={isAutoMode ? 'AUTO' : 'MANUAL'}
      />

      {/* Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] p-8 rounded-3xl max-w-sm w-full relative shadow-2xl transform transition-all scale-100">
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-4 font-sans tracking-tight">Confused with data dashboard</h2>
            <p className="font-mono text-xs text-gray-400 leading-relaxed mb-6">
              Confusion dashboard: too many metrics to track and then cannot decide what to do
            </p>
            
            <div className="border-t border-[#333] pt-4 text-[10px] font-mono text-gray-500 space-y-1">
              <div>Built with React + Canvas</div>
              <div>Created by <a href="https://www.linkedin.com/in/shahnabahmed/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-dotted transition-colors">Shahnab</a></div>
              <div>2025 Edition</div>
              <div className="mt-3 flex justify-center">
                <img alt="Visitors" className="opacity-70 hover:opacity-100 transition-opacity" src="https://visitor-badge.laobi.icu/badge?page_id=Shahnab.ConfusedWithData" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
