/* ============================================================
   YMS Banjaluka — Main JavaScript
   ============================================================ */

const nav = document.querySelector('.nav');
const hasTransparentHero = document.querySelector('.hero-video-bg') !== null;

if (nav) {
  if (hasTransparentHero) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  } else {
    nav.classList.add('scrolled');
  }
}

const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  const href = (link.getAttribute('href') || '').split('#')[0];
  if (href && href === currentPath) link.classList.add('active');
});

const hamburger = document.querySelector('.nav__hamburger');
const mobileNav  = document.querySelector('.nav__mobile');
const mobileClose = document.querySelector('.nav__mobile-close');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
}
if (mobileClose) {
  mobileClose.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const buttons = [...container.querySelectorAll('.tab-btn')];
  const panels  = [...container.querySelectorAll('.tab-panel')];

  function activate(index) {
    buttons.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    buttons[index]?.classList.add('active');
    panels[index]?.classList.add('active');
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      activate(i);
      const id = panels[i]?.id;
      if (id) history.replaceState(null, '', '#' + id);
    });
  });

  function activateFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const idx = panels.findIndex(p => p.id === hash);
    if (idx >= 0) activate(idx);
  }

  activateFromHash();
  window.addEventListener('hashchange', activateFromHash);
}
initTabs('.programs-tabs');

function showHeroFallback() {
  const fallback = document.querySelector('.hero-fallback');
  const videoBg  = document.querySelector('.hero-video-bg');
  if (fallback) { fallback.style.opacity = '1'; fallback.style.display = 'block'; }
  if (videoBg)  videoBg.style.display = 'none';
}

function initHeroPlayer() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    showHeroFallback();
    return;
  }

  video.muted = true;
  video.playsInline = true;
  video.addEventListener('error', showHeroFallback);
  video.play().catch(showHeroFallback);
}

initHeroPlayer();

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current.toLocaleString('hr-HR') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

function bindAjaxForm(form, sendingLabel, okLabel) {
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = sendingLabel;
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      btn.textContent = response.ok ? okLabel : 'Greška pri slanju ✕';
      if (response.ok) form.reset();
    } catch (error) {
      btn.textContent = 'Greška pri slanju ✕';
    }

    setTimeout(() => {
      btn.textContent = original;
      btn.style.opacity = '';
      btn.disabled = false;
    }, 4000);
  });
}

bindAjaxForm(document.querySelector('.contact-form'), 'Šalje se...', 'Poruka poslata ✓');
bindAjaxForm(document.querySelector('.newsletter-form'), 'Šalje se...', 'Pretplaćeni ✓');

(function() {
  const track = document.getElementById('mentorCarousel');
  if (!track) return;

  let speed = 28;
  let paused = false;

  function setSpeed(s) {
    speed = Math.max(10, Math.min(60, s));
    track.style.animationDuration = speed + 's';
  }

  document.getElementById('carouselSlow')?.addEventListener('click', () => setSpeed(speed + 8));
  document.getElementById('carouselFast')?.addEventListener('click', () => setSpeed(speed - 8));
  document.getElementById('carouselPause')?.addEventListener('click', () => {
    paused = !paused;
    track.style.animationPlayState = paused ? 'paused' : 'running';
    const btn = document.getElementById('carouselPause');
    btn.innerHTML = paused
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  });
})();
