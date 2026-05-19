const header = document.querySelector("[data-header]");
const canvas = document.querySelector("#hero-canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const revealTargets = [
  ...document.querySelectorAll(".section-heading, .service-card, .timeline article, .process-row article, .contact-band")
];

let width = 0;
let height = 0;
let particles = [];
let rafId = 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  buildParticles();
}

function buildParticles() {
  const count = width < 720 ? 46 : 78;
  particles = Array.from({ length: count }, (_, index) => {
    const lane = index % 5;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: 1.2 + Math.random() * 2.8,
      hue: lane === 0 ? "#0a4a3f" : lane === 1 ? "#638973" : lane === 2 ? "#a77545" : "#ded9d3",
      alpha: 0.16 + Math.random() * 0.36
    };
  });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f6f3f0");
  gradient.addColorStop(0.48, "#eee9e3");
  gradient.addColorStop(1, "#fbf8f5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(18, 20, 23, 0.035)";
  ctx.lineWidth = 1;
  const spacing = width < 720 ? 42 : 62;
  for (let x = 0; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i += 1) {
    const current = particles[i];
    for (let j = i + 1; j < particles.length; j += 1) {
      const next = particles[j];
      const dx = current.x - next.x;
      const dy = current.y - next.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 128) {
        ctx.strokeStyle = `rgba(10, 74, 63, ${0.085 * (1 - distance / 128)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  particles.forEach((particle) => {
    if (!reducedMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    ctx.fillStyle = particle.hue;
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function animate() {
  drawBackground();
  drawConnections();
  drawParticles();
  if (!reducedMotion) {
    rafId = requestAnimationFrame(animate);
  }
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 36);
}

function setupReveals() {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateHeader, { passive: true });

setupReveals();
resizeCanvas();
updateHeader();
animate();

if (reducedMotion && rafId) {
  cancelAnimationFrame(rafId);
}
