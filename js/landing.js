const tournamentDate = new Date('2026-10-15T18:00:00+05:30').getTime();

function updateCountdown() {
  const diff = tournamentDate - Date.now();

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p class="live">Tournament is live</p>';
    clearInterval(countdownTimer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('secs').textContent = String(secs).padStart(2, '0');
}

const countdownTimer = setInterval(updateCountdown, 1000);
updateCountdown();  

function countUp(element) {
  const target = Number(element.dataset.target);   
  const duration = 1500;                         
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);   
    const value = Math.floor(progress * target);
    element.textContent = '₹' + value.toLocaleString('en-IN');  
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const prizeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      prizeObserver.unobserve(entry.target); 
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.prize-amount').forEach((el) => prizeObserver.observe(el));

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function createParticles() {
  particles = [];
  const count = window.innerWidth < 768 ? 35 : 70;  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,   
      vy: (Math.random() - 0.5) * 0.6,   
      r: Math.random() * 2 + 1        
    });
  }
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;   
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;   

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);  
      if (distance < 120) {
        ctx.strokeStyle = `rgba(255, 46, 136, ${0.4 * (1 - distance / 120)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

resizeCanvas();
createParticles();
if (!reduceMotion) {
  drawParticles();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});