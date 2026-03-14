class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private isInitialized = false;
  private isMuted = false;
  private currentEpoch = 0;
  private nextNoteTime = 0;
  private timerID: number | null = null;
  private isGenesis = false;
  private droneOscillators: OscillatorNode[] = [];

  // C Minor Pentatonic: C, Eb, F, G, Bb
  private scale = [261.63, 311.13, 349.23, 392.00, 466.16];

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
    this.delayNode.delayTime.value = 0.4; // 400ms delay
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.3;
    
    this.delayNode.connect(feedback);
    feedback.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);
    
    this.isInitialized = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
    
    this.startDrone();
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;
    
    // Deep aquatic drone
    const freqs = [65.41, 98.00]; // C2, G2
    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.value = 0.1;
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  private scheduler = () => {
    if (!this.ctx || !this.masterGain) return;
    if (this.isGenesis) return; // Stop normal random notes when genesis triggers
    
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleNote(this.nextNoteTime);
      this.nextNoteTime += this.getNoteDuration();
    }
    
    this.timerID = window.setTimeout(this.scheduler, 25.0);
  }

  private getNoteDuration() {
    switch (this.currentEpoch) {
      case 0: return 2.0;
      case 1: return Math.random() > 0.5 ? 0.125 : 0.25; // Fast, chaotic
      case 2: return 0.5; // Steady
      case 3: return 0.25; // Faster, structured
      case 4: return 0.25; // Complex
      default: return 0.5;
    }
  }

  private scheduleNote(time: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    // Probability of playing a note increases with epoch
    const probability = this.currentEpoch === 0 ? 0.1 : 0.3 + (this.currentEpoch * 0.15);
    if (Math.random() > probability) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
    
    // Octave shifts
    let octave = 1;
    if (this.currentEpoch === 1) octave = Math.random() > 0.5 ? 2 : 4; // Erratic
    else if (this.currentEpoch >= 3) octave = Math.random() > 0.7 ? 4 : 2; // Higher energy
    else octave = 2;
    
    osc.frequency.value = freq * octave;
    
    // Waveform and envelope based on epoch
    if (this.currentEpoch === 1) {
      osc.type = 'square';
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.02, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    } else if (this.currentEpoch === 2) {
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    } else {
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(time);
    osc.stop(time + 1.0);
  }

  public triggerGenesis() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.isGenesis = true;

    const now = this.ctx.currentTime;

    // 1. Shift Drone to a bright C Major (C3, G3)
    this.droneOscillators.forEach((osc, i) => {
      const targetFreq = i === 0 ? 130.81 : 196.00;
      osc.frequency.setTargetAtTime(targetFreq, now, 0.5);
    });

    // 2. Massive "SuperSaw" Swell (C Major Chord)
    const chord = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    chord.forEach((freq) => {
      for(let j=0; j<3; j++) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq + (Math.random() * 6 - 3); // Detune for thickness
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1); // Fast attack (burst)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 8.0); // Long decay
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        if (this.delayNode) gain.connect(this.delayNode);
        
        osc.start(now);
        osc.stop(now + 8.0);
      }
    });

    // 3. Triumphant Melody (C Lydian)
    const melody = [
      { f: 523.25, t: 0.0, d: 0.5 },  // C5
      { f: 587.33, t: 0.5, d: 0.5 },  // D5
      { f: 659.25, t: 1.0, d: 0.5 },  // E5
      { f: 783.99, t: 1.5, d: 0.5 },  // G5
      { f: 1046.50, t: 2.0, d: 1.0 }, // C6
      { f: 1174.66, t: 3.0, d: 0.5 }, // D6
      { f: 1318.51, t: 3.5, d: 4.0 }, // E6 (Long hold)
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
    const arpNotes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    for (let i = 0; i < 64; i++) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      
      // Go up an octave halfway through
      const octaveMult = i > 31 ? 2 : 1;
      osc.frequency.value = arpNotes[i % arpNotes.length] * octaveMult;
      
      const startTime = now + (i * 0.125); // 8 notes per second
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

  public setEpoch(epoch: number) {
    this.currentEpoch = epoch;
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
