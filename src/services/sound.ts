/**
 * Audio Synthesis & Sound Effects Service
 * Uses Web Audio API for zero-latency, 100% offline procedural sound effects.
 * Also integrates Web Speech API for authentic word & sentence pronunciation.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved mute state
    const savedMute = localStorage.getItem('lexiquest_muted');
    this.isMuted = savedMute === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('lexiquest_muted', String(muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public vibrate(pattern: number | number[] = 40) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore vibration errors if blocked
      }
    }
  }

  /**
   * Mechanical tile tap / click
   */
  public playTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context error fallback
    }
  }

  /**
   * Rewarding chime that ascends in pitch as the combo streak increases!
   */
  public playCorrect(combo: number = 1) {
    this.vibrate(50);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const baseFreq = 523.25; // C5
      const semitoneStep = Math.min(combo - 1, 8) * 2;
      const freq1 = baseFreq * Math.pow(2, semitoneStep / 12);
      const freq2 = freq1 * 1.25; // Major third
      const freq3 = freq1 * 1.5;  // Fifth

      const now = this.ctx.currentTime;
      [freq1, freq2, freq3].forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);

        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Gentle, non-punitive incorrect feedback sound
   */
  public playWrong() {
    this.vibrate([60, 40, 60]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Streak milestone fanfare / sparkle
   */
  public playStreak() {
    this.vibrate([40, 80, 120]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 659.25, 783.99, 880.0, 1046.5]; // D5, E5, G5, A5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.38);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Victory / Round Complete fanfare
   */
  public playVictory() {
    this.vibrate([80, 50, 80, 50, 150]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.18 },      // C major
        { freqs: [587.33, 739.99, 880.0], time: 0.18, dur: 0.18 },    // D major
        { freqs: [659.25, 830.61, 987.77], time: 0.36, dur: 0.22 },   // E major
        { freqs: [783.99, 987.77, 1318.51], time: 0.58, dur: 0.6 },   // High G major
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + chord.time);

          gain.gain.setValueAtTime(0.14, now + chord.time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + chord.time);
          osc.stop(now + chord.time + chord.dur);
        });
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Web Speech API: Crystal clear speech pronunciation
   */
  public speak(text: string, rate: number = 0.88, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = 'en-US';

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Pronounce a word, followed optionally by an example sentence
   */
  public async pronounceWordWithContext(word: string, exampleSentence?: string, rate: number = 0.85) {
    await this.speak(word, rate);
    if (exampleSentence) {
      // Pause slightly, then speak the sentence
      setTimeout(() => {
        this.speak(exampleSentence, 0.95);
      }, 400);
    }
  }
}

export const sound = new SoundService();
