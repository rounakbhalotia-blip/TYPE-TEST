/**
 * TypePulse - Audio Engine (Procedural Web Audio API Synthesizer)
 * Zero external audio files required. Realistic mechanical clicks,
 * thocks, typewriters, bubbles, 8-bit blips, and feedback jingles.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundProfile = 'panda'; // 'blue', 'red', 'panda', 'typewriter', 'bubble', 'arcade', 'off'
    this.volume = 0.5;
    this.pitchVariation = true;
    this.playErrorSound = true;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setProfile(profile) {
    this.soundProfile = profile;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getRandomPitchOffset(amount = 0.08) {
    if (!this.pitchVariation) return 1;
    return 1 + (Math.random() * (amount * 2) - amount);
  }

  playKey(isSpace = false) {
    if (this.isMuted || this.soundProfile === 'off') return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitch = this.getRandomPitchOffset(0.06);

    switch (this.soundProfile) {
      case 'blue':
        this.playMechanicalBlue(t, pitch, isSpace);
        break;
      case 'red':
        this.playMechanicalRed(t, pitch, isSpace);
        break;
      case 'panda':
        this.playHolyPanda(t, pitch, isSpace);
        break;
      case 'typewriter':
        this.playTypewriter(t, pitch, isSpace);
        break;
      case 'bubble':
        this.playBubble(t, pitch, isSpace);
        break;
      case 'arcade':
        this.playArcade(t, pitch, isSpace);
        break;
      default:
        this.playHolyPanda(t, pitch, isSpace);
    }
  }

  // --- Profile: Mechanical Clicky (Cherry MX Blue) ---
  playMechanicalBlue(t, pitch, isSpace) {
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Noise burst for sharp click transient
    const bufferSize = this.ctx.sampleRate * 0.015;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    filter.type = 'highpass';
    filter.frequency.setValueAtTime((isSpace ? 2800 : 3600) * pitch, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35 * this.volume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t);

    // Resonant clack body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isSpace ? 180 : 260) * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.04);

    oscGain.gain.setValueAtTime(0.4 * this.volume, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- Profile: Smooth Linear (Cherry MX Red) ---
  playMechanicalRed(t, pitch, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const baseFreq = (isSpace ? 110 : 160) * pitch;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.038);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // --- Profile: Tactile Thock (Holy Panda) ---
  playHolyPanda(t, pitch, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const startFreq = (isSpace ? 140 : 210) * pitch;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, t);

    gain.gain.setValueAtTime(0.45 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);

    // Subtle bottom-out pop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90 * pitch, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.03);

    subGain.gain.setValueAtTime(0.35 * this.volume, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.035);
  }

  // --- Profile: Vintage Typewriter ---
  playTypewriter(t, pitch, isSpace) {
    // Metal punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.03);

    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);

    // Carriage bell on space
    if (isSpace) {
      this.playBell(t + 0.02);
    }
  }

  // Typewriter Bell
  playBell(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t); // A6 bell note

    gain.gain.setValueAtTime(0.22 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // --- Profile: Bubble Pop ---
  playBubble(t, pitch, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const baseFreq = (isSpace ? 400 : 650) * pitch;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.04);

    gain.gain.setValueAtTime(0.35 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- Profile: 8-Bit Arcade ---
  playArcade(t, pitch, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    const freq = (isSpace ? 330 : 520) * pitch;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.setValueAtTime(freq * 1.5, t + 0.02);

    gain.gain.setValueAtTime(0.18 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- Error Sound (Subtle dull thud / buzzer) ---
  playError() {
    if (this.isMuted || !this.playErrorSound) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.28 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // --- Streak Milestone Fanfare (ascending sweet chords) ---
  playStreakChime(comboLevel = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 440 * Math.min(2, 1 + comboLevel * 0.1);
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major triad

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.2 * this.volume, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.3);
    });
  }

  // --- Victory Fanfare on Completion ---
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.3 * this.volume, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + (idx === 3 ? 0.6 : 0.25));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + (idx === 3 ? 0.65 : 0.3));
    });
  }
}

// Global sound singleton
const Sound = new SoundEngine();
