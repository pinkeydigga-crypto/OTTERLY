// Web Audio API helper functions (Bina kisi external MP3 file load kiye mast sounds)

export const playSpinFinishSound = () => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playNote(523.25, 0, 0.15); // C5
    playNote(659.25, 0.12, 0.15); // E5
    playNote(783.99, 0.24, 0.3); // G5
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playCelebrationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const notes = [
      { freq: 523.25, time: 0, duration: 0.12 },    // C5
      { freq: 659.25, time: 0.1, duration: 0.12 },  // E5
      { freq: 783.99, time: 0.2, duration: 0.12 },  // G5
      { freq: 1046.50, time: 0.35, duration: 0.5 }  // C6 (Grand finish)
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0.4, ctx.currentTime + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.duration);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
};