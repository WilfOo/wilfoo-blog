/**
 * Terrain contour generator — the same technique the blog's previous
 * background used: seeded simplex noise → fBm height field → marching
 * squares → SVG paths. Pure and deterministic, so it runs on the server
 * (card artwork) and in the browser (page background).
 */

export type ContourPath = { d: string; major: boolean };

export type ContourData = {
  width: number;
  height: number;
  paths: ContourPath[];
};

export function mulberry32(seed: number) {
  let s = seed | 0;
  return function rand() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeNoise2D(rand: () => number) {
  const grad = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const n = Math.floor(rand() * (i + 1));
    const q = p[i];
    p[i] = p[n];
    p[n] = q;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  return function noise(xin: number, yin: number) {
    const s = (xin + yin) * F2;
    const i0 = Math.floor(xin + s);
    const j0 = Math.floor(yin + s);
    const t = (i0 + j0) * G2;
    const x0 = xin - (i0 - t);
    const y0 = yin - (j0 - t);
    let i1: number, j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i0 & 255;
    const jj = j0 & 255;
    let n0 = 0,
      n1 = 0,
      n2 = 0;
    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const g0 = grad[perm[ii + perm[jj]] & 7];
      const tt = t0 * t0;
      n0 = tt * tt * (g0[0] * x0 + g0[1] * y0);
    }
    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const g1 = grad[perm[ii + i1 + perm[jj + j1]] & 7];
      const tt = t1 * t1;
      n1 = tt * tt * (g1[0] * x1 + g1[1] * y1);
    }
    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const g2 = grad[perm[ii + 1 + perm[jj + 1]] & 7];
      const tt = t2 * t2;
      n2 = tt * tt * (g2[0] * x2 + g2[1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves = 4) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let o = 0; o < octaves; o++) {
    v += amp * noise(x * freq, y * freq);
    sum += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / sum;
}

function smoothField(src: Float32Array, cols: number, rows: number, passes: number) {
  const field = new Float32Array(src);
  const dst = new Float32Array(src.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              sum += field[ny * cols + nx];
              n++;
            }
          }
        }
        dst[y * cols + x] = sum / n;
      }
    }
    field.set(dst);
  }
  return field;
}

const CASES: Record<number, Array<[number, number]>> = {
  1: [[3, 2]],
  2: [[2, 1]],
  3: [[3, 1]],
  4: [[0, 1]],
  6: [[0, 2]],
  7: [[0, 3]],
  8: [[0, 3]],
  9: [[0, 2]],
  11: [[0, 1]],
  12: [[3, 1]],
  13: [[2, 1]],
  14: [[3, 2]],
};

function contourSegments(field: Float32Array, cols: number, rows: number, iso: number) {
  const segs: Array<[number, number]> = [];
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const tl = field[y * cols + x];
      const tr = field[y * cols + x + 1];
      const br = field[(y + 1) * cols + x + 1];
      const bl = field[(y + 1) * cols + x];
      const idx =
        (tl > iso ? 8 : 0) | (tr > iso ? 4 : 0) | (br > iso ? 2 : 0) | (bl > iso ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const pt: Array<[number, number] | null> = [null, null, null, null];
      if ((tl > iso) !== (tr > iso)) pt[0] = [x + (iso - tl) / (tr - tl), y];
      if ((tr > iso) !== (br > iso)) pt[1] = [x + 1, y + (iso - tr) / (br - tr)];
      if ((bl > iso) !== (br > iso)) pt[2] = [x + (iso - bl) / (br - bl), y + 1];
      if ((tl > iso) !== (bl > iso)) pt[3] = [x, y + (iso - tl) / (bl - tl)];
      let pairs: Array<[number, number]>;
      if (idx === 5 || idx === 10) {
        const center = (tl + tr + br + bl) / 4;
        if (idx === 5) pairs = center > iso ? [[0, 3], [1, 2]] : [[0, 1], [2, 3]];
        else pairs = center > iso ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]];
      } else {
        pairs = CASES[idx];
      }
      for (const [a, b] of pairs) {
        const pa = pt[a];
        const pb = pt[b];
        if (pa && pb) segs.push(pa, pb);
      }
    }
  }
  return segs;
}

export type ContourOptions = {
  width: number;
  height: number;
  seed: number;
  /** Sampling grid size in px. Smaller = more detail and cost. */
  cell?: number;
  /** Noise scale. Smaller = larger landforms. */
  frequency?: number;
  /** Number of isolines above and below sea level (excluding zero). */
  levels?: number;
  /** Vertical gap between isolines. */
  step?: number;
  /** Extra 3x3 smoothing passes. */
  smoothing?: number;
  /** Index-line every N levels (dashed in the UI). */
  majorEvery?: number;
};

export function generateContours({
  width,
  height,
  seed,
  cell = 9,
  frequency = 0.0016,
  levels = 6,
  step = 0.09,
  smoothing = 2,
  majorEvery = 5,
}: ContourOptions): ContourData {
  const cols = Math.max(2, Math.ceil(width / cell) + 1);
  const rows = Math.max(2, Math.ceil(height / cell) + 1);
  const rand = mulberry32(seed);
  const noise = makeNoise2D(rand);
  let field = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      field[y * cols + x] = fbm(noise, x * cell * frequency, y * cell * frequency);
    }
  }
  field = smoothField(field, cols, rows, smoothing);

  const isolines: number[] = [];
  for (let l = -levels; l <= levels; l++) {
    if (l === 0) continue;
    isolines.push(l * step);
  }

  const paths: ContourPath[] = [];
  isolines.forEach((iso, index) => {
    const segs = contourSegments(field, cols, rows, iso);
    if (segs.length < 8) return;
    let d = "";
    for (let s = 0; s < segs.length; s += 2) {
      const [ax, ay] = segs[s];
      const [bx, by] = segs[s + 1];
      d += `M${(ax * cell).toFixed(1)} ${(ay * cell).toFixed(1)}L${(bx * cell).toFixed(1)} ${(by * cell).toFixed(1)}`;
    }
    paths.push({ d, major: index % majorEvery === 0 });
  });

  return { width: cols * cell, height: rows * cell, paths };
}
