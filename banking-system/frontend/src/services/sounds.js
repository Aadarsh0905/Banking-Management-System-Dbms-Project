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
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
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

  // Play a premium metallic coin spill / cash register sound effect
  playSuccess() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      // A single coin clink is composed of high-frequency inharmonic sine wave components
      const playCoinClink = (startTime) => {
        const frequencies = [850, 1075, 2200, 3300, 4400];
        frequencies.forEach((freq, index) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          // Higher frequencies decay much faster to simulate natural metal resonance
          const decay = 0.16 - (index * 0.02);
          const volume = 0.045 / (index + 1); // high frequencies are quieter
          
          gain.gain.setValueAtTime(volume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
          
          osc.start(startTime);
          osc.stop(startTime + decay);
        });
      };

      // Play 4 coin drops in quick, irregular succession to sound natural (like dropping a small pile of coins)
      playCoinClink(now);
      playCoinClink(now + 0.05);
      playCoinClink(now + 0.11);
      playCoinClink(now + 0.18);
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
