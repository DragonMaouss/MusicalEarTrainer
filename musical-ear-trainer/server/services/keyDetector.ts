/**
 * Chromagram-based musical key detection.
 * Uses the Krumhansl-Schmuckler algorithm on pitch class profiles
 * derived from a Short-Time Fourier Transform of the raw PCM audio.
 */

// Krumhansl-Kessler tonal hierarchy profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// ─── Minimal Cooley-Tukey FFT (power-of-2 only) ──────────────────────────────

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  // Butterfly passes
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1.0;
      let curIm = 0.0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

// ─── Hamming window ───────────────────────────────────────────────────────────

function hammingWindow(n: number): Float64Array {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    w[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1));
  }
  return w;
}

// ─── Frequency → pitch class ──────────────────────────────────────────────────

function freqToPitchClass(freq: number): number {
  // A4 = 440 Hz, MIDI 69
  const midi = 12 * Math.log2(freq / 440) + 69;
  return ((Math.round(midi) % 12) + 12) % 12;
}

// ─── Chromagram from PCM ──────────────────────────────────────────────────────

export function computeChromagram(pcm: Int16Array, sampleRate: number): Float64Array {
  const FFT_SIZE = 4096;
  const HOP = 1024;
  const chroma = new Float64Array(12);
  const window = hammingWindow(FFT_SIZE);
  let frameCount = 0;

  for (let start = 0; start + FFT_SIZE <= pcm.length; start += HOP) {
    const re = new Float64Array(FFT_SIZE);
    const im = new Float64Array(FFT_SIZE);

    for (let i = 0; i < FFT_SIZE; i++) {
      re[i] = (pcm[start + i] / 32768.0) * window[i];
    }

    fft(re, im);

    // Accumulate energy into pitch classes for positive frequencies
    for (let k = 1; k < FFT_SIZE / 2; k++) {
      const freq = (k * sampleRate) / FFT_SIZE;
      if (freq < 65 || freq > 2100) continue; // C2 to ~C7
      const magnitude = re[k] * re[k] + im[k] * im[k];
      const pc = freqToPitchClass(freq);
      chroma[pc] += magnitude;
    }

    frameCount++;
  }

  // Normalize
  if (frameCount > 0) {
    let max = 0;
    for (let i = 0; i < 12; i++) {
      chroma[i] /= frameCount;
      if (chroma[i] > max) max = chroma[i];
    }
    if (max > 0) {
      for (let i = 0; i < 12; i++) chroma[i] /= max;
    }
  }

  return chroma;
}

// ─── Pearson correlation ──────────────────────────────────────────────────────

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, x) => s + x, 0) / n;
  const meanB = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - meanA;
    const y = b[i] - meanB;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return da === 0 || db === 0 ? 0 : num / Math.sqrt(da * db);
}

// ─── Krumhansl-Schmuckler key finding ────────────────────────────────────────

export interface KeyResult {
  key: string;
  scale: "major" | "minor";
  confidence: number;
  fullName: string;
}

export function findKey(chroma: Float64Array): KeyResult {
  const chromaArr = Array.from(chroma);
  let bestKey = 0;
  let bestScale: "major" | "minor" = "major";
  let bestScore = -Infinity;

  for (let root = 0; root < 12; root++) {
    // Rotate chroma to start at 'root'
    const rotated = [...chromaArr.slice(root), ...chromaArr.slice(0, root)];

    const majorScore = pearson(rotated, MAJOR_PROFILE);
    const minorScore = pearson(rotated, MINOR_PROFILE);

    if (majorScore > bestScore) {
      bestScore = majorScore;
      bestKey = root;
      bestScale = "major";
    }
    if (minorScore > bestScore) {
      bestScore = minorScore;
      bestKey = root;
      bestScale = "minor";
    }
  }

  // Normalize confidence to [0, 1]
  const confidence = Math.max(0, Math.min(1, (bestScore + 1) / 2));

  return {
    key: NOTE_NAMES[bestKey],
    scale: bestScale,
    confidence,
    fullName: `${NOTE_NAMES[bestKey]} ${bestScale}`,
  };
}
