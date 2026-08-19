// ============================================================
// AUDIO SYSTEM - Sound effects and ambience
// Audio is essential. Silence is an audio tool.
// ============================================================

export type SoundType =
  | 'ambient_tavern' | 'ambient_dungeon' | 'ambient_forest'
  | 'combat_start' | 'combat_hit' | 'combat_miss' | 'combat_crit'
  | 'dice_roll' | 'dice_success' | 'dice_fail'
  | 'ui_click' | 'ui_hover' | 'ui_error'
  | 'door_open' | 'door_close' | 'footstep'
  | 'item_pickup' | 'item_equip' | 'item_use'
  | 'spell_cast' | 'heal'
  | 'critical_hit' | 'critical_fail'
  | 'level_up' | 'quest_complete'
  | 'menu_select' | 'menu_hover';

interface AudioBuffer {
  buffer: AudioBuffer;
  type: SoundType;
}

class AudioManager {
  private context: AudioContext | null = null;
  private buffers: Map<SoundType, AudioBuffer> = new Map();
  // Audio is opt-in: a text-first game should never compete with its own narration.
  private enabled: boolean = false;
  private musicVolume: number = 0.15;
  private effectsVolume: number = 0.12;
  private currentAmbience: OscillatorNode | null = null;

  init(): void {
    if (typeof window === 'undefined') return;
    try {
      this.context = new AudioContext();
    } catch (err) {
      console.warn('Audio not available:', err);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.context) this.init();
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolumes(music: number, effects: number): void {
    this.musicVolume = music;
    this.effectsVolume = effects;
  }

  // Generate procedural sounds using Web Audio API
  play(type: SoundType): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    switch (type) {
      case 'ui_click':
        this.playTone(ctx, gain, now, 800, 0.05, 'sine', 0.2);
        break;
      case 'ui_hover':
        this.playTone(ctx, gain, now, 600, 0.03, 'sine', 0.1);
        break;
      case 'ui_error':
        this.playTone(ctx, gain, now, 200, 0.15, 'sawtooth', 0.3);
        break;
      case 'dice_roll':
        this.playNoise(ctx, gain, now, 0.3, 0.3);
        break;
      case 'dice_success':
        this.playTone(ctx, gain, now, 523, 0.1, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.1, 659, 0.1, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.2, 784, 0.15, 'sine', 0.3);
        break;
      case 'dice_fail':
        this.playTone(ctx, gain, now, 400, 0.15, 'sawtooth', 0.2);
        this.playTone(ctx, gain, now + 0.15, 300, 0.2, 'sawtooth', 0.2);
        break;
      case 'combat_start':
        this.playTone(ctx, gain, now, 200, 0.3, 'sawtooth', 0.4);
        this.playTone(ctx, gain, now + 0.15, 300, 0.3, 'sawtooth', 0.4);
        break;
      case 'combat_hit':
        this.playNoise(ctx, gain, now, 0.1, 0.5);
        this.playTone(ctx, gain, now, 150, 0.1, 'square', 0.3);
        break;
      case 'combat_crit':
        this.playNoise(ctx, gain, now, 0.15, 0.6);
        this.playTone(ctx, gain, now, 100, 0.2, 'sawtooth', 0.5);
        this.playTone(ctx, gain, now + 0.1, 200, 0.15, 'square', 0.4);
        break;
      case 'combat_miss':
        this.playTone(ctx, gain, now, 300, 0.05, 'sine', 0.15);
        break;
      case 'door_open':
        this.playTone(ctx, gain, now, 100, 0.3, 'sawtooth', 0.2);
        this.playNoise(ctx, gain, now, 0.2, 0.15);
        break;
      case 'door_close':
        this.playNoise(ctx, gain, now, 0.1, 0.4);
        this.playTone(ctx, gain, now, 80, 0.1, 'square', 0.3);
        break;
      case 'item_pickup':
        this.playTone(ctx, gain, now, 600, 0.08, 'sine', 0.25);
        this.playTone(ctx, gain, now + 0.08, 800, 0.08, 'sine', 0.25);
        break;
      case 'item_equip':
        this.playTone(ctx, gain, now, 400, 0.05, 'triangle', 0.2);
        this.playTone(ctx, gain, now + 0.05, 500, 0.08, 'triangle', 0.2);
        break;
      case 'spell_cast':
        this.playTone(ctx, gain, now, 800, 0.2, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.1, 1200, 0.15, 'sine', 0.25);
        this.playTone(ctx, gain, now + 0.2, 1600, 0.1, 'sine', 0.2);
        break;
      case 'heal':
        this.playTone(ctx, gain, now, 523, 0.1, 'sine', 0.2);
        this.playTone(ctx, gain, now + 0.1, 659, 0.1, 'sine', 0.2);
        this.playTone(ctx, gain, now + 0.2, 784, 0.1, 'sine', 0.2);
        this.playTone(ctx, gain, now + 0.3, 1047, 0.15, 'sine', 0.2);
        break;
      case 'level_up':
        for (let i = 0; i < 5; i++) {
          this.playTone(ctx, gain, now + i * 0.1, 400 + i * 100, 0.1, 'sine', 0.3);
        }
        break;
      case 'quest_complete':
        this.playTone(ctx, gain, now, 523, 0.15, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.15, 659, 0.15, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.3, 784, 0.15, 'sine', 0.3);
        this.playTone(ctx, gain, now + 0.45, 1047, 0.2, 'sine', 0.3);
        break;
      case 'critical_hit':
        this.playNoise(ctx, gain, now, 0.2, 0.6);
        this.playTone(ctx, gain, now, 150, 0.2, 'sawtooth', 0.5);
        this.playTone(ctx, gain, now + 0.1, 300, 0.15, 'square', 0.4);
        break;
      case 'critical_fail':
        this.playTone(ctx, gain, now, 200, 0.3, 'sawtooth', 0.4);
        this.playTone(ctx, gain, now + 0.2, 100, 0.3, 'sawtooth', 0.4);
        break;
      case 'menu_select':
        this.playTone(ctx, gain, now, 700, 0.06, 'sine', 0.2);
        break;
      case 'menu_hover':
        this.playTone(ctx, gain, now, 500, 0.03, 'sine', 0.1);
        break;
      default:
        break;
    }
  }

  private playTone(
    ctx: AudioContext,
    gain: GainNode,
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gainNode.gain.setValueAtTime(volume * this.effectsVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playNoise(
    ctx: AudioContext,
    gain: GainNode,
    time: number,
    duration: number,
    volume: number
  ): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * this.effectsVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(time);
  }

  // Ambient sound loops
  startAmbience(type: 'tavern' | 'dungeon' | 'forest'): void {
    if (!this.enabled) return;
    this.stopAmbience();
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Create a subtle ambient drone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    filter.type = 'lowpass';

    switch (type) {
      case 'tavern':
        osc.frequency.value = 80;
        filter.frequency.value = 200;
        gain.gain.value = 0.02 * this.musicVolume;
        break;
      case 'dungeon':
        osc.frequency.value = 60;
        filter.frequency.value = 150;
        gain.gain.value = 0.015 * this.musicVolume;
        break;
      case 'forest':
        osc.frequency.value = 100;
        filter.frequency.value = 300;
        gain.gain.value = 0.01 * this.musicVolume;
        break;
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.currentAmbience = osc;
  }

  stopAmbience(): void {
    if (this.currentAmbience) {
      this.currentAmbience.stop();
      this.currentAmbience = null;
    }
  }
}

export const audioManager = new AudioManager();
