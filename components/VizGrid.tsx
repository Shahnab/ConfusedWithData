
import React from 'react';
import { VizLayoutItem, Theme } from '../types';
import { VizCanvas } from './VizCanvas';

interface VizGridProps {
  layout: VizLayoutItem[];
  theme: Theme;
  speed: number;
}

export const VizGrid: React.FC<VizGridProps> = ({ layout, theme, speed }) => {
  return (
    <div 
      className="w-full h-screen grid grid-flow-dense auto-rows-[minmax(120px,1fr)] gap-[1px] overflow-hidden"
      style={{
        backgroundColor: `${theme.grid}40`, // 40% opacity for lines, more subtle
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      }}
    >
      {layout.map((item) => (
        <div
          key={item.id}
          className="relative flex flex-col overflow-hidden group min-h-[100px]"
          style={{
            gridColumn: `span ${item.colSpan}`,
            gridRow: `span ${item.rowSpan}`,
            backgroundColor: theme.bg
          }}
        >
          <VizCanvas 
            type={item.type} 
            theme={theme} 
            speed={speed} 
            variation={item.variation}
            id={item.id} // Pass ID for unique seeding
          />
          
          {/* Metadata Overlay */}
          <div 
            className="absolute top-2 left-2 font-mono text-[9px] uppercase opacity-40 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none tracking-widest"
            style={{ color: theme.fg }}
          >
            {item.label}
          </div>
          
          {/* Decorative Corner */}
          {item.variation > 0.75 && (
             <div className="absolute bottom-0 right-0 w-2 h-2 border-t border-l opacity-30" 
                  style={{ borderColor: theme.fg }} />
          )}
        </div>
      ))}
    </div>
  );
};
