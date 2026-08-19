// Web Audio API ambient anime synthesizer & sound effects
let audioCtx: AudioContext | null = null;
let isPlayingAmbient = false;
let ambientNodes: { stop: () => void }[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAnimeClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Audio may be blocked before user gesture
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
    });
  } catch (e) {
    // Ignore
  }
}

export function playWrongChime() {
  try {
    const ctx = getAudioContext();
    const notes = [311.13, 277.18]; // Eb4, Db4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.25);
    });
  } catch (e) {
    // Ignore
  }
}

export function toggleLofiAtmosphere(onStateChange: (isPlaying: boolean) => void) {
  const ctx = getAudioContext();

  if (isPlayingAmbient) {
    ambientNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
    });
    ambientNodes = [];
    isPlayingAmbient = false;
    onStateChange(false);
    return;
  }

  try {
    isPlayingAmbient = true;
    onStateChange(true);

    // Warm Lo-Fi Anime chords (Emaj9 -> C#m7 -> Aadd9 -> Bsus4)
    const chordFrequencies = [
      [164.81, 196.00, 246.94, 293.66], // Em7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [146.83, 174.61, 220.00, 261.63]  // Dm7
    ];

    let currentChordIdx = 0;
    const interval = setInterval(() => {
      if (!isPlayingAmbient) {
        clearInterval(interval);
        return;
      }

      const freqs = chordFrequencies[currentChordIdx];
      currentChordIdx = (currentChordIdx + 1) % chordFrequencies.length;

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.0);
      });
    }, 4000);

    ambientNodes.push({
      stop: () => clearInterval(interval)
    });
  } catch (e) {
    isPlayingAmbient = false;
    onStateChange(false);
  }
}
