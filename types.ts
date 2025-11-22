
export interface Theme {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  grid: string;
}

export interface DataContext {
  title: string;
  labels: string[];
  unit: string;
}

export interface SpeedLevel {
  label: string;
  value: number;
}

export interface VizLayoutItem {
  id: string;
  type: VizType;
  colSpan: number;
  rowSpan: number;
  label: string;
  variation: number; // 0.0 to 1.0 to seed procedural variations
}

export enum VizType {
  Sine,
  Bars,
  Gauge,
  Radar,
  Line,
  Matrix,
  Cube,
  Binary,
  HexDump,
  Scatter,
  Spectrum,
  Globe,
  Terminal,
  DNA,
  Progress,
  Liquid,
  Orbit,
  Seismic,
  Network,
  GridMap,
  Timer,
  Swirl,
  Pyramid,
  Compass,
  // New types
  Pillars,
  Circuit,
  Rings,
  HexGrid,
  NoiseField,
  BlockStack,
  // Newer types
  Waveform,
  Molecule,
  Spiral,
  HUD,
  City,
  Microbe
}
