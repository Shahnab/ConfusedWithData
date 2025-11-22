
import React from 'react';
import { Shuffle, Palette, Database, Gauge, Repeat, Info } from 'lucide-react';

interface ControlModuleProps {
  onShuffle: () => void;
  onTheme: () => void;
  onSource: () => void;
  onSpeed: () => void;
  onMode: () => void;
  onAbout: () => void;
  speedLabel: string;
  modeLabel: string;
}

const ControlButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
}> = ({ onClick, icon, label, active }) => (
  <button
    onClick={onClick}
    className={`
      group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
      ${active ? 'bg-white/20 text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}
    `}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="text-[8px] font-mono uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-4 bg-black/80 px-1 rounded border border-white/10">
      {label}
    </span>
  </button>
);

export const ControlModule: React.FC<ControlModuleProps> = ({
  onShuffle, onTheme, onSource, onSpeed, onMode, onAbout, speedLabel, modeLabel
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="
        flex items-center gap-1 p-2
        bg-[#050505]/80 backdrop-blur-2xl
        border border-white/5
        rounded-full shadow-2xl
      ">
        <ControlButton 
          onClick={onShuffle} 
          icon={<Shuffle size={18} strokeWidth={1.5} />} 
          label="Mix" 
        />
        <ControlButton 
          onClick={onTheme} 
          icon={<Palette size={18} strokeWidth={1.5} />} 
          label="Theme" 
        />
        <ControlButton 
          onClick={onSource} 
          icon={<Database size={18} strokeWidth={1.5} />} 
          label="Data" 
        />
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <ControlButton 
          onClick={onSpeed} 
          icon={<Gauge size={18} strokeWidth={1.5} />} 
          label={speedLabel}
          active={speedLabel === 'FAST'}
        />
        <ControlButton 
          onClick={onMode} 
          icon={<Repeat size={18} strokeWidth={1.5} />} 
          label={modeLabel}
          active={modeLabel === 'AUTO'}
        />
        
        <div className="w-px h-6 bg-white/10 mx-1" />

        <ControlButton 
          onClick={onAbout} 
          icon={<Info size={18} strokeWidth={1.5} />} 
          label="Info" 
        />
      </div>
    </div>
  );
};
