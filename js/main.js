/* ============================================================
   YMS BiH — Main JavaScript
   ============================================================ */

/* ---- Nav scroll effect ------------------------------------ */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ---- Active nav link -------------------------------------- */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link, .nav__dropdown-item').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href === currentPath) link.classList.add('active');
});

/* ---- Mobile nav ------------------------------------------- */
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

/* ---- Scroll reveal ---------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- Tab switcher ----------------------------------------- */
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const buttons = container.querySelectorAll('.tab-btn');
  const panels  = container.querySelectorAll('.tab-panel');

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panels[i]?.classList.add('active');
    });
  });
}
initTabs('.programs-tabs');

/* ---- YouTube background video ----------------------------- */

function showHeroFallback() {
  const fallback = document.querySelector('.hero-fallback');
  const videoBg  = document.querySelector('.hero-video-bg');
  if (fallback) { fallback.style.opacity = '1'; fallback.style.display = 'block'; }
  if (videoBg)  videoBg.style.display = 'none';
}

function initYouTubeHero() {
  const heroEl = document.querySelector('.hero');
  if (!heroEl || !heroEl.dataset.ytid) return;

  const videoId = heroEl.dataset.ytid;

  // Load YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  // Safety net: if the API hasn't fired within 6 s, show the fallback
  const safetyTimer = setTimeout(showHeroFallback, 6000);

  window.onYouTubeIframeAPIReady = function() {
    clearTimeout(safetyTimer);

    const ytPlayer = new YT.Player('ytplayer', {
      videoId: videoId,
      playerVars: {
        autoplay:        1,
        mute:            1,
        loop:            1,
        playlist:        videoId,
        controls:        0,
        showinfo:        0,
        rel:             0,
        iv_load_policy:  3,
        modestbranding:  1,
        disablekb:       1,
        playsinline:     1,
      },
      events: {
        onReady: e => {
          e.target.playVideo();
          // Safety: if state=1 never fires (some browsers), reveal after 3s anyway
          setTimeout(revealVideo, 3000);
        },
        onError: () => showHeroFallback(),
        onStateChange: e => {
          // State 1 = playing, state 3 = buffering (video data received — safe to show)
          if (e.data === 1 || e.data === 3) revealVideo();
          if (e.data === 0) e.target.playVideo();
        }
      }
    });

    function revealVideo() {
      const iframe   = document.getElementById('ytplayer');
      const fallback = document.querySelector('.hero-fallback');
      if (iframe)   iframe.classList.add('playing');
      if (fallback) fallback.style.opacity = '0';
    }
  };
}

// Load video everywhere except when user prefers reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768;
if (!prefersReduced) {
  initYouTubeHero();
} else {
  document.addEventListener('DOMContentLoaded', showHeroFallback);
}

/* ---- Smooth counter animation ----------------------------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
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

/* ---- Contact form (placeholder) --------------------------- */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Poruka poslana ✓';
    btn.style.opacity = '0.7';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.opacity = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

/* ---- Video showcase — featured player swap (Option 1) ----- */
(function() {
  const player   = document.getElementById('featuredPlayer');
  const titleEl  = document.getElementById('featuredTitle');
  const playlist = document.getElementById('showcasePlaylist');
  if (!player || !playlist) return;

  playlist.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const videoId = item.dataset.video;
      const title   = item.dataset.title;

      // Swap iframe src with autoplay
      player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

      // Update title
      if (titleEl) titleEl.textContent = title;

      // Update active state
      playlist.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Scroll item into view within playlist
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
})();

/* ---- Mentor carousel controls ----------------------------- */
(function() {
  const track = document.getElementById('mentorCarousel');
  if (!track) return;

  let speed = 28; // seconds (CSS animation-duration)
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

/* ---- Cursor glow (desktop only) --------------------------- */
if (!isMobile) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(79,110,247,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}
