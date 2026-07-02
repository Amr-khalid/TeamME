import confetti from 'canvas-confetti';

export function triggerConfetti(options = {}) {
  try {
    const count = options.count || 60;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 2000,
      colors: ['#7c3aed', '#2563eb', '#00f0ff', '#fbbf24', '#ec4899', '#10b981'],
    };

    confetti({
      ...defaults,
      ...options,
      particleCount: count,
      spread: 70,
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}

export function triggerVictoryCelebration() {
  try {
    const end = Date.now() + 1.8 * 1000;
    const colors = ['#f59e0b', '#fbbf24', '#7c3aed', '#38bdf8', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 2000,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 2000,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {}
}
