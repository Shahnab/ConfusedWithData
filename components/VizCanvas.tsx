
import React, { useRef, useEffect } from 'react';
import { Theme, VizType } from '../types';
import { renderers } from '../utils/renderers';

interface VizCanvasProps {
  type: VizType;
  theme: Theme;
  speed: number;
  variation?: number; 
  id: string; // Add id prop for seeding
}

export const VizCanvas: React.FC<VizCanvasProps> = ({ type, theme, speed, variation = 0, id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFn = renderers[type];
    
    // Start time reference
    let startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      // Convert to a running time float, scaled slightly
      const time = (now - startTime) * 0.001;

      // Handle resizing
      const { width, height } = container.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Clear
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw specific visualization with unique ID seed
      drawFn(ctx, width, height, time, theme, speed, variation, id);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [type, theme, speed, variation, id]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
