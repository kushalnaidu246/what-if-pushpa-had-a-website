/**
 * PUSHPA RAJ SYNDICATE — CORE INTERACTIVE APPLICATION
 * Ambient Canvas, Web Audio Synthesizer, Radar HUD, ID Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initSoundEngine();
  initRadarSystem();
  initPassGenerator();
  initThaggedheModal();
  initMarketTickerFluctuation();
  initHeroParallaxDepth();
  initStyleLayer();
});

/* ==========================================================================
   1. AMBIENT BACKGROUND EMBER PARTICLES CANVAS
   ========================================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  const particles = [];
  const particleCount = window.innerWidth < 768 ? 30 : 60;
  const palette = [
    { fill: 'rgba(229, 56, 59,', glow: '#e5383b' },
    { fill: 'rgba(212, 175, 55,', glow: '#d4af37' }
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 0.8,
      speedY: Math.random() * 0.9 + 0.3,
      speedX: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.7 + 0.2,
      tone: Math.random() > 0.4 ? palette[0] : palette[1]
    });
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(render);
  });

  function render() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10 || p.x < -10 || p.x > width + 10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.tone.fill} ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.tone.glow;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. CINEMATIC WEB AUDIO SYNTHESIZER & SOUNDBOARD
   ========================================================================== */
let audioCtx = null;
let isAudioActive = false;
let ambientNoiseNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function initSoundEngine() {
  const toggleBtn = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioLabel = document.getElementById('audio-label');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      isAudioActive = !isAudioActive;
      if (isAudioActive) {
        audioIcon.textContent = '🔊';
        audioLabel.textContent = 'ATMOSPHERE: ACTIVE';
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.style.borderColor = '#52b788';
        startAmbientAtmosphere(ctx);
        playAxeStrikeSound();
      } else {
        audioIcon.textContent = '🔇';
        audioLabel.textContent = 'ATMOSPHERE: OFF';
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.style.borderColor = 'rgba(229, 56, 59, 0.4)';
        stopAmbientAtmosphere();
      }
    });
  }
}

function startAmbientAtmosphere(ctx) {
  if (ambientNoiseNode) return; // never stack multiple noise loops
  try {
    // Generate gentle deep forest wind / fire crackle buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Brown noise (integrated white noise) for deep wind rumble
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 160;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    ambientNoiseNode = { noise, gain };
  } catch (err) {
    console.warn('Ambient audio could not start:', err);
  }
}

function stopAmbientAtmosphere() {
  if (ambientNoiseNode && ambientNoiseNode.noise) {
    try {
      ambientNoiseNode.noise.stop();
    } catch (e) {}
    ambientNoiseNode = null;
  }
}

/**
 * Realistic Synthesized Sounds (Heavy Iron Strike, Deep Dhol Bass, Sub Rumble)
 */
function playAxeStrikeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Heavy Metallic Clang Oscillator
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

  oscGain.gain.setValueAtTime(0.6, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);

  // 2. Heavy Sub Bass Thud (Impact)
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(120, now);
  sub.frequency.exponentialRampToValueAtTime(35, now + 0.45);

  subGain.gain.setValueAtTime(0.9, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.6);
}

function playSubWarHorn() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(65, now);
  osc.frequency.linearRampToValueAtTime(75, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(45, now + 1.8);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.8, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 350;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.8);
}

function playRadarPingSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

/* ==========================================================================
   3. TACTICAL RADAR SYSTEM
   ========================================================================== */
