// Web Audio API SFX + Music system for Crypto Realm

const audioCtx = () => {
  if (!(window as any).__crAudioCtx) {
    (window as any).__crAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__crAudioCtx as AudioContext;
};

function playTone(freq: number, duration: number, type: OscillatorType = "square", gain = 0.15) {
  const ctx = audioCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, gain = 0.08) {
  const ctx = audioCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  src.connect(g).connect(ctx.destination);
  src.start();
}

export const SFX = {
  attack() {
    playTone(200, 0.08, "sawtooth", 0.12);
    setTimeout(() => playTone(400, 0.1, "square", 0.1), 50);
    setTimeout(() => playNoise(0.1, 0.06), 30);
  },
  defend() {
    playTone(600, 0.15, "sine", 0.08);
    setTimeout(() => playTone(800, 0.1, "sine", 0.06), 80);
  },
  hit() {
    playTone(120, 0.12, "sawtooth", 0.15);
    playNoise(0.08, 0.1);
  },
  victory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.25, "square", 0.1), i * 120));
  },
  defeat() {
    const notes = [400, 350, 300, 200];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.3, "sawtooth", 0.08), i * 200));
  },
  levelUp() {
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, "sine", 0.12), i * 100));
  },
  loot() {
    playTone(800, 0.1, "sine", 0.1);
    setTimeout(() => playTone(1200, 0.15, "sine", 0.1), 100);
  },
  click() {
    playTone(1000, 0.05, "square", 0.05);
  },
};

// ── Ambient Music System ──

interface MusicState {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  interval: ReturnType<typeof setInterval> | null;
  active: boolean;
}

const musicState: Record<string, MusicState> = {};

function stopMusic(key: string) {
  const state = musicState[key];
  if (!state) return;
  state.active = false;
  if (state.interval) clearInterval(state.interval);
  state.gains.forEach((g) => {
    try { g.gain.exponentialRampToValueAtTime(0.001, audioCtx().currentTime + 0.5); } catch {}
  });
  setTimeout(() => {
    state.oscillators.forEach((o) => { try { o.stop(); } catch {} });
    state.oscillators = [];
    state.gains = [];
  }, 600);
  delete musicState[key];
}

export function stopAllMusic() {
  Object.keys(musicState).forEach(stopMusic);
}

export function playAmbientMusic() {
  if (musicState["ambient"]?.active) return;
  stopMusic("battle");

  const ctx = audioCtx();
  const state: MusicState = { oscillators: [], gains: [], interval: null, active: true };
  musicState["ambient"] = state;

  // Drone pad
  const droneFreqs = [65.41, 98.0, 130.81]; // C2, G2, C3
  droneFreqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    state.oscillators.push(osc);
    state.gains.push(g);
  });

  // Melodic arpeggios
  const melodyNotes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 523.25];
  let noteIdx = 0;

  state.interval = setInterval(() => {
    if (!state.active) return;
    const freq = melodyNotes[noteIdx % melodyNotes.length];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
    noteIdx++;
  }, 2000);
}

export function playBattleMusic() {
  if (musicState["battle"]?.active) return;
  stopMusic("ambient");

  const ctx = audioCtx();
  const state: MusicState = { oscillators: [], gains: [], interval: null, active: true };
  musicState["battle"] = state;

  // Intense low drone
  const droneFreqs = [55.0, 82.41]; // A1, E2
  droneFreqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.5);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    state.oscillators.push(osc);
    state.gains.push(g);
  });

  // Rhythmic pulse
  const battleNotes = [110, 146.83, 110, 164.81, 130.81, 174.61, 130.81, 146.83];
  let noteIdx = 0;

  state.interval = setInterval(() => {
    if (!state.active) return;
    const freq = battleNotes[noteIdx % battleNotes.length];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    noteIdx++;
  }, 400);
}