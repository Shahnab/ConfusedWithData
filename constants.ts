
import { Theme, DataContext, SpeedLevel, VizType } from './types';

export const THEMES: Theme[] = [
  { name: 'ENGINEERING', bg: '#f0f0f0', fg: '#111111', accent: '#ff3300', grid: '#e0e0e0' },
  { name: 'BLUEPRINT', bg: '#0033cc', fg: '#ffffff', accent: '#ffff00', grid: '#0044ee' },
  { name: 'TERMINAL', bg: '#0a0a0a', fg: '#00ff41', accent: '#008f11', grid: '#112211' },
  { name: 'MIDNIGHT', bg: '#111111', fg: '#eeeeee', accent: '#666666', grid: '#222222' },
  { name: 'PAPER', bg: '#fdfbf7', fg: '#2d2d2d', accent: '#d9534f', grid: '#e8e6e1' },
  { name: 'BRAUN', bg: '#222222', fg: '#e0e0e0', accent: '#f4b400', grid: '#333333' },
  { name: 'VAPORWAVE', bg: '#190a36', fg: '#00ffff', accent: '#ff69b4', grid: '#331a66' },
  { name: 'FOREST', bg: '#1c3020', fg: '#c4d7b2', accent: '#a54a2a', grid: '#2e4f3a' },
  { name: 'MONOCHROME', bg: '#292929', fg: '#ffffff', accent: '#888888', grid: '#4a4a4a' },
  { name: 'SOLARIS', bg: '#002b36', fg: '#fdf6e3', accent: '#dc322f', grid: '#073642' },
  { name: 'NEON GRID', bg: '#08081a', fg: '#e0e0ff', accent: '#ccff00', grid: '#333355' },
  { name: 'ACID PROTOCOL', bg: '#111111', fg: '#39ff14', accent: '#ff00ff', grid: '#333333' },
];

export const CONTEXTS: DataContext[] = [
  {
    title: 'AEROSPACE TELEMETRY',
    labels: ['ALTITUDE', 'PITCH', 'YAW', 'ROLL', 'THRUST', 'O2 LEVEL', 'G-FORCE', 'APOGEE', 'PERIGEE', 'BURN RATE', 'PSI', 'TEMP A', 'TEMP B', 'RADAR', 'VELOCITY', 'DRAG', 'LIFT', 'MACH', 'SAT LOCK'],
    unit: 'UNITS'
  },
  {
    title: 'SERVER INFRASTRUCTURE',
    labels: ['CPU LOAD', 'MEM USAGE', 'I/O WAIT', 'NET IN', 'NET OUT', 'DISK A', 'DISK B', 'REQS/SEC', 'LATENCY', 'UPTIME', 'ERR RATE', 'CACHE', 'SWAP', 'THREADS', 'PIPES', 'SOCKETS', 'TEMP', 'FAN RPM'],
    unit: '%'
  },
  {
    title: 'MARKET ANALYTICS',
    labels: ['NASDAQ', 'DOW', 'YIELD', 'VOLATILITY', 'ROI', 'MARGIN', 'VOLUME', 'ASK', 'BID', 'SPREAD', 'LIQUIDITY', 'BONDS', 'FUTURES', 'OPTIONS', 'FOREX', 'CRYPTO', 'INDEX', 'DELTA'],
    unit: 'PTS'
  },
  {
    title: 'BIO-METRICS',
    labels: ['BPM', 'SPO2', 'SYS BP', 'DIA BP', 'TEMP', 'RESP RATE', 'GLUCOSE', 'LACTATE', 'REM', 'DEEP', 'STEPS', 'CALS', 'EKG', 'EEG', 'EMG', 'PH', 'H2O'],
    unit: ''
  }
];

export const SPEED_LEVELS: SpeedLevel[] = [
  { label: 'SLOW', value: 0.0005 },
  { label: 'NORMAL', value: 0.0015 },
  { label: 'FAST', value: 0.004 }
];

export const VIZ_TYPES_LIST: VizType[] = [
  VizType.Sine, VizType.Bars, VizType.Gauge, VizType.Radar, VizType.Line,
  VizType.Matrix, VizType.Cube, VizType.Binary, VizType.HexDump, VizType.Scatter,
  VizType.Spectrum, VizType.Globe, VizType.Terminal, VizType.DNA, VizType.Progress,
  VizType.Liquid, VizType.Orbit, VizType.Seismic, VizType.Network, VizType.GridMap,
  VizType.Timer, VizType.Swirl, VizType.Pyramid, VizType.Compass,
  VizType.Pillars, VizType.Circuit, VizType.Rings, VizType.HexGrid, VizType.NoiseField, VizType.BlockStack,
  VizType.Waveform, VizType.Molecule, VizType.Spiral, VizType.HUD, VizType.City, VizType.Microbe
];