function initRadarSystem() {
  const nodes = document.querySelectorAll('.map-node');
  const pingBtn = document.getElementById('btn-ping-convoy');

  nodes.forEach((node) => {
    const activate = () => {
      playRadarPingSound();
      const nodeName = node.getAttribute('data-node');
      const tooltip = node.querySelector('.node-tooltip strong')?.textContent;
      node.setAttribute('aria-label', tooltip || nodeName);
      showToast(`Tactical Telemetry: ${tooltip || nodeName} checked`);
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  if (pingBtn) {
    pingBtn.addEventListener('click', () => {
      if (pingBtn.dataset.busy) return;
      pingBtn.dataset.busy = '1';
      playRadarPingSound();
      pingBtn.textContent = 'PINGING SATELLITE...';
      pingBtn.style.borderColor = '#e5383b';
      setTimeout(() => {
        pingBtn.textContent = 'PING SUCCESS (LAT 13.6288° N)';
        pingBtn.style.borderColor = '#52b788';
        setTimeout(() => {
          pingBtn.textContent = 'PING CONVOY GPS';
          pingBtn.style.borderColor = '';
          delete pingBtn.dataset.busy;
        }, 2500);
      }, 700);
    });
  }
}

/* ==========================================================================
   4. SYNDICATE CLEARANCE ID PASS GENERATOR
   ========================================================================== */
function initPassGenerator() {
  const inName = document.getElementById('input-name');
  const inAlias = document.getElementById('input-codename');
  const selRole = document.getElementById('select-role');
  const selSector = document.getElementById('select-sector');
  const btnGenerate = document.getElementById('btn-generate-pass');
  const btnPrint = document.getElementById('btn-print-pass');
  const btnShare = document.getElementById('btn-share-pass');

  // Preview elements
  const cardName = document.getElementById('card-name');
  const cardAlias = document.getElementById('card-alias');
  const cardRole = document.getElementById('card-role');
  const cardSector = document.getElementById('card-sector');
  const cardSerial = document.getElementById('card-serial');
  const passCard = document.getElementById('syndicate-pass-card');

  function updateCard() {
    const nameVal = inName.value.trim() || 'OPERATIVE CLASSIFIED';
    const aliasVal = inAlias.value.trim() || 'SHADOW';
    const roleVal = selRole.value;
    const sectorVal = selSector.value;

    cardName.textContent = nameVal.toUpperCase();
    cardAlias.textContent = `"${aliasVal.toUpperCase()}"`;
    cardRole.textContent = roleVal.toUpperCase();
    cardSector.textContent = sectorVal.toUpperCase();
  }

  [inName, inAlias, selRole, selSector].forEach((input) => {
    if (input) {
      input.addEventListener('input', updateCard);
      input.addEventListener('change', updateCard);
    }
  });
  updateCard();

  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      playAxeStrikeSound();
      updateCard();

      // Generate random high-tier serial ID
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const chars = ['X', 'Z', 'T', 'K', 'R'];
      const randChar = chars[Math.floor(Math.random() * chars.length)];
      cardSerial.textContent = `PR-2026-${randNum}-${randChar}`;

      // Card animation punch
      if (passCard) {
        passCard.style.boxShadow = '0 0 50px rgba(229, 56, 59, 0.8), 0 0 70px rgba(212, 175, 55, 0.5)';
        passCard.style.transform = 'scale(1.02)';
        setTimeout(() => {
          passCard.style.boxShadow = '';
          passCard.style.transform = '';
        }, 600);
      }

      showToast(`Pass Minted for Operative ${inName.value.trim() || 'Classified'}`);
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const serial = cardSerial.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(serial).then(
          () => showToast(`Copied Serial: ${serial}`),
          () => showToast(`Serial: ${serial}`)
        );
      } else {
        showToast(`Serial: ${serial}`);
      }
    });
  }
}

/* ==========================================================================
   5. THAGGEDHE LE SPECIAL MODAL & CINEMATIC TRIGGER
   ========================================================================== */
function initThaggedheModal() {
  const triggerBtn = document.getElementById('btn-jhukega-special');
  const modal = document.getElementById('thaggedhe-modal');
  const closeBtn = document.getElementById('btn-close-modal');
  if (!triggerBtn || !modal) return;

  function openModal() {
    playSubWarHorn();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
    if ('vibrate' in navigator) {
      try { navigator.vibrate([150, 80, 200, 100, 300]); } catch (e) {}
    }
  }

  function closeModal(withToast) {
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    triggerBtn.focus();
    if (withToast) showToast('Pushpa Raj Syndicate: Loyalty Registered 🔥');
  }

  triggerBtn.addEventListener('click', openModal);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playAxeStrikeSound();
      closeModal(true);
    });
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal(false);
  });
}

/* ==========================================================================
   6. DYNAMIC RSX COMMODITY MARKET TICKER FLUCTUATION
   ========================================================================== */
