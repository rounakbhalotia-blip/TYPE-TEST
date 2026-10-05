/**
 * TypePulse - Particle & FX Engine
 * High performance canvas particles for typing sparks, confetti, and screen shake.
 */

class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.confettiParticles = [];
    this.mode = 'sparks'; // 'sparks', 'confetti', 'orbs', 'off'
    this.colorPalette = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    this.isRunning = false;
  }

  init(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColorPalette(palette) {
    if (Array.isArray(palette) && palette.length > 0) {
      this.colorPalette = palette;
    }
  }

  spawnAtCaret(x, y) {
    if (this.mode === 'off' || !this.ctx) return;

    const count = this.mode === 'confetti' ? 4 : 5;
    const color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * Math.random());
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x + (Math.random() * 4 - 2),
        y: y + (Math.random() * 4 - 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 1.5),
        size: Math.random() * 3 + 1.5,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.04 + 0.025,
        type: this.mode
      });
    }
  }

  triggerConfettiStorm() {
    if (!this.ctx) return;
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.width,
        y: -20 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        size: Math.random() * 8 + 6,
        color: this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        alpha: 1,
        decay: 0.005 + Math.random() * 0.005
      });
    }
  }

  startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render keypress particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // subtle gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.size, p.size * 0.7);
      } else if (p.type === 'orbs') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      } else {
        // sparks
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 4;
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // Render celebration confetti
    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const cp = this.confettiParticles[i];
      cp.x += cp.vx + Math.sin(cp.wobble) * 1.5;
      cp.y += cp.vy;
      cp.wobble += 0.08;
      cp.rotation += cp.rotationSpeed;
      cp.alpha -= cp.decay;

      if (cp.y > this.height + 20 || cp.alpha <= 0) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, cp.alpha);
      this.ctx.translate(cp.x, cp.y);
      this.ctx.rotate((cp.rotation * Math.PI) / 180);
      this.ctx.fillStyle = cp.color;
      this.ctx.fillRect(-cp.size / 2, -cp.size / 2, cp.size, cp.size * 0.6);
      this.ctx.restore();
    }
  }

  // Juice: Screen shake effect
  shakeElement(element, intensity = 4) {
    if (!element) return;
    const x = (Math.random() - 0.5) * intensity * 2;
    const y = (Math.random() - 0.5) * intensity * 2;
    element.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => {
      element.style.transform = 'translate(0px, 0px)';
    }, 60);
  }
}

const FX = new ParticleEngine();
