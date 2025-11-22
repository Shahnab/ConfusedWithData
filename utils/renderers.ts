

import { Theme, VizType } from '../types';

type DrawFn = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  time: number, 
  theme: Theme, 
  speed: number,
  variation: number,
  id: string
) => void;

// Helper: Draw a subtle background grid
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: Theme, rows = 3, cols = 3, dashed = false) => {
  ctx.save();
  ctx.strokeStyle = `${theme.grid}80`; // Slightly more transparent
  ctx.lineWidth = 0.5;
  if (dashed) ctx.setLineDash([2, 4]);
  ctx.beginPath();
  for (let i = 1; i < rows; i++) {
    const y = (height / rows) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  for (let i = 1; i < cols; i++) {
    const x = (width / cols) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.stroke();
  ctx.restore();
};

// Generate a consistent pseudo-random number 0-1 from a string ID
const stringToHash = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) / 4294967296);
};

// Helper to extract nuanced parameters from variation + ID
const getParams = (v: number, id: string) => {
    const seed = stringToHash(id); // 0.0 - 1.0 deterministic seed
    const mode = Math.floor(v * 4); // 0, 1, 2, 3
    const t = (v * 4) % 1; // 0.0 - 1.0 within the mode
    
    return { 
        mode, 
        t, 
        seed,
        // Shift time based on seed so identical graphs aren't synced
        phase: seed * 1000,
        // Visual properties derived from seed
        freq: 0.5 + seed * 1.5,
        density: 0.2 + seed * 0.8,
        bool: seed > 0.5
    };
};

