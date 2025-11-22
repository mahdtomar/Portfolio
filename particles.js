/*****************************************
 * CONFIGURATION
 *****************************************/
const FPS_TARGET = 60;
const BLOCK_SIZE = 100; // pixels per side
const BASE_DENSITY = 4; // particles per 100x100 area

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// Particle color follows CSS variable '--text' for theme awareness
let particleColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--text')
  .trim() || '#111111';

// Update color when theme class toggles
const themeObserver = new MutationObserver(() => {
  particleColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text')
    .trim() || '#111111';
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;

let particles = [];
let lastTime = performance.now();
// let fpsSmooth = 60; // no longer required for density control

const mouse = { x: -9999, y: -9999 };

function computeTargetCount() {
  // 4 particles per 100x100 area, scaled by viewport area
  return Math.max(0, Math.round((W * H) / (BLOCK_SIZE * BLOCK_SIZE) * BASE_DENSITY));
}

function syncParticleCountToTarget(target) {
  // Adjust gradually to avoid large frame spikes
  if (particles.length < target) {
    const add = Math.min(target - particles.length, 64);
    for (let i = 0; i < add; i++) particles.push(new Particle());
  } else if (particles.length > target) {
    const remove = Math.min(particles.length - target, 64);
    particles.splice(particles.length - remove, remove);
  }
}

/*****************************************
 * RESIZE
 *****************************************/
addEventListener("resize", () => {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  // Re-sync particle count to new viewport area
  syncParticleCountToTarget(computeTargetCount());
});

/*****************************************
 * PARTICLE CLASS
 *****************************************/
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;

    // soft initial drift
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;

    this.hoverSpeed = 0.002 + Math.random() * 0.004;  // natural hovering motion
    this.hoverAngle = Math.random() * Math.PI * 2;
  }

  update(delta) {
    /* -------------------------------------------
       1) SUBTLE HOVER / FLOATING BEHAVIOR
       ------------------------------------------- */
    this.hoverAngle += this.hoverSpeed * delta;
    this.vx += Math.cos(this.hoverAngle) * 0.005 * delta;
    this.vy += Math.sin(this.hoverAngle) * 0.005 * delta;

    /* -------------------------------------------
       2) CURSOR REPULSION
       ------------------------------------------- */
    let dx = this.x - mouse.x;
    let dy = this.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 90) {
      const force = (90 - dist) / 90;
      this.vx += (dx / dist) * force * 0.8 * delta;
      this.vy += (dy / dist) * force * 0.8 * delta;
    }

    /* -------------------------------------------
       3) SOFT PARTICLE-TO-PARTICLE REPULSION
       prevents clumping / sticking
       ------------------------------------------- */
    for (let p of particles) {
      if (p === this) continue;

      let ddx = this.x - p.x;
      let ddy = this.y - p.y;
      let d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d > 0 && d < 20) {   // very short distance repulsion
        const rep = (20 - d) / 20;
        this.vx += (ddx / d) * rep * 0.02 * delta; // tiny repulsion
        this.vy += (ddy / d) * rep * 0.02 * delta;
      }
    }

    /* -------------------------------------------
       4) MOVEMENT / FRICTION
       ------------------------------------------- */
    this.vx *= 0.97;
    this.vy *= 0.97;

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Wrap edges
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = 0.2; // softer visibility across themes
    ctx.fillStyle = particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/*****************************************
 * INIT PARTICLES
 *****************************************/
function initParticles() {
  particles = [];
  const target = computeTargetCount();
  for (let i = 0; i < target; i++) particles.push(new Particle());
}
initParticles();

/*****************************************
 * MOUSE
 *****************************************/
addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/*****************************************
 * ANIMATION LOOP (144HZ SAFE)
 *****************************************/
function animate(now) {
  let delta = (now - lastTime) / (1000 / FPS_TARGET);
  lastTime = now;

  // Keep particle count proportional to screen area
  syncParticleCountToTarget(computeTargetCount());

  ctx.clearRect(0, 0, W, H);

  for (let p of particles) {
    p.update(delta);
    p.draw();
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
