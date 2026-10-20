import fs from "node:fs";
import path from "node:path";

const rate = 44100;
const outDir = path.join(process.cwd(), "public", "sounds");
fs.mkdirSync(outDir, { recursive: true });

function envelope(t, duration, attack = 0.01, decay = 1.6) {
  const a = Math.min(1, t / attack);
  const d = Math.exp((-decay * t) / duration);
  return a * d;
}

function makeWav(name, duration, sample) {
  const length = Math.floor(rate * duration);
  const data = Buffer.alloc(length * 2);
  for (let i = 0; i < length; i += 1) {
    const t = i / rate;
    const value = Math.max(-1, Math.min(1, sample(t, duration)));
    data.writeInt16LE(Math.floor(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(outDir, name), Buffer.concat([header, data]));
}

makeWav("thud.wav", 0.5, (t, d) => {
  const env = envelope(t, d, 0.004, 5.5);
  const low = Math.sin(2 * Math.PI * (95 - 40 * t) * t);
  const noise = (Math.random() * 2 - 1) * 0.24 * Math.exp(-t * 22);
  return (low * 0.82 + noise) * env;
});

makeWav("coin.wav", 0.42, (t, d) => {
  const env = envelope(t, d, 0.002, 3.2);
  const one = Math.sin(2 * Math.PI * 1180 * t);
  const two = Math.sin(2 * Math.PI * 1560 * t) * 0.4;
  const sparkle = t > 0.08 ? Math.sin(2 * Math.PI * 2100 * t) * 0.18 : 0;
  return (one + two + sparkle) * env * 0.38;
});

makeWav("whoosh.wav", 0.58, (t, d) => {
  const env = Math.sin((Math.PI * t) / d) ** 2;
  const noise = Math.random() * 2 - 1;
  const sweep = Math.sin(2 * Math.PI * (240 + 800 * t) * t) * 0.1;
  return (noise * 0.24 + sweep) * env;
});

makeWav("buzz.wav", 0.34, (t, d) => {
  const env = envelope(t, d, 0.005, 2.4);
  const square = Math.sign(Math.sin(2 * Math.PI * 150 * t));
  const wobble = Math.sin(2 * Math.PI * 9 * t) * 0.04;
  return (square * 0.2 + wobble) * env;
});

makeWav("tick.wav", 0.08, (t) => {
  const env = Math.exp(-t * 45);
  return Math.sin(2 * Math.PI * 1600 * t) * env * 0.3;
});

console.log("Generated five sounds in public/sounds");
