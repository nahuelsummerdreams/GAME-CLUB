import type { MusicTheme, SfxName } from "@/types/game";
import { readJSON, writeJSON } from "@/lib/storage";

/**
 * Original audio, synthesized with Web Audio — no samples, no licenses.
 * PLACEHOLDER: replace with produced music/SFX (see ASSETS_TODO.md).
 */
export interface AudioSettings {
  musicOn: boolean;
  sfxOn: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
}

const DEFAULTS: AudioSettings = { musicOn: true, sfxOn: true, musicVolume: 0.5, sfxVolume: 0.8 };

const SCALES: Record<MusicTheme, { notes: number[]; tempo: number; wave: OscillatorType }> = {
  village: { notes: [392, 440, 523.25, 659.25, 523.25, 440], tempo: 0.55, wave: "sine" },
  workshop: { notes: [329.63, 392, 493.88, 392, 440, 523.25], tempo: 0.4, wave: "triangle" },
  candy: { notes: [523.25, 659.25, 783.99, 659.25, 880, 783.99], tempo: 0.3, wave: "sine" },
  adventure: { notes: [293.66, 392, 440, 587.33, 440, 392], tempo: 0.28, wave: "triangle" },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private theme: MusicTheme | null = null;
  settings: AudioSettings = DEFAULTS;
  private listeners = new Set<() => void>();

  init(): void {
    this.settings = { ...DEFAULTS, ...readJSON<Partial<AudioSettings>>("audio", {}) };
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  };

  /** Must be called from a user gesture (browsers block autoplay). */
  unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  update(patch: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...patch };
    writeJSON("audio", this.settings);
    this.applyVolumes();
    if (this.theme) {
      if (this.settings.musicOn) this.playMusic(this.theme);
      else this.stopTimer();
    }
    this.listeners.forEach((l) => l());
  }

  private applyVolumes(): void {
    if (this.musicGain) this.musicGain.gain.value = this.settings.musicOn ? this.settings.musicVolume * 0.18 : 0;
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfxOn ? this.settings.sfxVolume : 0;
  }

  private tone(freq: number, dur: number, when: number, wave: OscillatorType, dest: GainNode, peak = 0.3): void {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(dest);
    o.start(when);
    o.stop(when + dur + 0.05);
  }

  sfx(name: SfxName): void {
    if (!this.ctx || !this.sfxGain || !this.settings.sfxOn) return;
    const t = this.ctx.currentTime;
    const d = this.sfxGain;
    switch (name) {
      case "tap": this.tone(660, 0.08, t, "sine", d, 0.25); break;
      case "flip": this.tone(520, 0.07, t, "triangle", d, 0.25); this.tone(780, 0.07, t + 0.05, "triangle", d, 0.2); break;
      case "pop": this.tone(900, 0.1, t, "sine", d, 0.3); this.tone(1400, 0.06, t + 0.04, "sine", d, 0.15); break;
      case "match": [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.2, t + i * 0.07, "sine", d, 0.25)); break;
      case "bell": [1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.7, t + i * 0.02, "sine", d, 0.22)); break;
      case "error": this.tone(220, 0.18, t, "triangle", d, 0.25); this.tone(165, 0.22, t + 0.1, "triangle", d, 0.25); break;
      case "whoosh": this.tone(300, 0.25, t, "sawtooth", d, 0.06); break;
      case "reward": [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => this.tone(f, 0.3, t + i * 0.09, "sine", d, 0.25)); break;
      case "win": [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.28, t + i * 0.12, "triangle", d, 0.28)); break;
    }
  }

  playMusic(theme: MusicTheme): void {
    this.theme = theme;
    this.stopTimer();
    if (!this.ctx || !this.musicGain || !this.settings.musicOn) return;
    const s = SCALES[theme];
    const gain = this.musicGain;
    this.step = 0;
    const play = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const note = s.notes[this.step % s.notes.length]!;
      this.tone(note, s.tempo * 1.6, t, s.wave, gain, 0.5);
      if (this.step % 3 === 0) this.tone(note / 2, s.tempo * 2.4, t, "sine", gain, 0.4);
      this.step++;
    };
    play();
    this.timer = setInterval(play, s.tempo * 1000);
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Called when leaving a game or hiding the tab. */
  suspend(): void {
    this.stopTimer();
    if (this.ctx?.state === "running") void this.ctx.suspend();
  }

  resume(): void {
    if (!this.ctx) return;
    void this.ctx.resume().then(() => {
      if (this.theme && this.settings.musicOn && !this.timer) this.playMusic(this.theme);
    });
  }
}

export const audio = new AudioEngine();
