class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a clean click/touch sound
  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      // Quick pitch drop creates a nice 'pop' click sound
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Click sound failed:", e);
    }
  }

  // Play a pleasant double-chime notification sound
  playNotification() {
    try {
      this.init();
      const playTone = (freq, time, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = this.ctx.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.1, 0.35); // E5
    } catch (e) {
      console.warn("Notification sound failed:", e);
    }
  }

  // Play a rising coin success/money transfer sound (like a cash register)
  playSuccess() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      const playCoin = (time, freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
      };

      // Play 3 rising metallic coin notes
      playCoin(now, 880.00);       // A5
      playCoin(now + 0.08, 1174.66); // D6
      playCoin(now + 0.16, 1396.91); // F6
      playCoin(now + 0.24, 1760.00); // A6
    } catch (e) {
      console.warn("Success sound failed:", e);
    }
  }

  // Play a double low buzz error sound
  playError() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      const playTone = (time) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.linearRampToValueAtTime(0.001, time + 0.12);
        osc.start(time);
        osc.stop(time + 0.12);
      };

      playTone(now);
      playTone(now + 0.14);
    } catch (e) {
      console.warn("Error sound failed:", e);
    }
  }
}

export const sounds = new SoundEffects();