function initMarketTickerFluctuation() {
  const timberPriceNav = document.getElementById('nav-timber-price');
  let basePrice = 1.45;

  setInterval(() => {
    // Subtle realistic market price tick
    const delta = (Math.random() - 0.45) * 0.04;
    basePrice = Math.max(1.2, basePrice + delta);
    const formatted = basePrice.toFixed(2);
    if (timberPriceNav) {
      timberPriceNav.textContent = `RAKTA CHANDANAM: ₹${formatted} Cr / MT`;
    }
  }, 4500);
}

/* ==========================================================================
   7. SIMPLE TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(msg) {
  let toast = document.getElementById('syndicate-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'syndicate-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.pointerEvents = 'none';
    toast.style.maxWidth = 'calc(100vw - 2rem)';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '1rem';
    toast.style.background = 'rgba(18, 14, 12, 0.95)';
    toast.style.border = '1px solid #d4af37';
    toast.style.color = '#fff';
    toast.style.fontFamily = "'Rajdhani', sans-serif";
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '700';
    toast.style.letterSpacing = '0.08em';
    toast.style.padding = '0.8rem 1.4rem';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.3)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
  }, 3200);
}

/* ==========================================================================
   8. DYNAMIC HERO PARALLAX DEPTH & 3D INTERACTION (NON-STATIC)
   ========================================================================== */
function initHeroParallaxDepth() {
  const heroSection = document.getElementById('hero-section');
  const bgMountains = document.getElementById('hero-bg-mountains');
  const cardInner = document.getElementById('visual-card-inner');
  const cardGlare = document.getElementById('visual-glare');
  const cornerLogs = document.getElementById('hero-corner-logs');

  if (!heroSection || !bgMountains || prefersReducedMotion) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let scrollY = window.scrollY;
  let rafId = 0;

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(updateParallax);
  }

  if (finePointer) {
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    schedule();
  }, { passive: true });

  function updateParallax() {
    rafId = 0;
    mouseX += (targetX - mouseX) * 0.07;
    mouseY += (targetY - mouseY) * 0.07;

    bgMountains.style.transform =
      `translate3d(${mouseX * -15}px, ${mouseY * -10 + Math.min(scrollY * 0.18, 80)}px, 0)`;

    if (cardInner) {
      cardInner.style.transform =
        `perspective(1000px) rotateX(${-mouseY * 6}deg) rotateY(${mouseX * 6}deg)`;
    }

    if (cardGlare) {
      const glareX = (mouseX + 1) * 50;
      const glareY = (mouseY + 1) * 50;
      cardGlare.style.opacity = '0.28';
      cardGlare.style.background =
        `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 235, 190, 0.25) 0%, transparent 60%)`;
    }

    if (cornerLogs) {
      cornerLogs.style.transform = `translate3d(${mouseX * 14}px, ${mouseY * 10}px, 0)`;
    }

    // Keep animating only until the lerp has settled
    if (Math.abs(targetX - mouseX) > 0.001 || Math.abs(targetY - mouseY) > 0.001) schedule();
  }

  schedule();
}


/* ==========================================================================
   9. STYLE LAYER: SCROLL PROGRESS, REVEALS, COUNT-UP, NAV SCROLLSPY
   ========================================================================== */
function initStyleLayer() {
  document.documentElement.classList.add('js');

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Reveal-on-scroll (staggered)
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.max(siblings.indexOf(el), 0) * 90}ms`;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // Stat count-up
  document.querySelectorAll('.stat-num').forEach((el) => {
    const text = el.textContent.trim();
    const m = text.match(/^([\d,.]+)(.*)$/);
    if (!m || prefersReducedMotion) return;
    const target = parseFloat(m[1].replace(/,/g, ''));
    const decimals = (m[1].split('.')[1] || '').length;
    const suffix = m[2];
    const useComma = m[1].includes(',');
    const fmt = (v) => {
      const n = v.toFixed(decimals);
      return (useComma ? Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals }) : n) + suffix;
    };
    el.textContent = fmt(0);
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = text;
    };
    setTimeout(() => requestAnimationFrame(tick), 300);
  });

  // Nav scrollspy
  const links = [...document.querySelectorAll('.nav-links a[data-spy]')];
  if (links.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('active', l.dataset.spy === entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => {
      const t = document.getElementById(l.dataset.spy);
      if (t) spy.observe(t);
    });
  }
}
