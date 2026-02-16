// Web Audio API SFX system for Crypto Realm

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
