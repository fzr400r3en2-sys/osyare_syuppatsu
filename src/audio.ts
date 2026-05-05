import type { SoundName } from "./types";

type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass = window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function tone(
  context: AudioContext,
  frequency: number,
  offset: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.07,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + offset;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.04);
}

function sweep(context: AudioContext, from: number, to: number, duration: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime;
  const end = start + duration;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.06);
}

function playPattern(context: AudioContext, soundName: SoundName) {
  if (soundName === "dress") {
    tone(context, 420, 0, 0.08, "triangle", 0.055);
    tone(context, 640, 0.07, 0.11, "sine", 0.05);
    return;
  }

  if (soundName === "sparkle") {
    tone(context, 880, 0, 0.08, "sine", 0.05);
    tone(context, 1174, 0.07, 0.1, "sine", 0.045);
    tone(context, 1568, 0.15, 0.14, "triangle", 0.04);
    return;
  }

  if (soundName === "launch") {
    sweep(context, 260, 960, 0.48);
    tone(context, 1320, 0.4, 0.16, "sine", 0.04);
    return;
  }

  if (soundName === "reset") {
    tone(context, 330, 0, 0.08, "square", 0.035);
    tone(context, 240, 0.09, 0.1, "triangle", 0.045);
    return;
  }

  tone(context, 520, 0, 0.08, "sine", 0.045);
}

export function playSound(soundName: SoundName, enabled: boolean) {
  if (!enabled) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  const resumePromise = context.state === "suspended" ? context.resume() : Promise.resolve();
  resumePromise
    .then(() => playPattern(context, soundName))
    .catch(() => undefined);
}
