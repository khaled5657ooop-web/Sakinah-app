// Shared singleton AudioContext for gentle wooden bead feedback without leaking browser audio contexts

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) return null;

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // Ignore autoplay resume rejection before user gesture settles
    });
  }

  return sharedAudioContext;
}

export function playSoftBeadClick(frequencyHz: number = 480): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequencyHz, now);
    osc.frequency.exponentialRampToValueAtTime(frequencyHz * 0.5, now + 0.075);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Web Audio unavailable or blocked
  }
}
