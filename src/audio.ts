interface LayerInstance {
  elementId: string;
  timerId: number | null;
  gainNode: GainNode;
  isActive: boolean;
}

type LayerPattern = {
  type: OscillatorType;
  freqs: number[];
  interval: number;
  duration: number;
  gain: number;
  probability?: number;
  alternating?: boolean;
};

const LAYER_PATTERNS: Record<string, LayerPattern> = {
  coral: { type: 'sine', freqs: [261.63, 311.13, 392.00, 466.16], interval: 2000, duration: 1.5, gain: 0.04 },
  kelp: { type: 'triangle', freqs: [261.63, 311.13, 349.23, 392.00, 466.16], interval: 300, duration: 0.25, gain: 0.03 },
  rock: { type: 'sine', freqs: [65.41], interval: 800, duration: 0.6, gain: 0.06 },
  shell: { type: 'sine', freqs: [1046.50, 1174.66, 1318.51], interval: 3000, duration: 2.5, gain: 0.025 },
  bubble: { type: 'sine', freqs: [1046.50, 1318.51, 1567.98, 2093.00], interval: 150, duration: 0.1, gain: 0.02, probability: 0.4 },
  fish: { type: 'sine', freqs: [392.00, 466.16], interval: 200, duration: 0.15, gain: 0.03, alternating: true },
  starfish: { type: 'sine', freqs: [783.99, 1046.50, 1318.51], interval: 500, duration: 0.08, gain: 0.025 },
  crab: { type: 'square', freqs: [783.99, 1046.50], interval: 250, duration: 0.04, gain: 0.015 },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private isInitialized = false;
  private isMuted = false;
  private isGenesis = false;
  private droneOscillators: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private layers: Map<string, LayerInstance> = new Map();
  private droneStarted = false;

  public init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);

    // Create Delay Effect for aquatic/spacious feel
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.value = 0.4;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.3;

    this.delayNode.connect(feedback);
    feedback.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);

    this.isInitialized = true;
    // No sound on init — audio only starts in Epoch 4
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain || this.droneStarted) return;
    this.droneStarted = true;

    const freqs = [65.41, 98.00]; // C2, G2
    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      // Fade in drone
      gain.gain.setTargetAtTime(0.08, this.ctx!.currentTime, 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.droneOscillators.push(osc);
      this.droneGains.push(gain);
    });
  }

  private playLayerNote(elementId: string, pattern: LayerPattern) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (pattern.probability !== undefined && Math.random() > pattern.probability) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = pattern.type;

    let freq: number;
    if (pattern.alternating) {
      // Alternate between freqs based on time
      const idx = Math.floor(now * 5) % pattern.freqs.length;
      freq = pattern.freqs[idx];
    } else {
      freq = pattern.freqs[Math.floor(Math.random() * pattern.freqs.length)];
    }
    osc.frequency.value = freq;

    const layer = this.layers.get(elementId);
    const layerGainValue = layer ? layer.gainNode.gain.value : 1;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(pattern.gain * layerGainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + pattern.duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    if (this.delayNode && (elementId === 'coral' || elementId === 'shell')) {
      gain.connect(this.delayNode);
    }

    osc.start(now);
    osc.stop(now + pattern.duration + 0.01);
  }

  private startLayerLoop(elementId: string): number {
    const pattern = LAYER_PATTERNS[elementId];
    if (!pattern) return 0;

    // Play first note immediately
    this.playLayerNote(elementId, pattern);

    // Schedule repeating
    const timerId = window.setInterval(() => {
      if (!this.isGenesis) {
        this.playLayerNote(elementId, pattern);
      }
    }, pattern.interval);

    return timerId;
  }

  public previewLayer(elementId: string) {
    if (!this.ctx || !this.masterGain) return;

    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const pattern = LAYER_PATTERNS[elementId];
    if (!pattern) return;

    // Play a few notes as preview (~2s)
    const count = Math.max(1, Math.floor(2000 / pattern.interval));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.isMuted) {
          this.playLayerNote(elementId, pattern);
        }
      }, i * pattern.interval);
    }
  }

  public awakenLayer(elementId: string) {
    if (!this.ctx || !this.masterGain) return;
    if (this.layers.has(elementId)) return; // Already awakened

    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Start drone on first awakened element
    if (!this.droneStarted) {
      this.startDrone();
    }

    // Create a gain node for this layer
    const layerGain = this.ctx.createGain();
    layerGain.gain.value = 1;
    layerGain.connect(this.masterGain);

    const timerId = this.startLayerLoop(elementId);

    this.layers.set(elementId, {
      elementId,
      timerId,
      gainNode: layerGain,
      isActive: true,
    });
  }

  public stopAllLayers() {
    this.layers.forEach(layer => {
      if (layer.timerId !== null) {
        clearInterval(layer.timerId);
      }
      layer.gainNode.disconnect();
    });
    this.layers.clear();
  }

  public triggerGenesis() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.isGenesis) return;
    this.isGenesis = true;

    // Stop all layer loops first
    this.stopAllLayers();

    const now = this.ctx.currentTime;

    // 1. Shift Drone to a bright C Major (C3, G3)
    this.droneOscillators.forEach((osc, i) => {
      const targetFreq = i === 0 ? 130.81 : 196.00;
      osc.frequency.setTargetAtTime(targetFreq, now, 0.5);
    });
    // Increase drone volume for genesis
    this.droneGains.forEach(g => {
      g.gain.setTargetAtTime(0.12, now, 0.3);
    });

    // 2. Massive "SuperSaw" Swell (C Major Chord)
    const chord = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    chord.forEach((freq) => {
      for(let j=0; j<3; j++) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq + (Math.random() * 6 - 3);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 8.0);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        if (this.delayNode) gain.connect(this.delayNode);

        osc.start(now);
        osc.stop(now + 8.0);
      }
    });

    // 3. Triumphant Melody (C Lydian)
    const melody = [
      { f: 523.25, t: 0.0, d: 0.5 },
      { f: 587.33, t: 0.5, d: 0.5 },
      { f: 659.25, t: 1.0, d: 0.5 },
      { f: 783.99, t: 1.5, d: 0.5 },
      { f: 1046.50, t: 2.0, d: 1.0 },
      { f: 1174.66, t: 3.0, d: 0.5 },
      { f: 1318.51, t: 3.5, d: 4.0 },
    ];

    melody.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = note.f;

      const startTime = now + note.t;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      if (this.delayNode) gain.connect(this.delayNode);

      osc.start(startTime);
      osc.stop(startTime + note.d);
    });

    // 4. Sparkling Arpeggios (Fast 16th notes)
    const arpNotes = [523.25, 659.25, 783.99, 1046.50];
    for (let i = 0; i < 64; i++) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';

      const octaveMult = i > 31 ? 2 : 1;
      osc.frequency.value = arpNotes[i % arpNotes.length] * octaveMult;

      const startTime = now + (i * 0.125);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.04, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      if (this.delayNode) gain.connect(this.delayNode);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
       this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
