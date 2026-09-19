// Minimalist Web Audio & Web Speech Synthesizer
// Bulletproof for iframes, sandboxed browsers, and mobile devices

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private voicesLoaded: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private voicesInitAttempted: boolean = false;

  constructor() {
    // Delay voice and audio context initialization to avoid iframe security blocks at startup
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Ignore audio policy restriction
    }
  }

  private initVoices() {
    if (this.voicesInitAttempted || typeof window === 'undefined') return;
    this.voicesInitAttempted = true;

    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        const load = () => {
          try {
            this.availableVoices = window.speechSynthesis.getVoices() || [];
            this.voicesLoaded = true;
          } catch (e) {}
        };
        load();
        try {
          if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = load;
          }
        } catch (e) {}
      }
    } catch (e) {
      // Speech synthesis blocked in iframe
    }
  }

  public setSoundFx(enabled: boolean) {
    this.isMuted = !enabled;
  }

  public setVoice(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  // Play satisfying minimal click sound
  public playClick(combo: number = 1, color: string = 'blue') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch rises subtly with combo
      const baseFreq = color === 'green' ? 620 : 540;
      const freq = Math.min(1400, baseFreq + Math.min(combo * 14, 400));

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio not permitted yet or unsupported
    }
  }

  // Subtle whoosh for straight line detection
  public playStraightLine() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Achievement unlock chime
  public playAchievementUnlock(tier: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = tier === 'diamond' || tier === 'platinum'
        ? [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        : [587.33, 739.99, 880.00];         // D5, F#5, A5

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.15, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.35);
      });
    } catch (e) {}
  }

  // Voice narration using Web Speech API
  public speak(text: string, langPreference: string = 'auto', onEnd?: () => void) {
    if (!this.voiceEnabled || typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    try {
      this.initVoices();

      if (!('speechSynthesis' in window) || !window.speechSynthesis) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);

      // Determine target language
      let targetLang = 'th-TH';
      if (langPreference === 'en') {
        targetLang = 'en-US';
      } else if (langPreference === 'auto') {
        const deviceLang = (typeof navigator !== 'undefined' && navigator.language) || 'th-TH';
        targetLang = deviceLang.startsWith('th') ? 'th-TH' : 'en-US';
      }

      utterance.lang = targetLang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Pick matching voice
      if (this.availableVoices.length === 0) {
        try {
          this.availableVoices = window.speechSynthesis.getVoices() || [];
        } catch (e) {}
      }

      const match = this.availableVoices.find(v => v.lang && v.lang.replace('_', '-').startsWith(targetLang.slice(0, 2)));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        onEnd?.();
      };
      utterance.onerror = () => {
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Speech] Error speaking:', e);
      onEnd?.();
    }
  }

  public stopSpeaking() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }
}

export const audio = new AudioManager();