export const renderers: Record<VizType, DrawFn> = {
  [VizType.Sine]: (ctx, w, h, time, theme, speed, variation, id) => {
    const { mode, t, seed, phase } = getParams(variation, id);
    const factor = speed * (500 + t * 1000);
    const amp = h * (0.3 + seed*0.15);
    const localTime = time + phase;
    
    ctx.beginPath();
    
    if (mode === 0) {
        // Digital Steps
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 1.5;
        const step = 5 + Math.floor(seed * 15);
        for (let x = 0; x < w; x += step) {
            const y = h/2 + Math.sin(x * 0.05 + localTime * factor/500) * amp;
            const qY = Math.round(y / 10) * 10; // Quantize Y
            ctx.lineTo(x, qY);
            ctx.lineTo(x + step, qY);
        }
        ctx.stroke();
        drawGrid(ctx, w, h, theme, 2, 4, true);
    } else if (mode === 1) {
        // Interference / Noise
        ctx.strokeStyle = theme.fg;
        ctx.lineWidth = 0.5 + seed;
        const layers = 2 + Math.floor(t * 2);
        for(let l=0; l<layers; l++) {
             ctx.beginPath();
             for(let x=0; x<w; x+=3) {
                 const y = h/2 + Math.sin(x*(0.02+seed*0.01) + localTime*2 + l) * amp 
                               + Math.cos(x*0.05 - localTime) * (amp*0.5);
                 ctx.lineTo(x, y);
             }
             ctx.stroke();
        }
    } else if (mode === 2) {
        // Dotted Flow
        const gap = 5 + seed*15;
        ctx.fillStyle = theme.accent;
        for(let x=0; x<w; x+=gap) {
            const y = h/2 + Math.sin(x*0.03 + localTime*5)*amp;
            const r = 1.5 + Math.sin(x*0.1 + localTime)*1;
            if(r > 0.5) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill(); }
        }
    } else {
        // Filled Area
        ctx.fillStyle = `${theme.fg}${Math.floor(20 + seed*40).toString(16)}`; 
        ctx.beginPath();
        ctx.moveTo(0, h);
        for(let x=0; x<=w; x+=2) ctx.lineTo(x, h/2 + Math.sin(x*0.04 + localTime*4)*amp);
        ctx.lineTo(w, h);
        ctx.fill();
        ctx.strokeStyle=theme.fg; ctx.lineWidth=1; ctx.stroke();
    }
  },

  [VizType.Bars]: (ctx, w, h, time, theme, speed, variation, id) => {
    const { mode, t, seed, phase } = getParams(variation, id);
    const localTime = time + phase;

    if (mode === 0) {
        // Horizontal Progress Stack
        const count = 4 + Math.floor(seed * 8);
        const barH = h / count;
        for (let i = 0; i < count; i++) {
            const val = (Math.sin(i * 0.5 + localTime * 2) + 1) / 2;
            const barW = val * w * 0.9;
            ctx.fillStyle = i % 2 === 0 ? theme.accent : `${theme.fg}33`;
            ctx.fillRect(0, i * barH + 2, barW, barH - 4);
        }
    } else if (mode === 1) {
        // Vertical EQ
        const count = 10 + Math.floor(seed*20);
        const barW = w / count;
        for (let i = 0; i < count; i++) {
            let val = Math.abs(Math.sin(i * (0.2+t*0.1) + localTime * 5));
            const barH = val * h * 0.8;
            ctx.fillStyle = val > (0.6 + t*0.3) ? theme.accent : theme.fg;
            ctx.fillRect(i * barW + 1, h - barH, barW - 2, barH);
        }
    } else if (mode === 2) {
        // Center Out
        const count = 8 + Math.floor(seed*8);
        const barW = w / count;
        ctx.fillStyle = theme.fg;
        for (let i = 0; i < count; i++) {
            let val = Math.abs(Math.cos(i*0.5 + localTime * 3)) * 0.6;
            const barH = val * h;
            ctx.fillRect(i * barW + 2, h/2 - barH/2, barW - 4, barH);
        }
        ctx.fillStyle = theme.accent;
        ctx.fillRect(0, h/2, w, 1);
    } else {
        // Binary Grid Block
        const cols = 6 + Math.floor(seed*4);
        const rows = 4 + Math.floor(seed*4);
        const cw = w/cols;
        const ch = h/rows;
        for(let x=0; x<cols; x++) {
            for(let y=0; y<rows; y++) {
                // Randomized blink per cell based on time
                const blink = Math.sin(x*123 + y*45 + localTime*5) > 0.8;
                if (blink) {
                    ctx.fillStyle = theme.accent;
                    ctx.fillRect(x*cw+2, y*ch+2, cw-4, ch-4);
                } else {
                     ctx.fillStyle = `${theme.fg}11`;
                     ctx.fillRect(x*cw+4, y*ch+4, cw-8, ch-8);
                }
            }
        }
    }
  },

  [VizType.Gauge]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      const r = Math.min(w,h) * 0.35;
      const val = (Math.sin(localTime * speed * 800) + 1) / 2;
      
      if (mode === 0) {
          // Arc with Needle
          ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0);
          ctx.lineWidth = 4; ctx.strokeStyle = `${theme.fg}33`; ctx.stroke();
          const angle = Math.PI + (val * Math.PI);
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
          ctx.lineWidth = 2; ctx.strokeStyle = theme.accent; ctx.stroke();
          // Add random ticks
          const ticks = 5;
          for(let i=0; i<=ticks; i++) {
             const a = Math.PI + (i/ticks)*Math.PI;
             ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
             ctx.lineTo(cx+Math.cos(a)*(r+5), cy+Math.sin(a)*(r+5));
             ctx.stroke();
          }

      } else if (mode === 1) {
          // Circle Spinner
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
          ctx.lineWidth = 2; ctx.strokeStyle = `${theme.fg}22`; ctx.stroke();
          
          const start = localTime * (1 + seed);
          const len = 1 + val * 2;
          ctx.beginPath(); ctx.arc(cx, cy, r, start, start + len);
          ctx.lineWidth = 3 + seed*3; ctx.strokeStyle = theme.fg; ctx.stroke();
          
          ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
      } else if (mode === 2) {
          // Crosshair Target
          drawGrid(ctx, w, h, theme, 2, 2, true);
          const dr = r * (0.8 + Math.sin(localTime*5)*0.05);
          ctx.beginPath(); ctx.arc(cx, cy, dr, 0, Math.PI*2);
          ctx.strokeStyle = theme.accent; ctx.lineWidth=1; ctx.stroke();
          // Ticks
          for(let i=0; i<4; i++) {
             const a = i * Math.PI/2 + (seed > 0.5 ? Math.PI/4 : 0);
             ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(dr-5), cy+Math.sin(a)*(dr-5));
             ctx.lineTo(cx+Math.cos(a)*(dr+5), cy+Math.sin(a)*(dr+5));
             ctx.stroke();
          }
      } else {
          // Horizontal Bar
          const barW = w * 0.7;
          const barH = 6 + seed*4;
          ctx.fillStyle = `${theme.fg}22`;
          ctx.fillRect((w-barW)/2, h/2 - barH/2, barW, barH);
          ctx.fillStyle = theme.fg;
          ctx.fillRect((w-barW)/2, h/2 - barH/2, barW * val, barH);
          // Marker
          ctx.fillStyle = theme.accent;
          ctx.fillRect((w-barW)/2 + barW*val - 1, h/2 - (barH/2 + 2), 2, barH + 4);
      }
  },

  [VizType.Radar]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      const r = Math.min(w,h)*0.35;
      const sides = 3 + Math.floor(seed * 5); // 3 to 8 sides
      
      const drawPoly = (rad: number, style: string | CanvasGradient | CanvasPattern) => {
          ctx.beginPath();
          for(let i=0; i<=sides; i++) {
              const ang = i * (Math.PI*2/sides) - Math.PI/2;
              i===0 ? ctx.moveTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad) 
                    : ctx.lineTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad);
          }
          ctx.closePath();
          if (typeof style === 'string') {
             ctx.strokeStyle = style; ctx.stroke();
          }
      };

      if (mode === 0) {
          // Concentric
          for(let i=1; i<=3; i++) drawPoly(r * (i/3), `${theme.fg}33`);
          // Pulse
          const pr = r * ((Math.sin(localTime*3)+1)/2 * 0.3 + 0.7);
          ctx.strokeStyle = theme.accent; ctx.lineWidth=2;
          drawPoly(pr, theme.accent);
      } else if (mode === 1) {
          // Scan Line
          drawPoly(r, theme.fg);
          const ang = localTime * speed * 1000;
          ctx.beginPath(); ctx.moveTo(cx,cy); 
          ctx.lineTo(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r); 
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else if (mode === 2) {
        // Filled shape varying
        ctx.fillStyle = `${theme.fg}11`;
        ctx.beginPath();
        for(let i=0; i<=sides; i++) {
            const ang = i * (Math.PI*2/sides);
            const d = r * (0.6 + Math.sin(localTime*3 + i*2)*0.4);
            i===0 ? ctx.moveTo(cx + Math.cos(ang)*d, cy + Math.sin(ang)*d) 
                  : ctx.lineTo(cx + Math.cos(ang)*d, cy + Math.sin(ang)*d);
        }
        ctx.closePath();
        ctx.fill(); ctx.strokeStyle=theme.fg; ctx.stroke();
      } else {
          // Points only
          for(let i=0; i<sides; i++) {
              const ang = i * (Math.PI*2/sides) - Math.PI/2 + localTime;
              const px = cx + Math.cos(ang)*r;
              const py = cy + Math.sin(ang)*r;
              ctx.fillStyle = i%2===0 ? theme.accent : theme.fg;
              ctx.fillRect(px-2, py-2, 4, 4);
          }
          // Center connection
          ctx.strokeStyle = `${theme.fg}22`;
          ctx.beginPath();
          for(let i=0; i<sides; i++) {
            const ang = i * (Math.PI*2/sides) - Math.PI/2 + localTime;
            ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
          }
          ctx.stroke();
      }
  },

  [VizType.Line]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const pts = 10 + Math.floor(seed*30);
      const step = w/pts;
      const factor = speed * 500;
      
      ctx.beginPath();
      
      if (mode === 0) {
          // Smooth Area
          ctx.moveTo(0, h);
          for(let i=0; i<=pts; i++) {
              const n = (Math.sin(i*(0.3+seed*0.1) + localTime*factor) + 1)/2;
              ctx.lineTo(i*step, h - (n*h*0.6 + 10));
          }
          ctx.lineTo(w, h);
          ctx.fillStyle = `${theme.fg}11`; ctx.fill();
          ctx.strokeStyle = theme.fg; ctx.stroke();
      } else if (mode === 1) {
          // Stepped Line
          let py = h/2;
          ctx.moveTo(0, py);
          for(let i=0; i<=pts; i++) {
              const n = Math.sin(i*(0.8+seed*0.2) + localTime*factor);
              const y = h/2 + n * h * 0.3;
              ctx.lineTo(i*step, py);
              ctx.lineTo(i*step, y);
              py = y;
          }
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else if (mode === 2) {
          // Vertical Sticks
          for(let i=0; i<=pts; i++) {
              const n = Math.abs(Math.sin(i*0.5 + localTime*factor));
              const len = n * h * 0.8;
              ctx.moveTo(i*step, h);
              ctx.lineTo(i*step, h - len);
          }
          ctx.strokeStyle = theme.fg; ctx.lineWidth=1.5; ctx.stroke();
      } else {
          // Scatter Line
          ctx.fillStyle = theme.accent;
          for(let i=0; i<=pts; i++) {
              const y = h/2 + Math.sin(i*0.5 + localTime*factor) * (h*0.35);
              ctx.fillRect(i*step - 1, y-1, 3, 3);
          }
      }
  },

  [VizType.Matrix]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const fs = 8 + Math.floor(seed * 6);
      ctx.font = `${fs}px 'JetBrains Mono'`;
      const cols = Math.ceil(w/fs);
      const rows = Math.ceil(h/fs);
      
      if (mode === 0) {
          // Rain
          ctx.fillStyle = theme.accent;
          for(let i=0; i<cols; i++) {
              if (i%2!==0) continue; // Spacer
              const dropY = (Math.floor(localTime * (15 + i%10)) + i*20) % (rows + 10);
              if (dropY < rows) ctx.fillText(String.fromCharCode(0x30A0 + i%30), i*fs, dropY*fs);
          }
      } else if (mode === 1) {
          // Static Noise
          for(let y=0; y<rows; y++) {
              for(let x=0; x<cols; x++) {
                  if (Math.random() > (0.95 - seed*0.05)) {
                      ctx.fillStyle = Math.random() > 0.5 ? theme.fg : `${theme.fg}44`;
                      ctx.fillText(Math.random() > 0.5 ? "1" : "0", x*fs, y*fs);
                  }
              }
          }
      } else if (mode === 2) {
          // Blocks
          const bs = fs - 2;
          for(let y=0; y<rows; y++) {
              for(let x=0; x<cols; x++) {
                  const n = Math.sin(x*0.2 + y*0.2 + localTime);
                  if(n > 0.6) {
                      ctx.fillStyle = `${theme.fg}22`;
                      ctx.fillRect(x*fs+1, y*fs+1, bs, bs);
                  }
              }
          }
      } else {
          // Streaming Horizontal
          ctx.fillStyle = theme.fg;
          const txt = `DATA_STREAM_${id.toUpperCase().slice(0,6)}_`;
          const offset = Math.floor(localTime * 10);
          for(let y=0; y<rows; y+=2) {
               ctx.fillText(txt.substring((offset+y)%txt.length, (offset+y)%txt.length + 15), 0, y*fs + 10);
          }
      }
  },

  [VizType.Cube]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2, s = Math.min(w,h)*0.3;
      const rotT = localTime * speed * 1000; // Rotation
      
      // 3D Projector
      const proj = (x: number, y: number, z: number) => {
          // Rot Y
          let x1 = x*Math.cos(rotT) - z*Math.sin(rotT);
          let z1 = x*Math.sin(rotT) + z*Math.cos(rotT);
          // Rot X
          let y2 = y*Math.cos(rotT*0.5) - z1*Math.sin(rotT*0.5);
          let z2 = y*Math.sin(rotT*0.5) + z1*Math.cos(rotT*0.5);
          const scale = 2 / (2 + z2*0.5); 
          return { x: cx + x1*s*scale, y: cy + y2*s*scale };
      };

      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      const pts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];

      if (mode === 3) {
          // Particles
          const count = 20 + Math.floor(seed*10);
          for(let i=0; i<count; i++) {
              const p = proj(
                  Math.sin(i*132 + rotT)*1.5,
                  Math.cos(i*43 + rotT)*1.5,
                  Math.sin(i*12)*1.5
              );
              ctx.fillStyle = i%3===0 ? theme.accent : theme.fg;
              ctx.fillRect(p.x-1, p.y-1, 3, 3);
          }
      } else {
          // Wireframe
          ctx.strokeStyle = mode===0 ? theme.fg : mode===1 ? theme.accent : `${theme.fg}66`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          edges.forEach(e => {
              const p1 = proj(pts[e[0]][0], pts[e[0]][1], pts[e[0]][2]);
              const p2 = proj(pts[e[1]][0], pts[e[1]][1], pts[e[1]][2]);
              ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          });
          ctx.stroke();
          
          if (mode === 2) {
              // Fill center
              ctx.fillStyle = `${theme.fg}11`;
              ctx.beginPath();
              [0,1,2,3].forEach(i => {
                   const p = proj(pts[i][0], pts[i][1], pts[i][2]);
                   i===0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
              });
              ctx.fill();
          }
      }
  },

  [VizType.Binary]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed } = getParams(variation, id);
      const cols = 5 + Math.floor(seed*5);
      const rows = 4 + Math.floor(seed*4);
      const cw = w/cols;
      const ch = h/rows;
      
      for(let y=0; y<rows; y++) {
          for(let x=0; x<cols; x++) {
              if (Math.random() > 0.9) continue; // Gaps
              if (mode === 0) {
                  // Rects
                  ctx.fillStyle = (x+y)%2===0 ? theme.fg : `${theme.fg}33`;
                  ctx.fillRect(x*cw+2, y*ch+2, cw-4, ch-4);
              } else if (mode === 1) {
                  // Circles
                  ctx.beginPath(); ctx.arc(x*cw+cw/2, y*ch+ch/2, 2, 0, Math.PI*2);
                  ctx.fillStyle = Math.random() > 0.8 ? theme.accent : theme.fg;
                  ctx.fill();
              } else if (mode === 2) {
                  // Text 0/1
                  ctx.font = "10px monospace";
                  ctx.fillStyle = Math.random() > 0.5 ? theme.fg : `${theme.fg}55`;
                  ctx.fillText(Math.random()>0.5?"1":"0", x*cw+cw/4, y*ch+ch/1.5);
              } else {
                  // Plus signs
                  ctx.strokeStyle = `${theme.fg}44`;
                  ctx.beginPath();
                  ctx.moveTo(x*cw+cw/2, y*ch+4); ctx.lineTo(x*cw+cw/2, y*ch+ch-4);
                  ctx.moveTo(x*cw+4, y*ch+ch/2); ctx.lineTo(x*cw+cw-4, y*ch+ch/2);
                  ctx.stroke();
              }
          }
      }
  },

  [VizType.HexDump]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase } = getParams(variation, id);
      const localTime = time + phase;
      const val = Math.floor(localTime * 10000).toString(16).toUpperCase().padStart(4, '0');
      
      if(mode === 0) {
          // Center Big
          ctx.font = "bold 24px 'JetBrains Mono'";
          ctx.fillStyle = theme.fg;
          ctx.textAlign = "center";
          ctx.fillText("0x"+val, w/2, h/2+8);
          ctx.font = "9px 'JetBrains Mono'";
          ctx.fillStyle = theme.accent;
          ctx.fillText("ADDR_BUS", w/2, h/2 - 15);
      } else if (mode === 1) {
          // List
          ctx.font = "10px 'JetBrains Mono'";
          ctx.fillStyle = theme.fg;
          for(let i=0; i<5; i++) {
               ctx.fillText(`0x${val.slice(0,2)}${i}F ... ${Math.floor(Math.random()*99)}`, 5, 15 + i*14);
          }
      } else if (mode === 2) {
          // Grid of squares
          const s = 8;
          const cols = Math.floor(w/s);
          const rows = Math.floor(h/s);
          for(let y=0; y<rows; y++) {
              for(let x=0; x<cols; x++) {
                   const v = Math.floor(Math.random()*16);
                   ctx.fillStyle = v > 12 ? theme.accent : `${theme.fg}44`;
                   if(Math.random() > 0.8) ctx.fillRect(x*s, y*s, s-1, s-1);
              }
          }
      } else {
          // Key Values
          ctx.font = "10px monospace";
          ctx.fillStyle = theme.fg;
          ctx.fillText(`PID: ${val}`, 5, 20);
          ctx.fillText(`MEM: ${val.split('').reverse().join('')} Kb`, 5, 35);
          ctx.fillStyle = theme.accent;
          ctx.fillRect(5, 45, (parseInt(val.slice(-1), 16)/15)*(w-20), 4);
      }
  },

  [VizType.Scatter]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const count = 10 + Math.floor(seed * 30);
      
      for(let i=0; i<count; i++) {
          const x = (Math.sin(i + localTime*0.2)*0.4 + 0.5) * w;
          const y = (Math.cos(i*1.3 + localTime*0.3)*0.4 + 0.5) * h;
          
          if (mode === 0) {
              // Connected Lines
              if (i > 0) {
                   const px = (Math.sin((i-1) + localTime*0.2)*0.4 + 0.5) * w;
                   const py = (Math.cos((i-1)*1.3 + localTime*0.3)*0.4 + 0.5) * h;
                   if (Math.hypot(x-px, y-py) < 50) {
                       ctx.strokeStyle = `${theme.fg}44`;
                       ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(px,py); ctx.stroke();
                   }
              }
              ctx.fillStyle = theme.accent; ctx.fillRect(x-1.5, y-1.5, 3, 3);
          } else if (mode === 1) {
              // Rings
              const r = (Math.sin(localTime*2 + i)*5 + 5);
              ctx.strokeStyle = theme.fg; 
              ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
          } else if (mode === 2) {
              // Crosses
              ctx.strokeStyle = theme.fg;
              ctx.beginPath(); 
              ctx.moveTo(x-3, y); ctx.lineTo(x+3, y);
              ctx.moveTo(x, y-3); ctx.lineTo(x, y+3);
              ctx.stroke();
          } else {
              // Particles
              ctx.fillStyle = i%2===0 ? theme.fg : `${theme.fg}55`;
              ctx.fillRect(x, y, 2, 2);
          }
      }
  },

  [VizType.Spectrum]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, t, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const bands = 8 + Math.floor(seed*16);
      const bw = w/bands;
      
      for(let i=0; i<bands; i++) {
          const val = Math.abs(Math.sin(i*(0.5+seed*0.2) + localTime*speed*1500));
          const bh = val * h * 0.8;
          
          if (mode === 0) {
              // Bottom Up
              ctx.fillStyle = theme.fg;
              ctx.fillRect(i*bw + 1, h - bh, bw-2, bh);
          } else if (mode === 1) {
              // Mirrored Center
              ctx.fillStyle = `${theme.fg}66`;
              ctx.fillRect(i*bw + 1, (h-bh)/2, bw-2, bh);
          } else if (mode === 2) {
              // Top Down
              ctx.fillStyle = theme.accent;
              ctx.fillRect(i*bw + 1, 0, bw-2, bh);
          } else {
              // Line Graph
              ctx.strokeStyle = theme.fg;
              ctx.beginPath(); ctx.moveTo(i*bw, h); ctx.lineTo(i*bw+bw/2, h-bh); ctx.lineTo(i*bw+bw, h); ctx.stroke();
          }
      }
  },

  [VizType.Globe]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase, seed } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2, r = Math.min(w,h)*0.35;
      
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = theme.fg; ctx.stroke();
      
      if (mode === 0) {
          // Longitudes
          ctx.save(); ctx.clip();
          const count = 4 + Math.floor(seed*4);
          for(let i=0; i<count; i++) {
              const offset = (localTime * speed * 500 + i*(180/count)) % 180;
              const xr = r * Math.sin(offset * Math.PI/180);
              ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(xr), r, 0, 0, Math.PI*2);
              ctx.strokeStyle = `${theme.fg}44`; ctx.stroke();
          }
          ctx.restore();
      } else if (mode === 1) {
          // Latitudes
          ctx.save(); ctx.clip();
          const count = 4 + Math.floor(seed*4);
          for(let i=1; i<=count; i++) {
              const y = cy - r + (i * r*2/(count+1));
              const chord = Math.sqrt(r*r - (y-cy)*(y-cy));
              ctx.beginPath(); 
              // Simple curve effect
              ctx.moveTo(cx-chord, y); 
              ctx.quadraticCurveTo(cx, y + Math.sin(localTime)*10, cx+chord, y);
              ctx.strokeStyle = `${theme.fg}55`; ctx.stroke();
          }
          ctx.restore();
      } else if (mode === 2) {
          // Scanner
          ctx.beginPath(); ctx.moveTo(cx, cy);
          const a = localTime * speed * 1000;
          ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else {
          // Dots
          const pts = 8 + Math.floor(seed*8);
          for(let i=0; i<pts; i++) {
              const a = (i/pts)*Math.PI*2 + localTime;
              const x = cx + Math.cos(a)*r*0.7;
              const y = cy + Math.sin(a)*r*0.7;
              ctx.fillStyle = theme.fg; ctx.fillRect(x-1, y-1, 2, 2);
          }
      }
  },

  [VizType.Terminal]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase, seed } = getParams(variation, id);
      const localTime = time + phase;
      ctx.font = "9px 'JetBrains Mono'";
      ctx.fillStyle = theme.fg;
      
      if (mode === 0) {
          // Logs
          const logs = ["INIT", "READ", "WRITE", "ACK", "SYN", "FIN", "PING", "PONG"];
          const off = Math.floor(localTime*5);
          for(let i=0; i<4; i++) ctx.fillText(`> ${logs[(off+i)%logs.length]}`, 5, 20+i*12);
      } else if (mode === 1) {
          // Stats
          ctx.fillText(`CPU: ${Math.floor(Math.sin(localTime)*20+40)}%`, 5, 20);
          ctx.fillText(`MEM: ${Math.floor(Math.cos(localTime)*10+60)}%`, 5, 35);
      } else if (mode === 2) {
          // Prompt
          const blink = Math.floor(localTime*2)%2===0 ? "_" : "";
          ctx.fillText(`${id.substring(0,4)}@sys:~$ ${blink}`, 5, 30);
      } else {
          // Loading
          const p = Math.floor((localTime%2)*10);
          ctx.fillText(`LOAD [${"=".repeat(p)}]`, 5, 30);
      }
  },

  [VizType.DNA]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2;
      const f = speed * 1000;
      
      if (mode === 0) {
          // Vertical
          for(let y=10; y<h-10; y+=10) {
              const x = Math.sin(y*0.1 + localTime*f) * 15;
              ctx.fillStyle = theme.fg; ctx.fillRect(cx+x-1, y, 2, 2);
              ctx.fillStyle = theme.accent; ctx.fillRect(cx-x-1, y, 2, 2);
              ctx.strokeStyle = `${theme.fg}22`; ctx.beginPath(); ctx.moveTo(cx+x, y); ctx.lineTo(cx-x, y); ctx.stroke();
          }
      } else if (mode === 1) {
          // Single Strand
          ctx.beginPath();
          for(let x=0; x<w; x+=5) {
              const y = h/2 + Math.sin(x*0.1 + localTime*f)*15;
              x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
          }
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else if (mode === 2) {
          // Dots
          for(let i=0; i<10; i++) {
              const y = (i/10)*h;
              const x = cx + Math.sin(y*0.1 + localTime)*20;
              ctx.fillStyle = theme.fg; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
          }
      } else {
          // Blocks
          for(let y=0; y<h; y+=15) {
              const w2 = Math.abs(Math.sin(y*0.1 + localTime))*20 + 5;
              ctx.fillStyle = `${theme.fg}44`;
              ctx.fillRect(cx - w2/2, y, w2, 4);
          }
      }
  },

  [VizType.Progress]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const p = (localTime * speed * 300) % 100;
      
      if (mode === 0) {
          // Bar
          ctx.fillStyle = `${theme.fg}33`; ctx.fillRect(10, h/2-3, w-20, 6);
          ctx.fillStyle = theme.accent; ctx.fillRect(10, h/2-3, (w-20)*(p/100), 6);
      } else if (mode === 1) {
          // Circle
          const cx = w/2, cy = h/2;
          ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.strokeStyle=`${theme.fg}33`; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, 12, -Math.PI/2, -Math.PI/2 + (p/100)*Math.PI*2); ctx.strokeStyle=theme.accent; ctx.stroke();
      } else if (mode === 2) {
          // Blocks
          const segs = 5 + Math.floor(seed*3);
          const active = Math.floor((p/100)*segs);
          const sw = (w-20)/segs;
          for(let i=0; i<segs; i++) {
              ctx.fillStyle = i <= active ? theme.fg : `${theme.fg}22`;
              ctx.fillRect(10 + i*sw, h/2-4, sw-2, 8);
          }
      } else {
          // Text
          ctx.font = "12px monospace"; ctx.fillStyle = theme.fg; ctx.textAlign = "center";
          ctx.fillText(`${Math.floor(p)}%`, w/2, h/2+4);
      }
  },

  [VizType.Liquid]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      if (mode === 0) {
          // Wave in Circle
          const r = Math.min(w,h)*0.3;
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
          const lvl = Math.sin(localTime)*5;
          ctx.fillStyle = `${theme.accent}88`;
          ctx.beginPath(); ctx.moveTo(0, cy + lvl);
          for(let x=0; x<w; x+=5) ctx.lineTo(x, cy + lvl + Math.sin(x*0.1 + localTime*5)*5);
          ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
          ctx.restore();
          ctx.strokeStyle = theme.fg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
      } else if (mode === 1) {
          // Bubbles
          const count = 4 + Math.floor(seed*4);
          for(let i=0; i<count; i++) {
               const y = (localTime*30 + i*50) % h;
               const x = cx + Math.sin(y*0.1 + i)*10;
               ctx.beginPath(); ctx.arc(x, h-y, 2+(i%3), 0, Math.PI*2);
               ctx.strokeStyle = theme.fg; ctx.stroke();
          }
      } else if (mode === 2) {
          // Blob
          ctx.beginPath();
          const r = 10;
          for(let a=0; a<Math.PI*2; a+=0.2) {
              const d = r + Math.sin(a*5 + localTime*2)*3;
              a===0 ? ctx.moveTo(cx+Math.cos(a)*d, cy+Math.sin(a)*d) : ctx.lineTo(cx+Math.cos(a)*d, cy+Math.sin(a)*d);
          }
          ctx.fillStyle = `${theme.fg}66`; ctx.fill();
      } else {
          // Fill Bar
          ctx.strokeRect(cx-10, cy-15, 20, 30);
          const p = (Math.sin(localTime)+1)/2;
          ctx.fillStyle = theme.accent;
          ctx.fillRect(cx-9, cy+14 - (28*p), 18, 28*p);
      }
  },

  [VizType.Orbit]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      const f = speed * 1000;
      
      if (mode === 0) {
          // Solar
          ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();
          const r = 20;
          ctx.strokeStyle = `${theme.fg}33`; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
          const a = localTime*f;
          ctx.fillStyle = theme.fg; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r, cy+Math.sin(a)*r, 2, 0, Math.PI*2); ctx.fill();
      } else if (mode === 1) {
          // Ellipses
          for(let i=0; i<2; i++) {
              ctx.save(); ctx.translate(cx,cy); ctx.rotate(i*Math.PI/2 + 0.4);
              ctx.beginPath(); ctx.ellipse(0,0,25,8,0,0,Math.PI*2); ctx.strokeStyle = `${theme.fg}55`; ctx.stroke();
              ctx.restore();
          }
      } else if (mode === 2) {
          // Spiral
          ctx.beginPath();
          for(let i=0; i<30; i++) {
              const ang = i*0.4 + localTime;
              const r = i;
              const x = cx + Math.cos(ang)*r;
              const y = cy + Math.sin(ang)*r;
              i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
          }
          ctx.strokeStyle = theme.fg; ctx.stroke();
      } else {
          // Dual
          const r = 15;
          const a = localTime * f;
          ctx.fillStyle = theme.fg;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + Math.cos(a+Math.PI)*r, cy + Math.sin(a+Math.PI)*r, 2, 0, Math.PI*2); ctx.fill();
      }
  },

  [VizType.Seismic]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const my = h/2;
      
      if (mode === 0) {
          // Line
          ctx.beginPath();
          for(let x=0; x<w; x+=3) ctx.lineTo(x, my + (Math.random()-0.5)*10 * Math.sin(localTime*5));
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else if (mode === 1) {
          // Bars
          for(let x=0; x<w; x+=5) {
              const h2 = Math.random() * 10 * (Math.sin(localTime + x*0.1)+1);
              ctx.fillStyle = theme.fg; ctx.fillRect(x, my-h2/2, 3, h2);
          }
      } else if (mode === 2) {
          // Dots
          for(let x=0; x<w; x+=8) {
              const y = my + (Math.random()-0.5) * 15;
              ctx.fillStyle = theme.accent; ctx.fillRect(x,y,2,2);
          }
      } else {
          // Filled
          ctx.beginPath(); ctx.moveTo(0,h);
          for(let x=0; x<w; x+=4) ctx.lineTo(x, my + (Math.random()-0.5)*10);
          ctx.lineTo(w,h);
          ctx.fillStyle = `${theme.fg}33`; ctx.fill();
      }
  },

  [VizType.Network]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      if (mode === 0) {
          // Star
          const pts = 5;
          ctx.fillStyle = theme.accent; ctx.fillRect(cx-2,cy-2,4,4);
          for(let i=0; i<pts; i++) {
              const a = (i/pts)*Math.PI*2 + localTime;
              const x = cx + Math.cos(a)*20;
              const y = cy + Math.sin(a)*20;
              ctx.strokeStyle = `${theme.fg}44`; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
              ctx.fillStyle = theme.fg; ctx.fillRect(x-1,y-1,2,2);
          }
      } else if (mode === 1) {
          // Triangle
          const pts = [{x:cx,y:cy-15}, {x:cx-15,y:cy+10}, {x:cx+15,y:cy+10}];
          ctx.strokeStyle = theme.fg; ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y); ctx.closePath(); ctx.stroke();
          ctx.fillStyle = theme.accent; pts.forEach(p => ctx.fillRect(p.x-1, p.y-1, 2, 2));
      } else if (mode === 2) {
          // Random
          const count = 4 + Math.floor(seed*3);
          for(let i=0; i<count; i++) {
              const x = (Math.sin(i + localTime)*0.3 + 0.5) * w;
              const y = (Math.cos(i + localTime)*0.3 + 0.5) * h;
              ctx.fillStyle = theme.fg; ctx.fillRect(x,y,3,3);
          }
      } else {
          // Tree
          ctx.strokeStyle = theme.fg;
          ctx.beginPath(); ctx.moveTo(cx, h-5); ctx.lineTo(cx, h-20);
          ctx.lineTo(cx-10, h-30); ctx.moveTo(cx, h-20); ctx.lineTo(cx+10, h-30);
          ctx.stroke();
      }
  },

  [VizType.GridMap]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const s = 8;
      const cols = Math.ceil(w/s);
      const rows = Math.ceil(h/s);
      
      for(let y=0; y<rows; y++) {
          for(let x=0; x<cols; x++) {
              const n = Math.sin(x*0.3 + y*0.3 + localTime);
              if (mode === 0) {
                  // Heatmap
                  if(n > 0.5) {
                       ctx.fillStyle = `${theme.accent}${Math.floor(n*9)}9`;
                       ctx.fillRect(x*s, y*s, s, s);
                  }
              } else if (mode === 1) {
                  // Outline
                  if(n > 0.8) {
                      ctx.strokeStyle = theme.fg;
                      ctx.strokeRect(x*s+1, y*s+1, s-2, s-2);
                  }
              } else if (mode === 2) {
                  // Dots
                  if(Math.random() > 0.95) {
                      ctx.fillStyle = theme.fg;
                      ctx.fillRect(x*s+2, y*s+2, 2, 2);
                  }
              } else {
                  // Checker
                  if((x+y)%2===0 && n>0) {
                      ctx.fillStyle = `${theme.fg}22`;
                      ctx.fillRect(x*s, y*s, s, s);
                  }
              }
          }
      }
  },

  [VizType.Timer]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase } = getParams(variation, id);
      const localTime = time + phase;
      ctx.fillStyle = theme.fg;
      ctx.textAlign = "center";
      
      if (mode === 0) {
          // 00:00
          const s = Math.floor(localTime % 60).toString().padStart(2, '0');
          const ms = Math.floor((localTime%1)*100).toString().padStart(2, '0');
          ctx.font = "bold 16px monospace";
          ctx.fillText(`${s}:${ms}`, w/2, h/2+5);
      } else if (mode === 1) {
          // Circle
          const cx = w/2, cy = h/2;
          ctx.strokeStyle = `${theme.fg}44`; ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI*2); ctx.stroke();
          ctx.strokeStyle = theme.accent; ctx.beginPath(); ctx.arc(cx,cy,10,-Math.PI/2, -Math.PI/2 + (localTime%1)*Math.PI*2); ctx.stroke();
      } else if (mode === 2) {
          // Bar
          ctx.fillRect(10, h/2-2, (w-20) * (localTime%1), 4);
      } else {
          // Count
          ctx.font = "14px monospace";
          ctx.fillText(Math.floor(localTime*10).toString(), w/2, h/2+5);
      }
  },

  [VizType.Swirl]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase, seed } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      ctx.beginPath();
      if (mode === 0) {
          // Spiral
          for(let i=0; i<30; i++) {
              const a = i*0.3 + localTime*2;
              const r = i*1.5;
              const x = cx + Math.cos(a)*r;
              const y = cy + Math.sin(a)*r;
              i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
          }
          ctx.strokeStyle = theme.fg; ctx.stroke();
      } else if (mode === 1) {
          // Circles
          for(let i=1; i<4; i++) {
              const r = i * 8 + Math.sin(localTime*2)*2;
              ctx.moveTo(cx+r, cy); ctx.arc(cx, cy, r, 0, Math.PI*2);
          }
          ctx.strokeStyle = `${theme.accent}66`; ctx.stroke();
      } else if (mode === 2) {
          // Hypno
           for(let i=0; i<20; i++) {
               const r = i*2;
               const a = i*0.5 - localTime*2;
               ctx.rect(cx + Math.cos(a)*r, cy + Math.sin(a)*r, 1, 1);
           }
           ctx.fillStyle = theme.fg; ctx.fill();
      } else {
          // Star burst
          for(let i=0; i<8; i++) {
              const a = i * (Math.PI/4) + localTime;
              ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*20, cy + Math.sin(a)*20);
          }
          ctx.strokeStyle = theme.fg; ctx.stroke();
      }
  },

  [VizType.Pyramid]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2 + 10;
      
      if (mode === 0) {
          // Stack
          for(let i=0; i<3; i++) {
              const y = cy - i*8;
              const w2 = (3-i)*8;
              ctx.strokeStyle = theme.fg; ctx.strokeRect(cx-w2, y, w2*2, 6);
          }
      } else if (mode === 1) {
          // Triangle
          ctx.beginPath(); ctx.moveTo(cx, cy-20); ctx.lineTo(cx+15, cy); ctx.lineTo(cx-15, cy); ctx.closePath();
          ctx.strokeStyle = theme.accent; ctx.stroke();
      } else if (mode === 2) {
          // Inverted
          ctx.beginPath(); ctx.moveTo(cx-10, cy-20); ctx.lineTo(cx+10, cy-20); ctx.lineTo(cx, cy); ctx.closePath();
          ctx.fillStyle = `${theme.fg}44`; ctx.fill();
      } else {
          // Eye
          ctx.beginPath(); ctx.moveTo(cx, cy-20); ctx.lineTo(cx+15, cy); ctx.lineTo(cx-15, cy); ctx.closePath();
          ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy-7, 3, 0, Math.PI*2); ctx.fillStyle = theme.fg; ctx.fill();
      }
  },

  [VizType.Compass]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2, r = 15;
      const a = localTime * speed * 500;
      
      drawGrid(ctx, w, h, theme, 2, 2, true);
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
      
      if (mode === 0) {
          // Needle
          ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(4,0); ctx.lineTo(-4,0); ctx.fillStyle=theme.accent; ctx.fill();
          ctx.beginPath(); ctx.moveTo(0,r); ctx.lineTo(4,0); ctx.lineTo(-4,0); ctx.fillStyle=`${theme.fg}55`; ctx.fill();
      } else if (mode === 1) {
          // Line
          ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.strokeStyle=theme.fg; ctx.stroke();
      } else if (mode === 2) {
          // Cross
          ctx.beginPath(); ctx.moveTo(-r,0); ctx.lineTo(r,0); ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.strokeStyle=theme.accent; ctx.stroke();
      } else {
          // Triangle
          ctx.beginPath(); ctx.moveTo(r,0); ctx.lineTo(-5,5); ctx.lineTo(-5,-5); ctx.fillStyle=theme.fg; ctx.fill();
      }
      ctx.restore();
      if (mode !== 2) {
          ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle=`${theme.fg}33`; ctx.stroke();
      }
  },

  [VizType.Pillars]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const count = 3 + Math.floor(seed * 4);
      const barW = 8 + seed*4;
      const cx = w/2;
      
      for(let i=0; i<count; i++) {
          const val = (Math.sin(localTime * 2 + i) + 1)/2;
          const hh = val * (h * 0.5);
          const x = cx - ((count*barW)/2) + i*(barW+2);
          const y = h/2 - hh/2;
          
          if(mode === 0) {
              // Equalizer style
              ctx.fillStyle = theme.fg;
              ctx.fillRect(x, y, barW, hh);
          } else if(mode === 1) {
              // Floating
              ctx.fillStyle = theme.accent;
              ctx.fillRect(x, y + Math.sin(localTime+i)*5, barW, 5);
          } else if(mode === 2) {
              // Outlines
              ctx.strokeStyle = theme.fg;
              ctx.strokeRect(x, y, barW, hh);
          } else {
              // Stacked
              const segs = Math.floor(hh/5);
              ctx.fillStyle = `${theme.fg}44`;
              for(let j=0; j<segs; j++) {
                  ctx.fillRect(x, h/2 + j*6, barW, 4);
                  ctx.fillRect(x, h/2 - j*6 - 4, barW, 4);
              }
          }
      }
  },

  [VizType.Circuit]: (ctx, w, h, time, theme, speed, variation, id) => {
    const { mode, seed, phase } = getParams(variation, id);
    const localTime = time + phase;
    const cx = w/2, cy = h/2;
    
    if (mode === 0) {
        // Nodes
        const pts = 4;
        ctx.strokeStyle = theme.accent;
        ctx.beginPath();
        for(let i=0; i<pts; i++) {
            const x = cx + Math.cos(i*Math.PI/2)*15;
            const y = cy + Math.sin(i*Math.PI/2)*15;
            i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
            ctx.fillRect(x-1,y-1,2,2);
        }
        ctx.closePath(); ctx.stroke();
    } else if (mode === 1) {
        // Traces
        ctx.strokeStyle = theme.fg;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(cx-10, cy); ctx.lineTo(cx, cy-10); ctx.lineTo(w, cy-10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, cy+10); ctx.lineTo(cx, cy+10); ctx.lineTo(cx+10, cy+20); ctx.lineTo(w, cy+20);
        ctx.stroke();
    } else if (mode === 2) {
        // Chip
        ctx.fillStyle = `${theme.fg}33`;
        ctx.fillRect(cx-10, cy-10, 20, 20);
        ctx.strokeStyle = theme.fg;
        for(let i=0; i<4; i++) {
             ctx.beginPath(); ctx.moveTo(cx-15, cy-5+i*4); ctx.lineTo(cx-10, cy-5+i*4); ctx.stroke();
             ctx.beginPath(); ctx.moveTo(cx+10, cy-5+i*4); ctx.lineTo(cx+15, cy-5+i*4); ctx.stroke();
        }
    } else {
        // Pulse Path
        const pathW = w * 0.8;
        const startX = (w-pathW)/2;
        ctx.strokeStyle = `${theme.fg}22`;
        ctx.beginPath(); ctx.moveTo(startX, cy); ctx.lineTo(startX+pathW, cy); ctx.stroke();
        const p = (localTime * speed * 300) % pathW;
        ctx.fillStyle = theme.accent;
        ctx.fillRect(startX + p, cy-2, 4, 4);
    }
  },

  [VizType.Rings]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      const r = Math.min(w,h)*0.3;
      
      if (mode === 0) {
          // Concentric Circles
          for(let i=1; i<=3; i++) {
              ctx.beginPath(); ctx.arc(cx, cy, r*i/3, 0, Math.PI*2);
              ctx.strokeStyle = `${theme.fg}${Math.floor(255 - i*60).toString(16)}`;
              ctx.stroke();
          }
      } else if (mode === 1) {
          // Dash Rings
          ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.arc(cx, cy, r, localTime, localTime + Math.PI);
          ctx.strokeStyle = theme.accent; ctx.stroke();
          ctx.setLineDash([]);
      } else if (mode === 2) {
          // Offset Rings
          ctx.beginPath(); ctx.arc(cx + Math.sin(localTime)*5, cy, r*0.8, 0, Math.PI*2);
          ctx.strokeStyle = theme.fg; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx - Math.sin(localTime)*5, cy, r*0.8, 0, Math.PI*2);
          ctx.strokeStyle = `${theme.fg}55`; ctx.stroke();
      } else {
          // Expanding
          const r2 = (localTime * 20) % r;
          ctx.beginPath(); ctx.arc(cx, cy, r2, 0, Math.PI*2);
          ctx.strokeStyle = theme.accent; ctx.stroke();
      }
  },

  [VizType.HexGrid]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const s = 8 + Math.floor(seed*5); // Size
      // Simple hex approx with rects or lines for perf, or actual hex path
      // Let's do staggering rects to simulate hex grid feel
      const cols = Math.ceil(w/s);
      const rows = Math.ceil(h/s);
      
      for(let y=0; y<rows; y++) {
          for(let x=0; x<cols; x++) {
              const odd = y%2!==0;
              const xx = x*s*1.5 + (odd ? s*0.75 : 0);
              const yy = y*s*0.8;
              if(mode === 0) {
                  // Dots
                  ctx.fillStyle = `${theme.fg}22`;
                  ctx.fillRect(xx, yy, 2, 2);
              } else if (mode === 1) {
                  // Active Cells
                  if(Math.sin(x*0.5 + y*0.5 + localTime) > 0.8) {
                      ctx.fillStyle = theme.accent;
                      ctx.fillRect(xx, yy, s/2, s/2);
                  }
              } else if (mode === 2) {
                  // Lines
                   ctx.strokeStyle = `${theme.fg}11`;
                   ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx+s/2, yy+s/2); ctx.stroke();
              } else {
                   // Random blink
                   if(Math.random() > 0.98) {
                       ctx.fillStyle = theme.fg;
                       ctx.fillRect(xx, yy, s-2, s-2);
                   }
              }
          }
      }
  },

  [VizType.NoiseField]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const res = 10 + Math.floor(seed*10);
      const cols = Math.ceil(w/res);
      const rows = Math.ceil(h/res);
      
      for(let y=0; y<rows; y++) {
          for(let x=0; x<cols; x++) {
              const angle = (Math.cos(x*0.2 + localTime) + Math.sin(y*0.2 + localTime)) * Math.PI;
              const xx = x*res + res/2;
              const yy = y*res + res/2;
              
              if (mode === 0) {
                  // Vectors
                  ctx.strokeStyle = `${theme.fg}44`;
                  ctx.beginPath(); ctx.moveTo(xx, yy); 
                  ctx.lineTo(xx + Math.cos(angle)*5, yy + Math.sin(angle)*5);
                  ctx.stroke();
              } else if (mode === 1) {
                  // Dots flow
                  const d = (Math.sin(angle)+1) * 2;
                  ctx.fillStyle = theme.accent;
                  ctx.fillRect(xx-d/2, yy-d/2, d, d);
              } else if (mode === 2) {
                   // Line segments
                   if (angle > 1) {
                       ctx.strokeStyle = theme.fg;
                       ctx.beginPath(); ctx.moveTo(xx-2, yy); ctx.lineTo(xx+2, yy); ctx.stroke();
                   }
              } else {
                  // Density
                   const alpha = Math.abs(Math.sin(angle));
                   ctx.fillStyle = `${theme.fg}${Math.floor(alpha*255).toString(16).padStart(2,'0')}`;
                   ctx.fillRect(xx, yy, 1, 1);
              }
          }
      }
  },

  [VizType.BlockStack]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cols = 4 + Math.floor(seed*4);
      const cw = w/cols;
      
      for(let x=0; x<cols; x++) {
          const h2 = Math.abs(Math.sin(x + localTime)) * h * 0.8;
          const blocks = Math.floor(h2/5);
          
          for(let b=0; b<blocks; b++) {
              const y = h - b*6 - 2;
              if (mode === 0) {
                  // Solid Stack
                  ctx.fillStyle = theme.fg;
                  ctx.fillRect(x*cw + 2, y, cw-4, 4);
              } else if (mode === 1) {
                  // Fading Stack
                  ctx.fillStyle = `${theme.fg}${Math.floor((1 - b/20)*255).toString(16).padStart(2,'0')}`;
                  ctx.fillRect(x*cw + 2, y, cw-4, 4);
              } else if (mode === 2) {
                   // Accent Top
                   ctx.fillStyle = b === blocks-1 ? theme.accent : `${theme.fg}33`;
                   ctx.fillRect(x*cw + 2, y, cw-4, 4);
              } else {
                   // Thin lines
                   ctx.fillStyle = theme.fg;
                   ctx.fillRect(x*cw + 2, y, cw-4, 1);
              }
          }
      }
  },

  // === NEW RENDERERS ===

  [VizType.Waveform]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const pts = w;
      ctx.beginPath();
      
      for(let x=0; x<w; x+=2) {
          let y = h/2;
          if (mode === 0) {
              // AM/FM Modulation
              const carrier = Math.sin(x * 0.1 + localTime * 10);
              const mod = Math.sin(x * 0.01 + localTime);
              y += carrier * mod * h * 0.4;
              ctx.lineTo(x, y);
          } else if (mode === 1) {
              // Envelope
              const noise = (Math.random() - 0.5) * h * 0.8;
              const env = Math.sin(x * 0.05 + localTime) > 0 ? 1 : 0.1;
              y += noise * env;
              ctx.lineTo(x, y);
          } else if (mode === 2) {
              // Digital Sample
              const sampleRate = 10 + seed*20;
              const sx = Math.floor(x/sampleRate)*sampleRate;
              y += Math.sin(sx*0.05 + localTime*5) * h * 0.3;
              if (x%sampleRate === 0) ctx.fillRect(x, y-2, 2, 4);
          } else {
               // Multi-line
               const y1 = h/2 + Math.sin(x*0.05 + localTime)*20;
               const y2 = h/2 + Math.cos(x*0.03 - localTime)*20;
               if(x===0) ctx.moveTo(x, y1);
               ctx.lineTo(x, y1);
               // We handle second line after stroke or in loop? 
               // Just one complex line here
               y = (y1+y2)/2;
          }
      }
      ctx.strokeStyle = mode===1 ? theme.accent : theme.fg;
      ctx.stroke();
      
      if(mode === 2) {
           ctx.fillStyle = `${theme.fg}44`;
           ctx.fillRect(0, h/2, w, 1);
      }
  },

  [VizType.Molecule]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      const drawAtom = (x: number, y: number, r: number, color: string) => {
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); 
          ctx.fillStyle = color; ctx.fill();
          ctx.strokeStyle = `${theme.fg}44`; ctx.stroke();
      };

      if (mode === 0) {
          // Central with Satellites
          drawAtom(cx, cy, 10, theme.accent);
          const sats = 3 + Math.floor(seed*3);
          for(let i=0; i<sats; i++) {
              const a = localTime + i*(Math.PI*2/sats);
              const sx = cx + Math.cos(a)*30;
              const sy = cy + Math.sin(a)*30;
              ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.strokeStyle = `${theme.fg}44`; ctx.stroke();
              drawAtom(sx, sy, 5, theme.fg);
          }
      } else if (mode === 1) {
          // Chain
          const len = 5;
          let lx = cx - (len*15)/2, ly = cy;
          ctx.beginPath();
          for(let i=0; i<len; i++) {
              const y = ly + Math.sin(i + localTime)*10;
              const x = lx + i*20;
              if (i>0) ctx.lineTo(x,y);
              ctx.moveTo(x,y);
          }
          ctx.strokeStyle=theme.fg; ctx.stroke();
           for(let i=0; i<len; i++) {
              const y = ly + Math.sin(i + localTime)*10;
              const x = lx + i*20;
              drawAtom(x, y, 4, i%2===0 ? theme.accent : theme.fg);
           }

      } else if (mode === 2) {
          // Hex Structure
          const r = 15;
          const angle = localTime * 0.5;
          for(let i=0; i<6; i++) {
              const a = angle + i*(Math.PI/3);
              const x = cx + Math.cos(a)*r;
              const y = cy + Math.sin(a)*r;
              drawAtom(x, y, 3, theme.fg);
              // Connect to neighbor
              const a2 = angle + ((i+1)%6)*(Math.PI/3);
              const x2 = cx + Math.cos(a2)*r;
              const y2 = cy + Math.sin(a2)*r;
              ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.strokeStyle=theme.fg; ctx.stroke();
          }
      } else {
          // Cluster
          const count = 6;
          for(let i=0; i<count; i++) {
               const x = cx + (Math.random()-0.5)*30;
               const y = cy + (Math.random()-0.5)*30;
               drawAtom(x, y, Math.random()*5+2, Math.random()>0.5 ? theme.fg : `${theme.accent}88`);
          }
      }
  },

  [VizType.Spiral]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      ctx.beginPath();
      const turns = 3 + mode;
      const pts = turns * 20;
      
      for(let i=0; i<pts; i++) {
          const t = i/pts;
          const angle = t * Math.PI * 2 * turns + localTime * (mode%2===0 ? 2 : -2);
          let r = t * Math.min(w,h)*0.4;
          if (mode === 1) r = Math.pow(t, 0.5) * Math.min(w,h)*0.4; // Log-ish
          
          const x = cx + Math.cos(angle)*r;
          const y = cy + Math.sin(angle)*r;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = mode === 2 ? theme.accent : theme.fg;
      ctx.stroke();
      
      if (mode === 3) {
          // Galaxy dots
          for(let i=0; i<20; i++) {
              const angle = Math.random() * Math.PI * 2 + localTime;
              const r = Math.random() * Math.min(w,h)*0.3;
              ctx.fillStyle = `${theme.fg}66`;
              ctx.fillRect(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r, 2, 2);
          }
      }
  },

  [VizType.HUD]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      ctx.strokeStyle = theme.fg;
      ctx.lineWidth = 1;
      
      if (mode === 0) {
          // Aim Point
          ctx.beginPath(); 
          ctx.moveTo(cx-10, cy); ctx.lineTo(cx-3, cy);
          ctx.moveTo(cx+10, cy); ctx.lineTo(cx+3, cy);
          ctx.moveTo(cx, cy-10); ctx.lineTo(cx, cy-3);
          ctx.moveTo(cx, cy+10); ctx.lineTo(cx, cy+3);
          ctx.stroke();
          ctx.font = "9px monospace"; ctx.fillStyle = theme.accent;
          ctx.fillText(Math.floor(localTime*100).toString(), cx+5, cy+5);
      } else if (mode === 1) {
          // Altimeter Ladder
          const yOff = (localTime * 20) % 20;
          for(let i=-2; i<=2; i++) {
              const y = cy + i*15 + yOff;
              if (y > 10 && y < h-10) {
                  ctx.beginPath(); ctx.moveTo(w-30, y); ctx.lineTo(w-10, y); ctx.stroke();
                  ctx.fillStyle = theme.fg; ctx.font = "9px monospace";
                  ctx.fillText(((i+5)*100).toString(), w-55, y+3);
              }
          }
          ctx.fillStyle=theme.accent; ctx.beginPath(); ctx.moveTo(w-35, cy); ctx.lineTo(w-30, cy-3); ctx.lineTo(w-30, cy+3); ctx.fill();
      } else if (mode === 2) {
          // Compass Strip
          const xOff = (localTime * 30) % 40;
          ctx.fillStyle = `${theme.fg}22`; ctx.fillRect(10, 10, w-20, 20);
          ctx.strokeStyle = theme.fg;
          ctx.beginPath();
          for(let x=10; x<w-10; x+=10) {
               const xx = (x + xOff) % (w-20) + 10; // Wrap logic simplified
               ctx.moveTo(xx, 10); ctx.lineTo(xx, 15);
          }
          ctx.stroke();
          ctx.fillStyle=theme.accent; ctx.fillRect(w/2-1, 25, 2, 5);
      } else {
          // Corners
          const s = 10;
          ctx.beginPath();
          ctx.moveTo(10, 10+s); ctx.lineTo(10, 10); ctx.lineTo(10+s, 10); // TL
          ctx.moveTo(w-10-s, 10); ctx.lineTo(w-10, 10); ctx.lineTo(w-10, 10+s); // TR
          ctx.moveTo(10, h-10-s); ctx.lineTo(10, h-10); ctx.lineTo(10+s, h-10); // BL
          ctx.moveTo(w-10-s, h-10); ctx.lineTo(w-10, h-10); ctx.lineTo(w-10, h-10-s); // BR
          ctx.stroke();
          ctx.fillStyle = `${theme.fg}44`; ctx.fillText("LOCK", cx-10, cy);
      }
  },

  [VizType.City]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      
      if (mode === 0) {
          // Skyline
          const bCount = 5 + Math.floor(seed*5);
          const bw = w / bCount;
          ctx.fillStyle = theme.fg;
          for(let i=0; i<bCount; i++) {
              const bh = (Math.sin(i*132)*0.5 + 0.5) * h * 0.6 + 10;
              ctx.fillRect(i*bw, h-bh, bw-2, bh);
              // Windows
              ctx.fillStyle = Math.random() > 0.9 ? theme.accent : `${theme.bg}`;
              if (Math.random() > 0.5) ctx.fillRect(i*bw + 4, h-bh+4, 2, 2);
              ctx.fillStyle = theme.fg;
          }
      } else if (mode === 1) {
          // Top Down Map
          const s = 10;
          for(let y=0; y<h; y+=s) {
              for(let x=0; x<w; x+=s) {
                  if (Math.random() > 0.7) {
                      ctx.fillStyle = `${theme.fg}33`;
                      ctx.fillRect(x+1, y+1, s-2, s-2);
                  }
              }
          }
          // Car
          ctx.fillStyle = theme.accent;
          const cx = (localTime * 20) % w;
          ctx.fillRect(cx, h/2, 4, 4);
      } else if (mode === 2) {
           // Isometric hints
           const s = 10;
           ctx.strokeStyle = theme.fg;
           for(let i=0; i<5; i++) {
               const x = 20 + i*15;
               const y = h/2 + i*5;
               ctx.strokeRect(x, y, s, -s*Math.random()*3);
           }
      } else {
          // Digital Rain
          ctx.fillStyle = theme.accent;
          ctx.font = "8px monospace";
          const cols = Math.floor(w/10);
          for(let i=0; i<cols; i++) {
               const y = (localTime * (10 + i%5) + i*30) % h;
               ctx.fillText(String.fromCharCode(0x30A0 + i), i*10, y);
          }
      }
  },

  [VizType.Microbe]: (ctx, w, h, time, theme, speed, variation, id) => {
      const { mode, seed, phase } = getParams(variation, id);
      const localTime = time + phase;
      const cx = w/2, cy = h/2;
      
      ctx.beginPath();
      if (mode === 0) {
          // Amoeba
          const r = 15;
          for(let a=0; a<=Math.PI*2; a+=0.2) {
              const d = r + Math.sin(a*3 + localTime)*3 + Math.cos(a*5 - localTime)*2;
              const x = cx + Math.cos(a)*d;
              const y = cy + Math.sin(a)*d;
              a===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
          }
          ctx.closePath();
          ctx.fillStyle = `${theme.fg}44`; ctx.fill();
          ctx.strokeStyle = theme.fg; ctx.stroke();
      } else if (mode === 1) {
          // Division
          const d = Math.sin(localTime)*5;
          ctx.beginPath(); ctx.arc(cx-d, cy, 8, 0, Math.PI*2); ctx.fillStyle=`${theme.fg}66`; ctx.fill();
          ctx.beginPath(); ctx.arc(cx+d, cy, 8, 0, Math.PI*2); ctx.fillStyle=`${theme.fg}66`; ctx.fill();
      } else if (mode === 2) {
          // Bacteria
          const x = cx + Math.cos(localTime)*10;
          const y = cy + Math.sin(localTime)*10;
          ctx.beginPath(); ctx.ellipse(x, y, 10, 5, localTime, 0, Math.PI*2);
          ctx.strokeStyle = theme.accent; ctx.stroke();
          // Flagella
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-10, y-5); ctx.stroke();
      } else {
          // Virus
          ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2); ctx.fillStyle=theme.fg; ctx.fill();
          for(let i=0; i<8; i++) {
              const a = i * (Math.PI/4) + localTime*0.5;
              ctx.beginPath(); ctx.moveTo(cx, cy); 
              ctx.lineTo(cx + Math.cos(a)*15, cy + Math.sin(a)*15);
              ctx.stroke();
              ctx.beginPath(); ctx.arc(cx+Math.cos(a)*15, cy+Math.sin(a)*15, 2, 0, Math.PI*2); ctx.fillStyle=theme.accent; ctx.fill();
          }
      }
  }
};
